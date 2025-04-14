// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ValidatorService } from '@/_shared/_services/validator_service';
import { fetchWithTimeout } from '@/_shared/_utils/fetchWithTimeout';
import { getSubstrateAddress } from '@/_shared/_utils/getSubstrateAddress';
import { ENetwork, EProposalStatus, EProposalType, EVoteDecision, IOnChainPostInfo, IStatusHistoryItem, IVoteMetrics } from '@/_shared/types';
import { hexToString } from '@polkadot/util';

export class SubsquareOnChainService {
	private static postDetailsUrlMap = {
		[EProposalType.BOUNTY]: (id: string, network: ENetwork) => `https://${network}.subsquare.io/api/treasury/bounties/${id}`,
		[EProposalType.CHILD_BOUNTY]: (id: string, network: ENetwork) => `https://${network}.subsquare.io/api/treasury/child-bounties/${id}`,
		[EProposalType.COUNCIL_MOTION]: (id: string, network: ENetwork) => `https://${network}.subsquare.io/api/motions/${id}`,
		[EProposalType.DEMOCRACY_PROPOSAL]: (id: string, network: ENetwork) => `https://${network}.subsquare.io/api/democracy/proposals/${id}`,
		[EProposalType.FELLOWSHIP_REFERENDUM]: (id: string, network: ENetwork) => `https://${network}.subsquare.io/api/fellowship/referenda/${id}`,
		[EProposalType.REFERENDUM]: (id: string, network: ENetwork) => `https://${network}.subsquare.io/api/democracy/referendums/${id}`,
		[EProposalType.REFERENDUM_V2]: (id: string, network: ENetwork) => `https://${network}.subsquare.io/api/gov2/referendums/${id}`,
		[EProposalType.TECH_COMMITTEE_PROPOSAL]: (id: string, network: ENetwork) => `https://${network}.subsquare.io/api/tech-comm/motions/${id}`,
		[EProposalType.TIP]: (id: string, network: ENetwork) => `https://${network}.subsquare.io/api/treasury/tips/${id}`,
		[EProposalType.TREASURY_PROPOSAL]: (id: string, network: ENetwork) => `https://${network}.subsquare.io/api/treasury/proposals/${id}`
	};

	static async GetOnChainPostInfo({
		network,
		indexOrHash,
		proposalType
	}: {
		network: ENetwork;
		indexOrHash: string;
		proposalType: EProposalType;
	}): Promise<IOnChainPostInfo | null> {
		const mappedUrl = this.postDetailsUrlMap[proposalType as keyof typeof this.postDetailsUrlMap]?.(indexOrHash, network);

		if (!mappedUrl) {
			return null;
		}

		const data = await fetchWithTimeout(new URL(mappedUrl)).then((res) => res.json());

		if (!data || !data.onchainData) {
			return null;
		}

		const beneficiaries = data?.onchainData?.treasuryInfo?.beneficiaries
			? // eslint-disable-next-line @typescript-eslint/no-explicit-any
				data.onchainData.treasuryInfo.beneficiaries.map((beneficiary: any) => ({
					address: beneficiary.address,
					amount: beneficiary.amount || data.onchainData.treasuryInfo.amount,
					assetId: beneficiary.assetId || null
				}))
			: undefined;

		// Convert hex values to strings and extract vote metrics from tally data
		const voteMetrics: IVoteMetrics | undefined = data?.state?.args?.tally
			? {
					[EVoteDecision.AYE]: {
						count: 0,
						value: data.state.args.tally.ayes.toString()
					},
					[EVoteDecision.NAY]: {
						count: 0,
						value: data.state.args.tally.nays.startsWith('0x') ? hexToString(data.state.args.tally.nays) : data.state.args.tally.nays.toString()
					},
					support: {
						value: data.state.args.tally.support.toString()
					},
					bareAyes: {
						value: data.state.args.tally.ayes.toString()
					}
				}
			: undefined;

		const proposer = data?.proposer || data?.onchainData?.proposer || '';

		const timeline: IStatusHistoryItem[] =
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			data?.onchainData?.timeline?.map((event: any) => ({
				status: event.name as EProposalStatus,
				timestamp: new Date(event.indexer.blockTime),
				block: event.indexer.blockHeight
			})) || [];

		const onChainPostInfo: IOnChainPostInfo = {
			proposer: ValidatorService.isValidSubstrateAddress(proposer) ? getSubstrateAddress(proposer) || '' : '',
			status: data?.state?.name || data?.onchainData?.state?.name || EProposalStatus.Unknown,
			createdAt: data?.createdAt ? new Date(data?.createdAt) : undefined,
			origin: data?.onchainData?.info?.origin?.origins,
			index: data?.onchainData?.timeline?.[0]?.referendumIndex ?? undefined,
			hash: data?.onchainData?.timeline?.[0]?.args?.proposalHash || undefined,
			beneficiaries,
			voteMetrics,
			timeline
		};

		return onChainPostInfo;
	}

	static async GetBountyAmount(network: ENetwork, bountyId: string) {
		const url = this.postDetailsUrlMap[EProposalType.BOUNTY](bountyId, network);

		const data = await fetchWithTimeout(new URL(url)).then((res) => res.json());
		return data?.onchainData;
	}
}
