// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import {
	ENetwork,
	EPostOrigin,
	EProposalStatus,
	EProposalType,
	EVoteDecision,
	IDelegationStats,
	IGenericListingResponse,
	IOnChainPostInfo,
	IOnChainPostListing,
	IPreimage,
	IStatusHistoryItem,
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
import { BN, BN_ZERO } from '@polkadot/util';
import { getEncodedAddress } from '@/_shared/_utils/getEncodedAddress';
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

	static async GetPostVoteMetrics({ network, proposalType, indexOrHash }: { network: ENetwork; proposalType: EProposalType; indexOrHash: string }): Promise<IVoteMetrics> {
		const gqlClient = this.subsquidGqlClient(network);

		let query = [EProposalType.REFERENDUM_V2, EProposalType.FELLOWSHIP_REFERENDUM].includes(proposalType)
			? this.GET_CONVICTION_VOTE_METRICS_BY_PROPOSAL_TYPE_AND_INDEX
			: this.GET_VOTE_METRICS_BY_PROPOSAL_TYPE_AND_INDEX;

		if (proposalType === EProposalType.TIP) {
			query = this.GET_VOTE_METRICS_BY_PROPOSAL_TYPE_AND_HASH;
		}

		const { data: subsquidData, error: subsquidErr } = await gqlClient
			.query(query, { ...(proposalType === EProposalType.TIP ? { hash_eq: indexOrHash } : { index_eq: Number(indexOrHash) }), type_eq: proposalType })
			.toPromise();

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

		const voteMetrics = await this.GetPostVoteMetrics({ network, proposalType, indexOrHash: String(proposal.index || proposal.hash) });

		const allPeriodEnds =
			proposal.statusHistory && proposalType === EProposalType.REFERENDUM_V2 ? this.getAllPeriodEndDates(proposal.statusHistory, network, proposal.origin) : null;

		return {
			createdAt: proposal.createdAt,
			curator: proposal.curator || '',
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
		const voteMetricsPromises: Promise<IVoteMetrics>[] = subsquidData.proposals.map((proposal: { index?: number; hash?: string }) => {
			if (!ValidatorService.isValidNumber(proposal.index) && !proposal.hash?.startsWith?.('0x')) {
				throw new APIError(ERROR_CODES.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR, 'Invalid index or hash for proposal');
			}

			return this.GetPostVoteMetrics({ network, proposalType, indexOrHash: String(proposal.index || proposal.hash) });
		});

		const voteMetrics = await Promise.all(voteMetricsPromises);

		const posts: IOnChainPostListing[] = [];

		const postsPromises = subsquidData.proposals.map(
			async (
				proposal: {
					createdAt: string;
					description?: string | null;
					index: number;
					origin: EPostOrigin;
					proposer?: string;
					curator?: string;
					status?: EProposalStatus;
					reward?: string;
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
				const allPeriodEnds =
					proposal.statusHistory && proposalType === EProposalType.REFERENDUM_V2 ? this.getAllPeriodEndDates(proposal.statusHistory, network, proposal.origin) : null;
				let childBountiesCount = 0;

				// child bounties count
				if (proposalType === EProposalType.BOUNTY) {
					const childBountiesCountGQL = this.GET_CHILD_BOUNTIES_COUNT_BY_PARENT_BOUNTY_INDICES;

					const { data } = await gqlClient
						.query(childBountiesCountGQL, {
							parentBountyIndex_eq: proposal.index
						})
						.toPromise();
					if (data) {
						childBountiesCount = data?.totalChildBounties?.totalCount || 0;
					}
				}

				return {
					createdAt: new Date(proposal.createdAt),
					...(proposalType === EProposalType.BOUNTY ? { childBountiesCount: childBountiesCount || 0 } : {}),
					...(proposal.curator && { curator: proposal.curator }),
					description: proposal.description || '',
					index: proposal.index,
					origin: proposal.origin,
					proposer: proposal.proposer || '',
					...(proposal.reward && { reward: proposal.reward }),
					status: proposal.status || EProposalStatus.Unknown,
					type: proposalType,
					hash: proposal.hash || '',
					voteMetrics: voteMetrics[Number(index)],
					beneficiaries: proposal.preimage?.proposedCall?.args ? this.extractAmountAndAssetId(proposal.preimage?.proposedCall?.args) : undefined,
					decisionPeriodEndsAt: allPeriodEnds?.decisionPeriodEnd ?? undefined,
					preparePeriodEndsAt: allPeriodEnds?.preparePeriodEnd ?? undefined
				};
			}
		);

		const resolvedPosts = await Promise.allSettled(postsPromises);

		resolvedPosts?.forEach((result) => {
			if (result.status === 'fulfilled' && result?.value) {
				posts.push(result.value);
			}
		});

		return {
			items: posts,
			totalCount: subsquidData.proposalsConnection.totalCount
		};
	}

	// FIXME: refactor this function
	// eslint-disable-next-line sonarjs/cognitive-complexity
	static async GetPostVoteData({
		network,
		proposalType,
		indexOrHash,
		page,
		limit,
		decision,
		voterAddress: address
	}: {
		network: ENetwork;
		proposalType: EProposalType;
		indexOrHash: string;
		page: number;
		limit: number;
		decision?: EVoteDecision;
		voterAddress?: string;
	}) {
		const voterAddress = address ? (getEncodedAddress(address, network) ?? undefined) : undefined;

		const gqlClient = this.subsquidGqlClient(network);

		const subsquidDecision = decision ? this.convertVoteDecisionToSubsquidFormat({ decision }) : null;
		const subsquidDecisionIn = decision ? this.convertVoteDecisionToSubsquidFormatArray({ decision }) : null;

		const query =
			proposalType === EProposalType.TIP
				? subsquidDecision
					? this.GET_VOTES_LISTING_BY_PROPOSAL_TYPE_AND_HASH_AND_DECISION({ voter: voterAddress })
					: this.GET_VOTES_LISTING_BY_PROPOSAL_TYPE_AND_HASH({ voter: voterAddress })
				: [EProposalType.REFERENDUM_V2, EProposalType.FELLOWSHIP_REFERENDUM].includes(proposalType)
					? subsquidDecision
						? this.GET_CONVICTION_VOTES_LISTING_BY_PROPOSAL_TYPE_AND_INDEX_AND_DECISION({ voter: voterAddress })
						: this.GET_CONVICTION_VOTES_LISTING_BY_PROPOSAL_TYPE_AND_INDEX({ voter: voterAddress })
					: subsquidDecision
						? this.GET_VOTES_LISTING_BY_PROPOSAL_TYPE_AND_INDEX_AND_DECISION({ voter: voterAddress })
						: this.GET_VOTES_LISTING_BY_PROPOSAL_TYPE_AND_INDEX({ voter: voterAddress });

		const variables =
			proposalType === EProposalType.TIP
				? {
						hash_eq: indexOrHash,
						type_eq: proposalType,
						limit,
						offset: (page - 1) * limit,
						...(subsquidDecision && { decision_in: subsquidDecisionIn })
					}
				: {
						index_eq: Number(indexOrHash),
						type_eq: proposalType,
						limit,
						offset: (page - 1) * limit,
						...(subsquidDecision && { decision_in: subsquidDecisionIn }),
						...(subsquidDecision === 'yes' && { aye_not_eq: BN_ZERO.toString(), value_isNull: false }),
						...(subsquidDecision === 'no' && { nay_not_eq: BN_ZERO.toString(), value_isNull: false })
					};

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
				delegatedVotes?: {
					voter: string;
					votingPower: string;
					createdAt: string;
					lockPeriod: number;
					balance: { value?: string; aye?: string; nay?: string; abstain?: string };
					decision: 'yes' | 'no' | 'abstain' | 'split' | 'splitAbstain';
				}[];
			}) => {
				const balanceValue = this.getVoteBalanceValueForVoteHistory({ balance: vote.balance, decision: decision || (vote.decision as EVoteDecision) });
				return {
					balanceValue,
					decision: this.convertSubsquidVoteDecisionToVoteDecision({ decision: subsquidDecision || vote.decision }),
					lockPeriod: vote.lockPeriod,
					createdAt: vote.createdAt ? new Date(vote.createdAt) : new Date(vote.timestamp || ''),
					voterAddress: vote.voter,
					selfVotingPower: this.getSelfVotingPower({ balance: balanceValue, selfVotingPower: vote.selfVotingPower || null, lockPeriod: vote.lockPeriod }),
					totalVotingPower: vote.totalVotingPower,
					delegatedVotingPower: vote.delegatedVotingPower,
					delegatedVotes: vote.delegatedVotes?.map((delegatedVote) => ({
						voterAddress: delegatedVote.voter,
						totalVotingPower: delegatedVote.votingPower,
						createdAt: new Date(delegatedVote.createdAt),
						lockPeriod: delegatedVote.lockPeriod,
						balanceValue: delegatedVote.decision === 'abstain' ? delegatedVote.balance.abstain || '0' : delegatedVote.balance.value,
						decision: this.convertSubsquidVoteDecisionToVoteDecision({ decision: delegatedVote.decision })
					}))
				};
			}
		);

		return {
			votes,
			totalCounts: {
				[EVoteDecision.AYE]: subsquidData?.yesCount?.totalCount,
				[EVoteDecision.NAY]: subsquidData?.noCount?.totalCount,
				[EVoteDecision.SPLIT_ABSTAIN]: subsquidData?.abstainCount?.totalCount
			}
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

	static async GetChildBountiesByParentBountyIndex({ network, index }: { network: ENetwork; index: number }): Promise<IGenericListingResponse<IOnChainPostInfo>> {
		const gqlClient = this.subsquidGqlClient(network);

		const query = this.GET_CHILD_BOUNTIES_BY_PARENT_BOUNTY_INDEX;

		const { data: subsquidData, error: subsquidErr } = await gqlClient.query(query, { parentBountyIndex_eq: index }).toPromise();

		if (subsquidErr || !subsquidData) {
			console.error(`Error fetching on-chain child bounties for bounty from Subsquid: ${subsquidErr}`);
			throw new APIError(ERROR_CODES.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR, 'Error fetching on-chain child bounties for bounty from Subsquid');
		}
		const childBounties: IOnChainPostInfo[] = subsquidData.childBounties.map(
			(childBounty: {
				createdAt: string;
				curator: string;
				proposer: string;
				status: EProposalStatus;
				index: number;
				hash: string;
				origin: EPostOrigin;
				description: string;
				statusHistory: IStatusHistoryItem[];
				preimage: { proposedCall: { args: Record<string, unknown> } };
			}) => ({
				createdAt: childBounty.createdAt,
				curator: childBounty.curator || '',
				proposer: childBounty.proposer || '',
				status: childBounty.status,
				index: childBounty.index,
				hash: childBounty.hash,
				origin: childBounty.origin,
				description: childBounty.description || '',
				timeline: childBounty.statusHistory as IStatusHistoryItem[],
				preimageArgs: childBounty.preimage?.proposedCall?.args
			})
		);

		return {
			items: childBounties,
			totalCount: subsquidData.totalChildBounties.totalCount || 0
		};
	}

	static async GetConvictionVotingDelegationStats(network: ENetwork): Promise<IDelegationStats> {
		const gqlClient = this.subsquidGqlClient(network);

		const query = this.GET_CONVICTION_VOTING_DELEGATION_STATS;

		const { data: subsquidData, error: subsquidErr } = await gqlClient.query(query, {}).toPromise();

		if (subsquidErr || !subsquidData) {
			console.error(`Error fetching on-chain conviction voting delegation stats from Subsquid: ${subsquidErr}`);
			throw new APIError(ERROR_CODES.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR, 'Error fetching on-chain conviction voting delegation stats from Subsquid');
		}

		// Calculate total delegated tokens by summing up all balances
		const totalDelegatedTokens: BN = subsquidData.votingDelegations.reduce((acc: BN, delegation: { balance: string }) => {
			return new BN(acc).add(new BN(delegation.balance));
		}, BN_ZERO);

		// Get unique delegates and delegators
		const uniqueDelegates = new Set(subsquidData.votingDelegations.map((d: { to: string }) => d.to));
		const uniqueDelegators = new Set(subsquidData.votingDelegations.map((d: { from: string }) => d.from));

		return {
			totalDelegatedTokens: totalDelegatedTokens.toString(),
			totalDelegatedVotes: subsquidData.totalDelegatedVotes.totalCount || 0,
			totalDelegates: uniqueDelegates.size,
			totalDelegators: uniqueDelegators.size
		};
	}

	static async GetLast30DaysConvictionVoteCountByAddress({ network, address }: { network: ENetwork; address: string }): Promise<number> {
		const gqlClient = this.subsquidGqlClient(network);

		const query = this.GET_LAST_30_DAYS_CONVICTION_VOTE_COUNT_BY_ADDRESS;

		const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

		const { data: subsquidData, error: subsquidErr } = await gqlClient.query(query, { address_eq: address, createdAt_gte: thirtyDaysAgo.toISOString() }).toPromise();

		if (subsquidErr || !subsquidData) {
			console.error(`Error fetching on-chain vote count details from Subsquid: ${subsquidErr}`);
			throw new APIError(ERROR_CODES.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR, 'Error fetching on-chain vote count details from Subsquid');
		}

		return subsquidData.convictionVotesConnection.totalCount;
	}

	static async GetAllDelegatesWithConvictionVotingPowerAndDelegationsCount(network: ENetwork): Promise<Record<string, { votingPower: string; receivedDelegationsCount: number }>> {
		const gqlClient = this.subsquidGqlClient(network);

		const query = this.GET_ALL_DELEGATES_CONVICTION_VOTING_POWER_AND_DELEGATIONS_COUNT;

		const { data: subsquidData, error: subsquidErr } = await gqlClient.query(query, {}).toPromise();

		if (subsquidErr || !subsquidData) {
			console.error(`Error fetching on-chain all delegates conviction voting power and delegations count from Subsquid: ${subsquidErr}`);
			throw new APIError(
				ERROR_CODES.INTERNAL_SERVER_ERROR,
				StatusCodes.INTERNAL_SERVER_ERROR,
				'Error fetching on-chain all delegates conviction voting power and delegations count from Subsquid'
			);
		}

		const result: Record<string, { votingPower: string; receivedDelegationsCount: number }> = {};

		subsquidData.votingDelegations.forEach((delegation: { to: string; balance: string; lockPeriod: number }) => {
			result[delegation.to] = {
				votingPower: result[delegation.to]?.votingPower ? new BN(result[delegation.to].votingPower).add(new BN(delegation.balance)).toString() : delegation.balance,
				receivedDelegationsCount: result[delegation.to]?.receivedDelegationsCount ? result[delegation.to].receivedDelegationsCount + 1 : 1
			};
		});

		return result;
	}

	static async GetDelegateDetails({ network, address }: { network: ENetwork; address: string }): Promise<{
		votingPower: string;
		receivedDelegationsCount: number;
		last30DaysVotedProposalsCount: number;
	}> {
		const gqlClient = this.subsquidGqlClient(network);

		const query = this.GET_DELEGATE_DETAILS;

		const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

		const { data: subsquidData, error: subsquidErr } = await gqlClient.query(query, { address_eq: address, createdAt_gte: thirtyDaysAgo.toISOString() }).toPromise();

		if (subsquidErr || !subsquidData) {
			console.error(`Error fetching on-chain delegate details from Subsquid: ${subsquidErr}`);
			throw new APIError(ERROR_CODES.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR, 'Error fetching on-chain delegate details from Subsquid');
		}

		const votingPower = subsquidData.votingDelegations.reduce((acc: BN, delegation: { balance: string }) => {
			return new BN(acc).add(new BN(delegation.balance));
		}, BN_ZERO);

		return {
			votingPower: votingPower.toString(),
			receivedDelegationsCount: subsquidData.votingDelegations.length,
			last30DaysVotedProposalsCount: subsquidData.convictionVotesConnection.totalCount
		};
	}

	static async GetConvictionVoteDelegationsToAndFromAddress({ network, address, trackNum }: { network: ENetwork; address: string; trackNum?: number }) {
		const gqlClient = this.subsquidGqlClient(network);

		let query = this.GET_CONVICTION_VOTE_DELEGATIONS_TO_AND_FROM_ADDRESS;

		const isValidTrackNumber = ValidatorService.isValidNumber(trackNum) && ValidatorService.isValidTrackNumber({ trackNum: Number(trackNum), network });

		if (isValidTrackNumber) {
			query = this.GET_CONVICTION_VOTE_DELEGATIONS_TO_AND_FROM_ADDRESS_AND_TRACK_NUMBER;
		}

		const { data: subsquidData, error: subsquidErr } = await gqlClient.query(query, { address_eq: address, ...(isValidTrackNumber && { trackNumber_eq: trackNum }) }).toPromise();

		if (subsquidErr || !subsquidData) {
			console.error(`Error fetching on-chain conviction vote delegations by address from Subsquid: ${subsquidErr}`);
			throw new APIError(ERROR_CODES.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR, 'Error fetching on-chain conviction vote delegations by address from Subsquid');
		}

		const votingDelegations = subsquidData.votingDelegations.map((delegation: { createdAt: string }) => ({
			...delegation,
			createdAt: new Date(delegation.createdAt)
		}));

		return votingDelegations as {
			to: string;
			from: string;
			track: number;
			balance: string;
			createdAt: Date;
			lockPeriod: number;
		}[];
	}

	static async GetActiveProposalsCountByTrackIds({ network, trackIds }: { network: ENetwork; trackIds: number[] }) {
		const gqlClient = this.subsquidGqlClient(network);

		const query = this.GET_ACTIVE_PROPOSALS_COUNT_BY_TRACK_IDS(trackIds);

		const { data: subsquidData, error: subsquidErr } = await gqlClient.query(query, {}).toPromise();

		if (subsquidErr || !subsquidData) {
			console.error(`Error fetching on-chain active proposals by track id from Subsquid: ${subsquidErr}`);
			throw new APIError(ERROR_CODES.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR, 'Error fetching on-chain active proposals by track id from Subsquid');
		}

		const result: Record<number, number> = {};

		trackIds.forEach((trackId) => {
			result[Number(trackId)] = subsquidData[`track_${trackId}`].totalCount;
		});

		return result;
	}

	static async GetActiveProposalListingsWithVoteForAddressByTrackId({
		network,
		trackId,
		voterAddress
	}: {
		network: ENetwork;
		trackId: number;
		voterAddress: string;
	}): Promise<IGenericListingResponse<IOnChainPostListing & { delegateVote?: IVoteData }>> {
		const gqlClient = this.subsquidGqlClient(network);

		const query = this.GET_ACTIVE_PROPOSAL_LISTINGS_WITH_VOTE_FOR_ADDRESS_BY_TRACK_ID;

		const { data: subsquidData, error: subsquidErr } = await gqlClient.query(query, { trackNumber_eq: trackId, voter_eq: voterAddress }).toPromise();

		if (subsquidErr || !subsquidData) {
			console.error(`Error fetching on-chain active proposal listings by track id from Subsquid: ${subsquidErr}`);
			throw new APIError(ERROR_CODES.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR, 'Error fetching on-chain active proposal listings by track id from Subsquid');
		}

		const posts: (IOnChainPostListing & { delegateVote?: IVoteData })[] = await Promise.all(
			subsquidData.proposalsConnection.edges.map(
				async (edge: {
					node: {
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
						convictionVoting?: Array<{
							balance: { value?: string; aye?: string; nay?: string; abstain?: string };
							decision: 'yes' | 'no' | 'abstain' | 'split' | 'splitAbstain';
							lockPeriod: number;
							createdAt: string;
							selfVotingPower: string;
							totalVotingPower: string;
							delegatedVotingPower: string;
						}>;
					};
				}) => {
					const proposal = edge.node;

					const allPeriodEnds = proposal.statusHistory ? this.getAllPeriodEndDates(proposal.statusHistory, network, proposal.origin) : null;
					const delegateVoteData = proposal.convictionVoting?.[0];

					const delegateVote: IVoteData | undefined = delegateVoteData
						? {
								balanceValue: delegateVoteData.decision === 'abstain' ? delegateVoteData.balance.abstain || '0' : delegateVoteData.balance.value || '0',
								decision:
									delegateVoteData.decision === 'yes' ? EVoteDecision.AYE : delegateVoteData.decision === 'no' ? EVoteDecision.NAY : (delegateVoteData.decision as EVoteDecision),
								lockPeriod: delegateVoteData.lockPeriod,
								createdAt: new Date(delegateVoteData.createdAt),
								voterAddress,
								selfVotingPower: delegateVoteData.selfVotingPower,
								totalVotingPower: delegateVoteData.totalVotingPower,
								delegatedVotingPower: delegateVoteData.delegatedVotingPower
							}
						: undefined;

					return {
						createdAt: new Date(proposal.createdAt),
						description: proposal.description || '',
						index: proposal.index,
						origin: proposal.origin,
						proposer: proposal.proposer || '',
						status: proposal.status || EProposalStatus.Unknown,
						type: EProposalType.REFERENDUM_V2,
						hash: proposal.hash || '',
						voteMetrics: await this.GetPostVoteMetrics({ network, proposalType: EProposalType.REFERENDUM_V2, indexOrHash: String(proposal.index || proposal.hash)! }),
						beneficiaries: proposal.preimage?.proposedCall?.args ? this.extractAmountAndAssetId(proposal.preimage?.proposedCall?.args) : undefined,
						decisionPeriodEndsAt: allPeriodEnds?.decisionPeriodEnd ?? undefined,
						preparePeriodEndsAt: allPeriodEnds?.preparePeriodEnd ?? undefined,
						delegateVote
					};
				}
			)
		);

		return {
			items: posts,
			totalCount: subsquidData.proposalsConnection.totalCount
		};
	}
}
