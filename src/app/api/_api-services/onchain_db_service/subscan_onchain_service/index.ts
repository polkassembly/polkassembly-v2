// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ERROR_CODES } from '@/_shared/_constants/errorLiterals';
import { ValidatorService } from '@/_shared/_services/validator_service';
import { dayjs } from '@/_shared/_utils/dayjsInit';
import { getSubstrateAddress } from '@/_shared/_utils/getSubstrateAddress';
import { ENetwork, EProposalType, IOnChainPostInfo } from '@/_shared/types';
import { SUBSCAN_API_KEY } from '@/app/api/_api-constants/apiEnvVars';
import { APIError } from '@/app/api/_api-utils/apiError';
import { fetchSubscanData } from '@/app/api/_api-utils/fetchSubscanData';
import { StatusCodes } from 'http-status-codes';

if (!SUBSCAN_API_KEY) {
	throw new Error('SUBSCAN_API_KEY env variable is not set');
}

export class SubscanOnChainService {
	private static postDetailsRequestMap = {
		[EProposalType.BOUNTY]: (id: string, network: ENetwork) => ({
			url: `https://${network}.api.subscan.io/api/scan/bounties/proposal`,
			body: {
				proposal_id: Number(id)
			}
		}),

		[EProposalType.COUNCIL_MOTION]: (id: string, network: ENetwork) => ({
			url: `https://${network}.api.subscan.io/api/scan/council/proposal`,
			body: {
				proposal_id: Number(id)
			}
		}),

		[EProposalType.DEMOCRACY_PROPOSAL]: (id: string, network: ENetwork) => ({
			url: `https://${network}.api.subscan.io/api/scan/democracy/proposal`,
			body: {
				democracy_id: Number(id)
			}
		}),

		[EProposalType.FELLOWSHIP_REFERENDUM]: (id: string, network: ENetwork) => ({
			url: `https://${network}.api.subscan.io/api/scan/fellowship/referendum`,
			body: {
				referendum_index: Number(id)
			}
		}),

		[EProposalType.REFERENDUM]: (id: string, network: ENetwork) => ({
			url: `https://${network}.api.subscan.io/api/scan/referenda/referendum`,
			body: {
				referendum_index: Number(id)
			}
		}),

		[EProposalType.REFERENDUM_V2]: (id: string, network: ENetwork) => ({
			url: `https://${network}.api.subscan.io/api/scan/referenda/referendum`,
			body: {
				referendum_index: Number(id)
			}
		}),

		[EProposalType.TECH_COMMITTEE_PROPOSAL]: (id: string, network: ENetwork) => ({
			url: `https://${network}.api.subscan.io/api/scan/techcomm/proposal`,
			body: {
				proposal_id: Number(id)
			}
		}),

		[EProposalType.TIP]: (hash: string, network: ENetwork) => ({
			url: `https://${network}.api.subscan.io/api/scan/treasury/tip`,
			body: {
				hash
			}
		}),

		[EProposalType.TREASURY_PROPOSAL]: (id: string, network: ENetwork) => ({
			url: `https://${network}.api.subscan.io/api/scan/treasury/proposal`,
			body: {
				proposal_id: Number(id)
			}
		})
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
		if (proposalType !== EProposalType.TIP && isNaN(Number(indexOrHash))) {
			throw new APIError(ERROR_CODES.INVALID_PARAMS_ERROR, StatusCodes.BAD_REQUEST);
		}

		const mappedRequestObject = this.postDetailsRequestMap[proposalType as keyof typeof this.postDetailsRequestMap]?.(indexOrHash, network);

		if (!mappedRequestObject) {
			return null;
		}

		const data = await fetchSubscanData(new URL(mappedRequestObject.url), network, mappedRequestObject.body, 'POST').then((res) => res.json());

		return {
			proposer: ValidatorService.isValidSubstrateAddress(data?.data?.proposer?.address) ? getSubstrateAddress(data?.data?.proposer?.address) || '' : '',
			status: data?.data?.status || '',
			createdAt: data?.data?.timeline?.[0].time ? dayjs(data?.data?.timeline?.[0].time).toDate() : undefined
		} as IOnChainPostInfo;
	}
}
