// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import {
	ENetwork,
	EPostOrigin,
	EProposalStatus,
	EProposalType,
	EVoteDecision,
	IGenericListingResponse,
	IOnChainPostInfo,
	IOnChainPostListing,
	IPreimage,
	IStatusHistoryItem,
	ISubsquidBountyResponse,
	IVoteCurve,
	IVoteData,
	IVoteMetrics
} from '@shared/types';
import { cacheExchange, Client as UrqlClient, fetchExchange } from '@urql/core';
import { NETWORKS_DETAILS } from '@shared/_constants/networks';
import { APIError } from '@api/_api-utils/apiError';
import { ERROR_CODES } from '@shared/_constants/errorLiterals';
import { StatusCodes } from 'http-status-codes';
import { getSubstrateAddress } from '@/_shared/_utils/getSubstrateAddress';
import { ValidatorService } from '@/_shared/_services/validator_service';
import { ACTIVE_PROPOSAL_STATUSES } from '@/_shared/_constants/activeProposalStatuses';
import { SubsquidUtils } from './subsquidUtils';

export class SubsquidService extends SubsquidUtils {
	private static subsquidGqlClient = (network: ENetwork) => {
		const subsquidUrl = NETWORKS_DETAILS[network.toString() as keyof typeof NETWORKS_DETAILS]?.subsquidUrl;

		if (!subsquidUrl) {
			throw new APIError(ERROR_CODES.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR, 'Subsquid URL not found for the given network');
		}

		return new UrqlClient({
			url: subsquidUrl,
			exchanges: [cacheExchange, fetchExchange]
		});
	};

	static async GetPostVoteMetrics({ network, proposalType, index }: { network: ENetwork; proposalType: EProposalType; index: number }): Promise<IVoteMetrics> {
		const gqlClient = this.subsquidGqlClient(network);

		const query = [EProposalType.REFERENDUM_V2, EProposalType.FELLOWSHIP_REFERENDUM].includes(proposalType)
			? this.GET_CONVICTION_VOTE_METRICS_BY_PROPOSAL_TYPE_AND_INDEX
			: this.GET_VOTE_METRICS_BY_PROPOSAL_TYPE_AND_INDEX;

		const { data: subsquidData, error: subsquidErr } = await gqlClient.query(query, { index_eq: index, type_eq: proposalType }).toPromise();

		if (subsquidErr || !subsquidData) {
			console.error(`Error fetching on-chain post vote counts from Subsquid: ${subsquidErr}`);
			throw new APIError(ERROR_CODES.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR, 'Error fetching on-chain post vote counts from Subsquid');
		}

		return {
			[EVoteDecision.NAY]: {
				count: subsquidData.noCount.totalCount || 0,
				value: subsquidData.tally?.[0]?.tally?.nays || '0'
			},
			[EVoteDecision.AYE]: {
				count: subsquidData.yesCount.totalCount || 0,
				value: subsquidData.tally?.[0]?.tally?.ayes || '0'
			},
			support: {
				value: subsquidData.tally?.[0]?.tally?.support || '0'
			},
			bareAyes: {
				value: subsquidData.tally?.[0]?.tally?.bareAyes || '0'
			}
		};
	}

	static async GetOnChainPostInfo({
		network,
		indexOrHash,
		proposalType
	}: {
		network: ENetwork;
		indexOrHash: string;
		proposalType: EProposalType;
	}): Promise<IOnChainPostInfo | null> {
		const gqlClient = this.subsquidGqlClient(network);

		const query = proposalType === EProposalType.TIP ? this.GET_PROPOSAL_BY_HASH_AND_TYPE : this.GET_PROPOSAL_BY_INDEX_AND_TYPE;
		const variables = proposalType === EProposalType.TIP ? { hash_eq: indexOrHash, type_eq: proposalType } : { index_eq: Number(indexOrHash), type_eq: proposalType };

		const { data: subsquidData, error: subsquidErr } = await gqlClient.query(query, variables).toPromise();

		if (subsquidErr || !subsquidData) {
			console.error(`Error fetching on-chain post info from Subsquid: ${subsquidErr}`);
			throw new APIError(ERROR_CODES.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR, 'Error fetching on-chain post info from Subsquid');
		}

		if (subsquidData.proposals.length === 0) return null;

		const proposal = subsquidData.proposals[0];

		const voteMetrics = await this.GetPostVoteMetrics({ network, proposalType, index: Number(proposal.index) });

		const allPeriodEnds = proposal.statusHistory ? this.getAllPeriodEndDates(proposal.statusHistory, network, proposal.origin) : null;

		return {
			createdAt: proposal.createdAt,
			proposer: proposal.proposer || '',
			status: proposal.status,
			index: proposal.index,
			hash: proposal.hash,
			origin: proposal.origin,
			description: proposal.description || '',
			voteMetrics,
			beneficiaries: proposal.preimage?.proposedCall?.args ? this.extractAmountAndAssetId(proposal.preimage?.proposedCall?.args) : undefined,
			preparePeriodEndsAt: allPeriodEnds?.preparePeriodEnd ?? undefined,
			decisionPeriodEndsAt: allPeriodEnds?.decisionPeriodEnd ?? undefined,
			confirmationPeriodEndsAt: allPeriodEnds?.confirmationPeriodEnd ?? undefined,
			timeline: proposal.statusHistory as IStatusHistoryItem[],
			preimageArgs: proposal.preimage?.proposedCall?.args
		};
	}

	static async GetOnChainPostsListing({
		network,
		proposalType,
		limit,
		page,
		statuses,
		origins,
		notVotedByAddresses
	}: {
		network: ENetwork;
		proposalType: EProposalType;
		limit: number;
		page: number;
		statuses?: EProposalStatus[];
		origins?: EPostOrigin[];
		notVotedByAddresses?: string[];
	}): Promise<IGenericListingResponse<IOnChainPostListing>> {
		const gqlClient = this.subsquidGqlClient(network);

		let gqlQuery = this.GET_PROPOSALS_LISTING_BY_TYPE;

		if (statuses?.length && origins?.length) {
			gqlQuery = this.GET_PROPOSALS_LISTING_BY_TYPE_AND_STATUSES_AND_ORIGINS;
		} else if (statuses?.length) {
			gqlQuery = this.GET_PROPOSALS_LISTING_BY_TYPE_AND_STATUSES;
		} else if (origins?.length) {
			gqlQuery = this.GET_PROPOSALS_LISTING_BY_TYPE_AND_ORIGINS;
		}

		if (notVotedByAddresses?.length && statuses?.length) {
			gqlQuery = this.GET_PROPOSALS_LISTING_BY_TYPE_STATUSES_WHERE_NOT_VOTED;
		}

		if (notVotedByAddresses?.length && statuses?.length && origins?.length) {
			gqlQuery = this.GET_PROPOSALS_LISTING_BY_TYPE_STATUSES_AND_ORIGINS_WHERE_NOT_VOTED;
		}

		const { data: subsquidData, error: subsquidErr } = await gqlClient
			.query(gqlQuery, {
				limit,
				offset: (page - 1) * limit,
				status_in: statuses,
				type_eq: proposalType,
				origin_in: origins,
				voters: notVotedByAddresses
			})
			.toPromise();

		if (subsquidErr || !subsquidData) {
			console.error(`Error fetching on-chain posts listing from Subsquid: ${subsquidErr}`);
			throw new APIError(ERROR_CODES.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR, 'Error fetching on-chain posts listing from Subsquid');
		}

		if (subsquidData.proposals.length === 0) {
			return {
				items: [],
				totalCount: subsquidData.proposalsConnection.totalCount
			};
		}

		// fetch vote counts for each post
		const voteMetricsPromises: Promise<IVoteMetrics>[] = subsquidData.proposals.map((proposal: { index?: number }) => {
			if (!ValidatorService.isValidNumber(proposal.index)) {
				throw new APIError(ERROR_CODES.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR, 'Invalid index for proposal');
			}

			return this.GetPostVoteMetrics({ network, proposalType, index: Number(proposal.index) });
		});

		const voteMetrics = await Promise.all(voteMetricsPromises);

		const posts: IOnChainPostListing[] = [];

		subsquidData.proposals.forEach(
			(
				proposal: {
					createdAt: Date;
					description?: string | null;
					index: number;
					origin: EPostOrigin;
					proposer?: string;
					status?: EProposalStatus;
					hash?: string;
					preimage?: {
						proposedCall?: {
							args?: Record<string, unknown>;
						};
					};
					statusHistory?: Array<{
						status: EProposalStatus;
						timestamp: string;
					}>;
				},
				index: number
			) => {
				const allPeriodEnds = proposal.statusHistory ? this.getAllPeriodEndDates(proposal.statusHistory, network, proposal.origin) : null;

				posts.push({
					createdAt: proposal.createdAt,
					description: proposal.description || '',
					index: proposal.index,
					origin: proposal.origin,
					proposer: proposal.proposer || '',
					status: proposal.status || EProposalStatus.Unknown,
					type: proposalType,
					hash: proposal.hash || '',
					voteMetrics: voteMetrics[Number(index)],
					beneficiaries: proposal.preimage?.proposedCall?.args ? this.extractAmountAndAssetId(proposal.preimage?.proposedCall?.args) : undefined,
					decisionPeriodEndsAt: allPeriodEnds?.decisionPeriodEnd ?? undefined,
					preparePeriodEndsAt: allPeriodEnds?.preparePeriodEnd ?? undefined
				});
			}
		);

		return {
			items: posts,
			totalCount: subsquidData.proposalsConnection.totalCount
		};
	}

	static async GetPostVoteData({
		network,
		proposalType,
		indexOrHash,
		page,
		limit,
		decision
	}: {
		network: ENetwork;
		proposalType: EProposalType;
		indexOrHash: string;
		page: number;
		limit: number;
		decision?: EVoteDecision;
	}) {
		const gqlClient = this.subsquidGqlClient(network);

		const subsquidDecision = decision === EVoteDecision.AYE ? 'yes' : decision === EVoteDecision.NAY ? 'no' : decision;

		const query =
			proposalType === EProposalType.TIP
				? subsquidDecision
					? this.GET_VOTES_LISTING_BY_PROPOSAL_TYPE_AND_HASH_AND_DECISION
					: this.GET_VOTES_LISTING_BY_PROPOSAL_TYPE_AND_HASH
				: [EProposalType.REFERENDUM_V2, EProposalType.FELLOWSHIP_REFERENDUM].includes(proposalType)
					? subsquidDecision
						? this.GET_CONVICTION_VOTES_LISTING_BY_PROPOSAL_TYPE_AND_INDEX_AND_DECISION
						: this.GET_CONVICTION_VOTES_LISTING_BY_PROPOSAL_TYPE_AND_INDEX
					: subsquidDecision
						? this.GET_VOTES_LISTING_BY_PROPOSAL_TYPE_AND_INDEX_AND_DECISION
						: this.GET_VOTES_LISTING_BY_PROPOSAL_TYPE_AND_INDEX;

		const variables =
			proposalType === EProposalType.TIP
				? { hash_eq: indexOrHash, type_eq: proposalType, limit, offset: (page - 1) * limit, ...(subsquidDecision && { decision_eq: subsquidDecision }) }
				: { index_eq: Number(indexOrHash), type_eq: proposalType, limit, offset: (page - 1) * limit, ...(subsquidDecision && { decision_eq: subsquidDecision }) };

		const { data: subsquidData, error: subsquidErr } = await gqlClient.query(query, variables).toPromise();

		if (subsquidErr || !subsquidData) {
			console.error(`Error fetching on-chain post vote data from Subsquid: ${subsquidErr}`);
			throw new APIError(ERROR_CODES.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR, 'Error fetching on-chain post vote data from Subsquid');
		}

		const votes: IVoteData[] = subsquidData.votes.map(
			(vote: {
				balance: { value?: string; aye?: string; nay?: string; abstain?: string };
				decision: 'yes' | 'no' | 'abstain' | 'split' | 'splitAbstain';
				lockPeriod: number;
				createdAt?: string;
				timestamp?: string;
				voter: string;
				selfVotingPower?: string;
				totalVotingPower?: string;
				delegatedVotingPower?: string;
			}) => ({
				balanceValue: vote.decision === 'abstain' ? vote.balance.abstain : vote.balance.value,
				decision: vote.decision === 'yes' ? EVoteDecision.AYE : vote.decision === 'no' ? EVoteDecision.NAY : (vote.decision as EVoteDecision),
				lockPeriod: vote.lockPeriod,
				createdAt: vote.createdAt ? new Date(vote.createdAt) : new Date(vote.timestamp || ''),
				voterAddress: vote.voter,
				selfVotingPower: vote.selfVotingPower,
				totalVotingPower: vote.totalVotingPower,
				delegatedVotingPower: vote.delegatedVotingPower
			})
		);

		return {
			votes,
			totalCount: subsquidData.votesConnection.totalCount
		};
	}

	static async GetPostVoteCurves({ network, index }: { network: ENetwork; index: number }): Promise<IVoteCurve[]> {
		const gqlClient = this.subsquidGqlClient(network);

		const query = this.GET_VOTES_CURVE_DATA_BY_POST_INDEX;

		const { data: subsquidData, error: subsquidErr } = await gqlClient.query(query, { index_eq: Number(index) }).toPromise();

		if (subsquidErr || !subsquidData) {
			console.error(`Error fetching on-chain post vote curves from Subsquid: ${subsquidErr}`);
			throw new APIError(ERROR_CODES.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR, 'Error fetching on-chain post vote curves from Subsquid');
		}

		return subsquidData.curveData as IVoteCurve[];
	}

	static async GetPostPreimage({ network, indexOrHash, proposalType }: { network: ENetwork; indexOrHash: string; proposalType: EProposalType }): Promise<IPreimage | null> {
		const gqlClient = this.subsquidGqlClient(network);

		const query = proposalType === EProposalType.TIP ? this.GET_PREIMAGE_BY_PROPOSAL_HASH_AND_TYPE : this.GET_PREIMAGE_BY_PROPOSAL_INDEX_AND_TYPE;

		const { data: subsquidData, error: subsquidErr } = await gqlClient
			.query(query, { ...(proposalType === EProposalType.TIP ? { hash_eq: indexOrHash } : { index_eq: Number(indexOrHash) }), type_eq: proposalType })
			.toPromise();

		if (subsquidErr || !subsquidData?.proposals?.length) {
			console.error(`Error fetching on-chain post preimage from Subsquid: ${subsquidErr}`);
			throw new APIError(ERROR_CODES.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR, 'Error fetching on-chain post preimage from Subsquid');
		}

		const proposer = subsquidData.proposals[0].preimage.proposer ? getSubstrateAddress(subsquidData.proposals[0].preimage.proposer) : '';

		return {
			...subsquidData.proposals[0].preimage,
			proposer
		} as IPreimage;
	}

	static async GetPreimageListing({ network, page, limit }: { network: ENetwork; page: number; limit: number }): Promise<IGenericListingResponse<IPreimage>> {
		const gqlClient = this.subsquidGqlClient(network);

		const { data: subsquidData, error: subsquidErr } = await gqlClient.query(this.GET_PREIMAGES_LISTING, { limit, offset: (page - 1) * limit }).toPromise();

		if (subsquidErr || !subsquidData || !subsquidData.preimages) {
			console.error(`Error fetching on-chain preimage listing from Subsquid: ${subsquidErr}`);
			throw new APIError(ERROR_CODES.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR, 'Error fetching on-chain preimage listing from Subsquid');
		}

		return {
			items: subsquidData.preimages.map((preimage: IPreimage) => ({
				...preimage,
				...(preimage.proposer && { proposer: getSubstrateAddress(preimage.proposer) })
			})),
			totalCount: subsquidData.preimagesConnection.totalCount
		};
	}

	static async GetPreimageByHash({ network, hash }: { network: ENetwork; hash: string }): Promise<IPreimage | null> {
		const gqlClient = this.subsquidGqlClient(network);

		const { data: subsquidData, error: subsquidErr } = await gqlClient.query(this.GET_PREIMAGE_BY_HASH, { hash_eq: hash }).toPromise();

		if (subsquidErr || !subsquidData?.preimages?.length) {
			console.error(`Error fetching on-chain preimage by hash from Subsquid: ${subsquidErr}`);
			throw new APIError(ERROR_CODES.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR, 'Error fetching on-chain preimage by hash from Subsquid');
		}

		return subsquidData.preimages[0] as IPreimage;
	}

	static async GetActiveVotedProposalsCount({
		addresses,
		network
	}: {
		addresses: string[];
		network: ENetwork;
	}): Promise<{ activeProposalsCount: number; votedProposalsCount: number }> {
		const gqlClient = this.subsquidGqlClient(network);

		const query = this.GET_ACTIVE_VOTED_PROPOSALS_COUNT;

		const { data: subsquidData, error: subsquidErr } = await gqlClient.query(query, { status_in: ACTIVE_PROPOSAL_STATUSES, voter_in: addresses }).toPromise();

		if (subsquidErr || !subsquidData) {
			console.error(`Error fetching on-chain active voted proposals count from Subsquid: ${subsquidErr}`);
			throw new APIError(ERROR_CODES.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR, 'Error fetching on-chain active voted proposals count from Subsquid');
		}

		return {
			activeProposalsCount: subsquidData.activeProposalsCount.totalCount || 0,
			votedProposalsCount: subsquidData.votedProposalsCount.totalCount || 0
		};
	}

	static async getActiveBountiesWithRewards(network: ENetwork): Promise<ISubsquidBountyResponse | null> {
		try {
			const gqlClient = this.subsquidGqlClient(network);
			const response = await gqlClient.query(this.GET_ACTIVE_BOUNTIES_WITH_REWARDS, {}).toPromise();

			return response as ISubsquidBountyResponse;
		} catch (error) {
			console.error('Error fetching active bounties:', error);
			return null;
		}
	}

	static async getChildBountiesRewards(network: ENetwork, parentBountyIndices: number[]): Promise<ISubsquidBountyResponse | null> {
		try {
			const gqlClient = this.subsquidGqlClient(network);
			const response = await gqlClient
				.query(this.GET_CHILD_BOUNTIES_REWARDS, {
					parentBountyIndex_in: parentBountyIndices
				})
				.toPromise();

			return response as ISubsquidBountyResponse;
		} catch (error) {
			console.error('Error fetching child bounties:', error);
			return null;
		}
	}

	static async getClaimedChildBountiesPayeesAndRewardForParentBountyIndices(network: ENetwork, parentBountyIndices: number[]): Promise<ISubsquidBountyResponse | null> {
		try {
			const gqlClient = this.subsquidGqlClient(network);
			const response = await gqlClient
				.query(this.GET_CLAIMED_CHILD_BOUNTIES_PAYEES_AND_REWARD_FOR_PARENT_BOUNTY_INDICES, { parentBountyIndex_in: parentBountyIndices })
				.toPromise();

			return response as ISubsquidBountyResponse;
		} catch (error) {
			console.error('Error fetching claimed child bounties payees and reward:', error);
			return null;
		}
	}
}
