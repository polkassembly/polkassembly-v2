// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import {
	EAnalyticsType,
	ENetwork,
	EPostOrigin,
	EVotesDisplayType,
	EProposalStatus,
	EProposalType,
	EVoteDecision,
	EVoteSortOptions,
	IBountyProposal,
	IDelegationStats,
	IFlattenedConvictionVote,
	IGenericListingResponse,
	IOnChainMetadata,
	IOnChainPostInfo,
	IOnChainPostListing,
	IPostAnalytics,
	IPostBubbleVotes,
	IPreimage,
	IStatusHistoryItem,
	ITrackAnalyticsDelegations,
	ITrackAnalyticsDelegationsList,
	ITrackAnalyticsStats,
	IVoteCurve,
	IVoteData,
	IVoteMetrics,
	IProfileVote,
	IGovAnalyticsStats,
	IGovAnalyticsReferendumOutcome,
	IRawTurnoutData,
	IGovAnalyticsDelegationStats,
	IGovAnalyticsCategoryCounts,
	IDVVotes
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
import { encodeAddress } from '@polkadot/util-crypto';
import { getEncodedAddress } from '@/_shared/_utils/getEncodedAddress';
import { dayjs } from '@shared/_utils/dayjsInit';
import { getTrackGroups } from '@/_shared/_constants/trackGroups';
// import { getTrackNameFromId } from '@/_shared/_utils/getTrackNameFromId'; // Moved to frontend
import { SubsquidUtils } from './subsquidUtils';
import { SubsquidQueries } from './subsquidQueries';

const VOTING_POWER_DIVISOR = new BN('10');
const SUBSQUID_MAX_RETRIES = 3;
const SUBSQUID_RETRY_DELAY_MS = 1000;
const SUBSQUID_FETCH_TIMEOUT_MS = 30000; // 30 second timeout for Subsquid requests

// Custom fetch with timeout for Subsquid requests
const fetchWithTimeout: typeof fetch = (url, options) => {
	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), SUBSQUID_FETCH_TIMEOUT_MS);

	return fetch(url, {
		...options,
		signal: controller.signal
	}).finally(() => clearTimeout(timeoutId));
};

export class SubsquidService extends SubsquidUtils {
	private static subsquidGqlClient = (network: ENetwork) => {
		const subsquidUrl = NETWORKS_DETAILS[network.toString() as keyof typeof NETWORKS_DETAILS]?.subsquidUrl;

		if (!subsquidUrl) {
			throw new APIError(ERROR_CODES.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR, 'Subsquid URL not found for the given network');
		}

		return new UrqlClient({
			url: subsquidUrl,
			exchanges: [cacheExchange, fetchExchange],
			fetch: fetchWithTimeout
		});
	};

	// Helper method to execute GraphQL queries with retry logic for network failures
	private static async executeWithRetry<T>(gqlClient: UrqlClient, query: string, variables: Record<string, unknown>, errorContext: string): Promise<T> {
		const executeAttempt = async (attempt: number): Promise<T> => {
			const { data, error } = await gqlClient.query(query, variables).toPromise();

			if (!error && data) {
				return data as T;
			}

			// Only retry on network errors, not on GraphQL errors
			const isNetworkError =
				String(error).includes('fetch failed') || String(error).includes('Network') || String(error).includes('aborted') || String(error).includes('ECONNRESET');

			if (!isNetworkError || attempt >= SUBSQUID_MAX_RETRIES) {
				console.error(`${errorContext}: ${error} (attempt ${attempt}/${SUBSQUID_MAX_RETRIES})`);
				throw new APIError(ERROR_CODES.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR, errorContext);
			}

			// Wait before retrying with exponential backoff
			const delay = SUBSQUID_RETRY_DELAY_MS * 2 ** (attempt - 1);
			console.warn(`${errorContext}: Network error, retrying in ${delay}ms (attempt ${attempt}/${SUBSQUID_MAX_RETRIES})`);
			await new Promise<void>((resolve) => {
				setTimeout(resolve, delay);
			});

			return executeAttempt(attempt + 1);
		};

		return executeAttempt(1);
	}

	static async GetPostVoteMetrics({ network, proposalType, indexOrHash }: { network: ENetwork; proposalType: EProposalType; indexOrHash: string }): Promise<IVoteMetrics | null> {
		if ([EProposalType.BOUNTY, EProposalType.CHILD_BOUNTY].includes(proposalType)) {
			return null;
		}

		const gqlClient = this.subsquidGqlClient(network);

		let query = [EProposalType.REFERENDUM_V2, EProposalType.FELLOWSHIP_REFERENDUM].includes(proposalType)
			? this.GET_CONVICTION_VOTE_METRICS_BY_PROPOSAL_TYPE_AND_INDEX
			: this.GET_VOTE_METRICS_BY_PROPOSAL_TYPE_AND_INDEX;

		if (proposalType === EProposalType.TIP) {
			query = this.GET_VOTE_METRICS_BY_PROPOSAL_TYPE_AND_HASH;
		}

		const subsquidData = await this.executeWithRetry<{
			noCount: { totalCount: number };
			yesCount: { totalCount: number };
			tally?: Array<{ tally?: { ayes?: string; nays?: string; support?: string; bareAyes?: string } }>;
		}>(
			gqlClient,
			query,
			{ ...(proposalType === EProposalType.TIP ? { hash_eq: indexOrHash } : { index_eq: Number(indexOrHash) }), type_eq: proposalType },
			'Error fetching on-chain post vote counts from Subsquid'
		);

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

	// Batched version that fetches vote metrics for multiple proposals in a single GraphQL request
	static async GetBatchedPostVoteMetrics({
		network,
		proposalType,
		indices
	}: {
		network: ENetwork;
		proposalType: EProposalType;
		indices: number[];
	}): Promise<Map<number, IVoteMetrics | null>> {
		const result = new Map<number, IVoteMetrics | null>();

		if ([EProposalType.BOUNTY, EProposalType.CHILD_BOUNTY].includes(proposalType) || indices.length === 0) {
			indices.forEach((index) => result.set(index, null));
			return result;
		}

		// Only use batched query for conviction vote types (ReferendumV2, Fellowship)
		if (![EProposalType.REFERENDUM_V2, EProposalType.FELLOWSHIP_REFERENDUM].includes(proposalType)) {
			// Fall back to sequential processing for non-conviction vote types (processed one at a time to avoid connection issues)
			const metricsResults = await indices.reduce(
				async (accPromise, index) => {
					const acc = await accPromise;
					const metrics = await this.GetPostVoteMetrics({ network, proposalType, indexOrHash: String(index) });
					acc.push({ index, metrics });
					return acc;
				},
				Promise.resolve([] as { index: number; metrics: IVoteMetrics | null }[])
			);
			metricsResults.forEach(({ index, metrics }) => result.set(index, metrics));
			return result;
		}

		const gqlClient = this.subsquidGqlClient(network);
		const query = this.GET_BATCHED_CONVICTION_VOTE_METRICS(indices, proposalType);

		const subsquidData = await this.executeWithRetry<Record<string, unknown>>(gqlClient, query, {}, 'Error fetching batched on-chain post vote counts from Subsquid');

		// Parse the batched response
		indices.forEach((index) => {
			const noCountData = subsquidData[`noCount_${index}`] as { totalCount?: number } | undefined;
			const yesCountData = subsquidData[`yesCount_${index}`] as { totalCount?: number } | undefined;
			const tallyData = subsquidData[`tally_${index}`] as Array<{ tally?: { ayes?: string; nays?: string; support?: string; bareAyes?: string } }> | undefined;

			const noCount = noCountData?.totalCount || 0;
			const yesCount = yesCountData?.totalCount || 0;
			const tally = tallyData?.[0]?.tally;

			result.set(index, {
				[EVoteDecision.NAY]: {
					count: noCount,
					value: tally?.nays || '0'
				},
				[EVoteDecision.AYE]: {
					count: yesCount,
					value: tally?.ayes || '0'
				},
				support: {
					value: tally?.support || '0'
				},
				bareAyes: {
					value: tally?.bareAyes || '0'
				}
			});
		});

		return result;
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

		const voteMetrics = await this.GetPostVoteMetrics({ network, proposalType, indexOrHash: String(proposal.index ?? proposal.hash) });

		const allPeriodEnds =
			proposal.statusHistory && proposalType === EProposalType.REFERENDUM_V2 ? this.getAllPeriodEndDates(proposal.statusHistory, network, proposal.origin) : null;

		return {
			createdAt: proposal.createdAt,
			...(proposal.curator && { curator: proposal.curator }),
			...(proposalType === EProposalType.CHILD_BOUNTY ? { parentBountyIndex: proposal.parentBountyIndex } : {}),
			...(proposalType === EProposalType.CHILD_BOUNTY ? { payee: proposal.payee } : {}),
			proposer: proposal.proposer || '',
			status: proposal.status,
			index: proposal.index,
			hash: proposal.hash,
			origin: proposal.origin,
			description: proposal.description || '',
			...(voteMetrics && { voteMetrics }),
			...(proposal.reward && { reward: proposal.reward }),
			...(proposal.fee && { fee: proposal.fee }),
			...(proposal.deposit && { deposit: proposal.deposit }),
			...(proposal.curatorDeposit && { curatorDeposit: proposal.curatorDeposit }),
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

		const subsquidData = await this.executeWithRetry<{
			proposals: Array<{
				createdAt: string;
				description?: string | null;
				index?: number;
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
			}>;
			proposalsConnection: { totalCount: number };
		}>(
			gqlClient,
			gqlQuery,
			{
				limit,
				offset: (page - 1) * limit,
				status_in: statuses,
				type_eq: proposalType,
				origin_in: origins,
				voters: notVotedByAddresses
			},
			'Error fetching on-chain posts listing from Subsquid'
		);

		if (subsquidData.proposals.length === 0) {
			return {
				items: [],
				totalCount: subsquidData.proposalsConnection.totalCount
			};
		}

		// Extract indices for batched vote metrics query
		const proposalIndices: number[] = [];
		const hashProposals: { hash: string; arrayIndex: number }[] = [];

		subsquidData.proposals.forEach((proposal: { index?: number; hash?: string }, arrayIndex: number) => {
			if (ValidatorService.isValidNumber(proposal.index)) {
				proposalIndices.push(proposal.index as number);
			} else if (proposal.hash?.startsWith?.('0x')) {
				hashProposals.push({ hash: proposal.hash, arrayIndex });
			} else {
				throw new APIError(ERROR_CODES.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR, 'Invalid index or hash for proposal');
			}
		});

		// Fetch vote metrics in a single batched request for index-based proposals
		const batchedVoteMetrics = await this.GetBatchedPostVoteMetrics({ network, proposalType, indices: proposalIndices });

		// For hash-based proposals (like TIPs), fetch sequentially (rare case, avoids connection issues)
		const hashVoteMetricsMap = new Map<string, IVoteMetrics | null>();
		if (hashProposals.length > 0) {
			const hashMetricsResults = await hashProposals.reduce(
				async (accPromise, { hash }) => {
					const acc = await accPromise;
					const metrics = await this.GetPostVoteMetrics({ network, proposalType, indexOrHash: hash });
					acc.push({ hash, metrics });
					return acc;
				},
				Promise.resolve([] as { hash: string; metrics: IVoteMetrics | null }[])
			);
			hashMetricsResults.forEach(({ hash, metrics }) => hashVoteMetricsMap.set(hash, metrics));
		}

		// Build a combined map for easy lookup
		const voteMetricsMap = new Map<number | string, IVoteMetrics | null>();
		batchedVoteMetrics.forEach((value, key) => voteMetricsMap.set(key, value));
		hashVoteMetricsMap.forEach((value, key) => voteMetricsMap.set(key, value));

		const posts: IOnChainPostListing[] = [];

		const postsPromises = subsquidData.proposals.map(async (proposal) => {
			const allPeriodEnds =
				proposal.statusHistory && proposalType === EProposalType.REFERENDUM_V2 ? this.getAllPeriodEndDates(proposal.statusHistory, network, proposal.origin) : null;
			let childBountiesCount = 0;

			// child bounties count
			if (proposalType === EProposalType.BOUNTY && proposal.index !== undefined) {
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

			// Get vote metrics from the map using the proposal's index or hash
			const voteMetricsKey = ValidatorService.isValidNumber(proposal.index) ? proposal.index : proposal.hash;
			const proposalVoteMetrics = voteMetricsKey ? voteMetricsMap.get(voteMetricsKey) : undefined;

			return {
				createdAt: new Date(proposal.createdAt),
				...(proposalType === EProposalType.BOUNTY ? { childBountiesCount: childBountiesCount || 0 } : {}),
				...(proposal.curator && { curator: proposal.curator }),
				description: proposal.description || '',
				index: proposal.index ?? 0,
				origin: proposal.origin,
				proposer: proposal.proposer || '',
				...(proposal.reward && { reward: proposal.reward }),
				status: proposal.status || EProposalStatus.Unknown,
				type: proposalType,
				hash: proposal.hash || '',
				voteMetrics: proposalVoteMetrics ?? undefined,
				beneficiaries: proposal.preimage?.proposedCall?.args ? this.extractAmountAndAssetId(proposal.preimage?.proposedCall?.args) : undefined,
				decisionPeriodEndsAt: allPeriodEnds?.decisionPeriodEnd ?? undefined,
				preparePeriodEndsAt: allPeriodEnds?.preparePeriodEnd ?? undefined
			};
		});

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

	private static getVotesQuery({
		proposalType,
		subsquidDecision,
		votesType
	}: {
		proposalType: EProposalType;
		subsquidDecision: string | null;
		votesType?: EVotesDisplayType;
	}): string {
		// Handle TIP proposal type
		if (proposalType === EProposalType.TIP) {
			return subsquidDecision ? this.GET_VOTES_LISTING_BY_PROPOSAL_TYPE_AND_HASH_AND_DECISION() : this.GET_VOTES_LISTING_BY_PROPOSAL_TYPE_AND_HASH();
		}

		// Handle REFERENDUM_V2 and FELLOWSHIP_REFERENDUM
		const isConvictionVoteType = [EProposalType.REFERENDUM_V2, EProposalType.FELLOWSHIP_REFERENDUM].includes(proposalType);

		if (isConvictionVoteType) {
			const isFlattened = votesType === EVotesDisplayType.FLATTENED;

			if (subsquidDecision) {
				return isFlattened
					? this.GET_FLATTENED_VOTES_LISTING_BY_PROPOSAL_TYPE_AND_INDEX_AND_DECISION()
					: this.GET_CONVICTION_VOTES_LISTING_BY_PROPOSAL_TYPE_AND_INDEX_AND_DECISION();
			}

			return isFlattened ? this.GET_FLATTENED_VOTES_LISTING_BY_PROPOSAL_TYPE_AND_INDEX() : this.GET_CONVICTION_VOTES_LISTING_BY_PROPOSAL_TYPE_AND_INDEX();
		}

		// Handle other proposal types
		return subsquidDecision ? this.GET_VOTES_LISTING_BY_PROPOSAL_TYPE_AND_INDEX_AND_DECISION() : this.GET_VOTES_LISTING_BY_PROPOSAL_TYPE_AND_INDEX();
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
		voterAddresses: addresses,
		orderBy,
		votesType
	}: {
		network: ENetwork;
		proposalType: EProposalType;
		indexOrHash: string;
		page: number;
		limit: number;
		decision?: EVoteDecision;
		voterAddresses?: string[];
		orderBy?: EVoteSortOptions;
		votesType?: EVotesDisplayType;
	}) {
		const voterAddresses = addresses?.length ? addresses.map((address) => getEncodedAddress(address, network)) : undefined;

		const gqlClient = this.subsquidGqlClient(network);

		const subsquidDecision = decision ? this.convertVoteDecisionToSubsquidFormat({ decision }) : null;
		const subsquidDecisionIn = decision ? (votesType === EVotesDisplayType.NESTED ? this.convertVoteDecisionToSubsquidFormatArray({ decision }) : [subsquidDecision]) : null;

		const addressesWithoutUndefined = voterAddresses?.filter((address) => address !== undefined && address !== null);

		const query = this.getVotesQuery({
			proposalType,
			subsquidDecision,
			votesType
		});

		const variables =
			proposalType === EProposalType.TIP
				? {
						hash_eq: indexOrHash,
						type_eq: proposalType,
						limit,
						offset: (page - 1) * limit,
						voter_in: addressesWithoutUndefined,
						...(subsquidDecision && { decision_in: subsquidDecisionIn })
					}
				: {
						index_eq: Number(indexOrHash),
						type_eq: proposalType,
						limit,
						offset: (page - 1) * limit,
						voter_in: addressesWithoutUndefined,
						orderBy: this.getOrderByForSubsquid({ orderBy }),
						...(subsquidDecision && { decision_in: subsquidDecisionIn }),
						...(subsquidDecision === 'yes' && votesType === EVotesDisplayType.NESTED && { aye_not_eq: BN_ZERO.toString(), value_isNull: false }),
						...(subsquidDecision === 'no' && votesType === EVotesDisplayType.NESTED && { nay_not_eq: BN_ZERO.toString(), value_isNull: false })
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
					...(votesType === EVotesDisplayType.FLATTENED && { votingPower: this.getVotingPower(balanceValue, vote.lockPeriod) }),
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

	static async GetPostOnChainMetadata({
		network,
		indexOrHash,
		proposalType
	}: {
		network: ENetwork;
		indexOrHash: string;
		proposalType: EProposalType;
	}): Promise<IOnChainMetadata | null> {
		const gqlClient = this.subsquidGqlClient(network);

		const query = proposalType === EProposalType.TIP ? this.GET_ON_CHAIN_METADATA_BY_PROPOSAL_HASH_AND_TYPE : this.GET_ON_CHAIN_METADATA_BY_PROPOSAL_INDEX_AND_TYPE;

		const { data: subsquidData, error: subsquidErr } = await gqlClient
			.query(query, { ...(proposalType === EProposalType.TIP ? { hash_eq: indexOrHash } : { index_eq: Number(indexOrHash) }), type_eq: proposalType })
			.toPromise();

		if (subsquidErr || !subsquidData?.proposals?.length) {
			console.error(`Error fetching on-chain post preimage from Subsquid: ${subsquidErr}`);
			throw new APIError(ERROR_CODES.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR, 'Error fetching on-chain post preimage from Subsquid');
		}

		const data = subsquidData.proposals[0];

		const proposer = data.preimage?.proposer || data.proposer;

		const metadata: IOnChainMetadata = {
			preimage: data.preimage,
			proposedCall: data.proposalArguments,
			proposer: getSubstrateAddress(proposer) || undefined,
			trackNumber: data.trackNumber,
			submittedAtBlock: data.submittedAtBlock,
			updatedAtBlock: data.updatedAtBlock,
			enactmentAtBlock: data.enactmentAtBlock,
			enactmentAfterBlock: data.enactmentAfterBlock
		};

		return metadata;
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

	static async GetPreimagesByAddress({
		network,
		page,
		limit,
		address
	}: {
		network: ENetwork;
		page: number;
		limit: number;
		address: string;
	}): Promise<IGenericListingResponse<IPreimage>> {
		const gqlClient = this.subsquidGqlClient(network);

		// Convert address to substrate format for querying
		const formattedAddress = ValidatorService.isValidSubstrateAddress(address) ? encodeAddress(address, NETWORKS_DETAILS[network as ENetwork].ss58Format) : address;

		const { data: subsquidData, error: subsquidErr } = await gqlClient
			.query(this.GET_USER_PREIMAGES_LISTING, {
				limit,
				offset: (page - 1) * limit,
				proposer_eq: formattedAddress
			})
			.toPromise();

		if (subsquidErr || !subsquidData || !subsquidData.preimages) {
			console.error(`Error fetching on-chain user preimage listing from Subsquid: ${subsquidErr}`);
			throw new APIError(ERROR_CODES.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR, 'Error fetching on-chain user preimage listing from Subsquid');
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
		network,
		last15days
	}: {
		addresses: string[];
		network: ENetwork;
		last15days?: boolean;
	}): Promise<{ activeProposalsCount: number; votedProposalsCount: number }> {
		const gqlClient = this.subsquidGqlClient(network);

		const query = this.GET_ACTIVE_VOTED_PROPOSALS_COUNT;

		const variables: { status_in: EProposalStatus[]; voter_in: string[]; createdAt_gte?: string } = { status_in: ACTIVE_PROPOSAL_STATUSES, voter_in: addresses };

		if (last15days) {
			variables.createdAt_gte = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString();
		}

		const { data: subsquidData, error: subsquidErr } = await gqlClient.query(query, variables).toPromise();

		if (subsquidErr || !subsquidData) {
			console.error(`Error fetching on-chain active voted proposals count from Subsquid: ${subsquidErr}`);
			throw new APIError(ERROR_CODES.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR, 'Error fetching on-chain active voted proposals count from Subsquid');
		}

		return {
			activeProposalsCount: subsquidData.activeProposalsCount.totalCount || 0,
			votedProposalsCount: subsquidData.votedProposalsCount.totalCount || 0
		};
	}

	static async GetActiveBountiesWithRewardsByIndex({
		network,
		index,
		limit
	}: {
		network: ENetwork;
		index?: number;
		limit?: number;
	}): Promise<{ data: { items: IBountyProposal[]; totalCount: number } } | null> {
		try {
			const gqlClient = this.subsquidGqlClient(network);
			const response = await gqlClient
				.query(this.GET_ACTIVE_BOUNTIES_WITH_REWARDS_BY_INDEX, {
					type_eq: EProposalType.BOUNTY,
					status_not_in: [EProposalStatus.Cancelled, EProposalStatus.Rejected, EProposalStatus.Approved, EProposalStatus.Claimed],
					index_eq: index,
					limit
				})
				.toPromise();

			if (!response?.data) {
				return { data: { items: [], totalCount: 0 } };
			}

			return {
				data: {
					items: response.data.proposals || [],
					totalCount: response.data.proposalsConnection?.totalCount || 0
				}
			};
		} catch (error) {
			console.error('Error fetching active bounties by index:', error);
			return null;
		}
	}

	static async GetChildBountiesRewards({
		network,
		parentBountyIndices,
		limit
	}: {
		network: ENetwork;
		parentBountyIndices: number[];
		limit?: number;
	}): Promise<{ data: { items: IBountyProposal[]; totalCount: number } } | null> {
		try {
			const gqlClient = this.subsquidGqlClient(network);
			const response = await gqlClient
				.query(this.GET_CHILD_BOUNTIES_REWARDS, {
					parentBountyIndex_in: parentBountyIndices,
					limit
				})
				.toPromise();

			if (!response?.data) {
				return { data: { items: [], totalCount: 0 } };
			}

			return {
				data: {
					items: response.data.proposals || [],
					totalCount: response.data.proposalsConnection?.totalCount || 0
				}
			};
		} catch (error) {
			console.error('Error fetching child bounties:', error);
			return null;
		}
	}

	static async GetChildBountiesByParentBountyIndex({
		network,
		index,
		page,
		limit
	}: {
		network: ENetwork;
		index: number;
		page: number;
		limit: number;
	}): Promise<IGenericListingResponse<IOnChainPostInfo>> {
		const gqlClient = this.subsquidGqlClient(network);

		const query = this.GET_CHILD_BOUNTIES_BY_PARENT_BOUNTY_INDEX;

		const { data: subsquidData, error: subsquidErr } = await gqlClient
			.query(query, {
				parentBountyIndex_eq: index,
				limit: Number(limit),
				offset: (Number(page) - 1) * Number(limit)
			})
			.toPromise();

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

	static async GetAllDelegatesWithConvictionVotingPowerAndDelegationsCount(
		network: ENetwork
	): Promise<Record<string, { maxDelegated: string; delegators: string[]; receivedDelegationsCount: number }>> {
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

		const result: Record<string, { maxDelegated: string; delegators: string[]; receivedDelegationsCount: number }> = {};

		// Use Map for optimized grouping by delegate
		const delegateMap = new Map<string, Array<{ balance: string; lockPeriod: number; from: string; track?: number; trackNumber?: number }>>();

		// Single pass grouping - O(n) complexity
		subsquidData.votingDelegations.forEach((delegation: { to: string; balance: string; lockPeriod: number; from: string; track?: number; trackNumber?: number }) => {
			const delegate = delegation.to;
			const existing = delegateMap.get(delegate);

			if (existing) {
				existing.push(delegation);
			} else {
				delegateMap.set(delegate, [delegation]);
			}
		});

		// Calculate results for each delegate - optimized iteration
		delegateMap.forEach((delegations, delegate) => {
			const maxDelegated = this.calculateMaxTrackVotingPower(delegations);

			// Use Set for efficient deduplication
			const uniqueDelegators = new Set<string>();
			delegations.forEach((d) => uniqueDelegators.add(d.from));

			result[`${delegate}`] = {
				maxDelegated,
				delegators: Array.from(uniqueDelegators),
				receivedDelegationsCount: delegations.length
			};
		});

		return result;
	}

	static async GetDelegateDetails({ network, address }: { network: ENetwork; address: string }): Promise<{
		maxDelegated: string;
		delegators: string[];
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

		// Filter delegations for this specific delegate
		const delegateDelegations = subsquidData.votingDelegations.filter((d: { to: string }) => d.to === address);

		// Calculate max track voting power for this delegate
		const maxDelegated = this.calculateMaxTrackVotingPower(delegateDelegations);

		// Calculate delegators and count
		const uniqueDelegators = new Set(delegateDelegations.map((d: { from: string }) => d.from));

		return {
			maxDelegated,
			receivedDelegationsCount: delegateDelegations.length,
			last30DaysVotedProposalsCount: subsquidData.convictionVotesConnection.totalCount,
			delegators: Array.from(uniqueDelegators) as string[]
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

					const voteMetrics = await this.GetPostVoteMetrics({ network, proposalType: EProposalType.REFERENDUM_V2, indexOrHash: String(proposal.index ?? proposal.hash)! });

					return {
						createdAt: new Date(proposal.createdAt),
						description: proposal.description || '',
						index: proposal.index,
						origin: proposal.origin,
						proposer: proposal.proposer || '',
						status: proposal.status || EProposalStatus.Unknown,
						type: EProposalType.REFERENDUM_V2,
						hash: proposal.hash || '',
						...(voteMetrics && { voteMetrics }),
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

	static async GetTrackAnalyticsStats({ network, trackId }: { network: ENetwork; trackId?: number }): Promise<ITrackAnalyticsStats> {
		const gqlClient = this.subsquidGqlClient(network);

		const query = this.GET_TRACK_ANALYTICS_STATS;

		const { data: subsquidData, error: subsquidErr } = await gqlClient.query(query, { track_num: trackId, before: dayjs().subtract(7, 'days').toISOString() }).toPromise();

		if (subsquidErr || !subsquidData) {
			console.error(`Error fetching on-chain track analytics stats from Subsquid: ${subsquidErr}`);
			throw new APIError(ERROR_CODES.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR, 'Error fetching on-chain track analytics stats from Subsquid');
		}

		const changeInActiveProposals =
			subsquidData.totalActiveProposals.totalCount && subsquidData.diffActiveProposals.totalCount
				? (subsquidData.diffActiveProposals.totalCount * 100) / subsquidData.totalActiveProposals.totalCount
				: 0;
		return {
			totalActiveProposals: subsquidData.totalActiveProposals.totalCount,
			totalProposalCount: subsquidData.totalProposalCount.totalCount,
			changeInActiveProposals
		};
	}

	static async GetTrackAnalyticsDelegations({ network, trackId }: { network: ENetwork; trackId?: number }): Promise<ITrackAnalyticsDelegations> {
		const gqlClient = this.subsquidGqlClient(network);

		const query = this.GET_TRACK_ANALYTICS_DELEGATIONS;

		const { data: subsquidData, error: subsquidErr } = await gqlClient.query(query, { track_num: trackId }).toPromise();

		if (subsquidErr || !subsquidData) {
			console.error(`Error fetching on-chain track analytics delegations from Subsquid: ${subsquidErr}`);
			throw new APIError(ERROR_CODES.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR, 'Error fetching on-chain track analytics delegations from Subsquid');
		}

		let totalCapital = BN_ZERO;
		let totalVotesBalance = BN_ZERO;
		const totalDelegatorsObj: ITrackAnalyticsDelegationsList = {};
		const totalDelegateesObj: ITrackAnalyticsDelegationsList = {};

		if (subsquidData?.votingDelegations?.length) {
			subsquidData?.votingDelegations.forEach((delegation: { lockPeriod: number; balance: string; from: string; to: string }) => {
				const bnBalance = new BN(delegation?.balance);
				const bnConviction = new BN(delegation?.lockPeriod || 1);
				const vote = delegation?.lockPeriod ? bnBalance.mul(bnConviction) : bnBalance.div(new BN('10'));

				totalVotesBalance = totalVotesBalance.add(vote);

				totalCapital = totalCapital.add(bnBalance);

				if (totalDelegateesObj[delegation?.to] === undefined) {
					totalDelegateesObj[delegation?.to] = {
						count: 1,
						data: [{ capital: delegation.balance, from: delegation?.from, lockedPeriod: delegation.lockPeriod || 0.1, to: delegation?.to, votingPower: vote.toString() }]
					};
				} else {
					const existingCount = totalDelegateesObj[delegation?.to]?.count || 0;
					totalDelegateesObj[delegation?.to] = {
						count: existingCount + 1,
						data: [
							...(totalDelegateesObj[delegation?.to]?.data || []),
							{ capital: delegation.balance, from: delegation?.from, lockedPeriod: delegation.lockPeriod || 0.1, to: delegation?.to, votingPower: vote.toString() }
						]
					};
				}
				if (totalDelegatorsObj[delegation?.from] === undefined) {
					totalDelegatorsObj[delegation?.from] = {
						count: 1,
						data: [{ capital: delegation.balance, from: delegation?.from, lockedPeriod: delegation.lockPeriod || 0.1, to: delegation?.to, votingPower: vote.toString() }]
					};
				} else {
					const existingCount = totalDelegatorsObj[delegation?.from]?.count || 0;
					totalDelegatorsObj[delegation?.from] = {
						count: existingCount + 1,
						data: [
							...(totalDelegatorsObj[delegation?.from]?.data || []),
							{ capital: delegation.balance, from: delegation?.from, lockedPeriod: delegation.lockPeriod || 0.1, to: delegation.to, votingPower: vote.toString() }
						]
					};
				}
			});
		}

		return {
			delegateesData: totalDelegateesObj,
			delegatorsData: totalDelegatorsObj,
			totalCapital: totalCapital.toString(),
			totalDelegates: Object.keys(totalDelegateesObj)?.length,
			totalDelegators: Object.keys(totalDelegatorsObj)?.length,
			totalVotesBalance: totalVotesBalance.toString()
		};
	}

	static async GetOnChainPostsByProposer({
		network,
		proposer,
		page,
		limit,
		proposalType
	}: {
		network: ENetwork;
		proposer: string;
		page: number;
		limit: number;
		proposalType: EProposalType;
	}) {
		const gqlClient = this.subsquidGqlClient(network);

		const query = this.GET_POSTS_BY_PROPOSER;

		const { data: subsquidData, error: subsquidErr } = await gqlClient
			.query(query, { proposer_eq: proposer, type_eq: proposalType, limit, offset: (page - 1) * limit })
			.toPromise();

		if (subsquidErr || !subsquidData) {
			console.error(`Error fetching on-chain posts by proposer from Subsquid: ${subsquidErr}`);
			throw new APIError(ERROR_CODES.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR, 'Error fetching on-chain posts by proposer from Subsquid');
		}
		const subsquidPostsData = subsquidData.proposals;
		if (!subsquidPostsData?.length) {
			return {
				totalCount: 0,
				items: []
			};
		}
		const postsPromises = subsquidPostsData.map((post: { index: number }) => {
			return this.GetOnChainPostInfo({
				network,
				indexOrHash: String(post.index),
				proposalType
			});
		});

		const postsResult = await Promise.allSettled(postsPromises);

		return {
			items: postsResult.map((post) => (post.status === 'fulfilled' ? post.value : null))?.filter((post) => post !== null),
			totalCount: subsquidData.proposalsConnection.totalCount || 0
		};
	}

	static async GetPostAnalytics({ network, proposalType, index }: { network: ENetwork; proposalType: EProposalType; index: number }): Promise<IPostAnalytics | null> {
		const gqlClient = this.subsquidGqlClient(network);

		const query = this.GET_ALL_FLATTENED_VOTES_WITH_POST_INDEX;

		const { data: subsquidData, error: subsquidErr } = await gqlClient.query(query, { vote_type: proposalType, index_eq: index, type_eq: proposalType }).toPromise();

		if (subsquidErr || !subsquidData) {
			console.error(`Error fetching on-chain post analytics from Subsquid: ${subsquidErr}`);
			throw new APIError(ERROR_CODES.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR, subsquidErr?.message || 'Error fetching on-chain post analytics from Subsquid');
		}

		if (subsquidData?.votes?.length === 0) {
			return null;
		}

		const votes = subsquidData.votes?.map((vote: { decision: string }) => {
			return {
				...vote,
				proposal: subsquidData.proposal[0],
				decision: this.convertSubsquidVoteDecisionToVoteDecision({ decision: vote.decision })
			};
		});

		const convictionsAnalytics = this.getVotesAnalytics({ votes, type: EAnalyticsType.CONVICTIONS });
		const votesAnalytics = this.getVotesAnalytics({ votes, type: EAnalyticsType.VOTES });
		const accountsAnalytics = this.getAccountsAnalytics({ votes });

		return {
			convictionsAnalytics,
			votesAnalytics,
			accountsAnalytics,
			proposal: {
				index,
				status: subsquidData?.proposal?.[0]?.status as EProposalStatus
			}
		};
	}

	static async GetPostBubbleVotes({
		network,
		proposalType,
		index,
		analyticsType,
		votesType
	}: {
		network: ENetwork;
		proposalType: EProposalType;
		index: number;
		analyticsType: EAnalyticsType;
		votesType: EVotesDisplayType;
	}): Promise<IPostBubbleVotes | null> {
		const gqlClient = this.subsquidGqlClient(network);

		const query = votesType === EVotesDisplayType.FLATTENED ? this.GET_ALL_FLATTENED_VOTES_WITH_POST_INDEX : this.GET_ALL_NESTED_VOTES_WITH_POST_INDEX;
		const { data: subsquidData, error: subsquidErr } = await gqlClient.query(query, { vote_type: proposalType, index_eq: index, type_eq: proposalType }).toPromise();

		if (subsquidErr || !subsquidData) {
			console.error(`Error fetching on-chain post analytics from Subsquid: ${subsquidErr}`);
			throw new APIError(ERROR_CODES.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR, 'Error fetching on-chain post analytics from Subsquid');
		}

		const data = subsquidData.votes;
		if (data?.length === 0) {
			return null;
		}

		const votesData: IPostBubbleVotes = {
			votes: {
				[EVoteDecision.AYE]: [],
				[EVoteDecision.NAY]: [],
				[EVoteDecision.ABSTAIN]: []
			},
			proposal: {
				status: (subsquidData?.proposal?.[0]?.status as EProposalStatus) || EProposalStatus.Unknown
			}
		};

		data?.forEach(
			(vote: {
				decision: string;
				balance: { value?: string; abstain?: string; aye?: string; nay?: string };
				voter: string;
				isDelegated?: boolean;
				delegatedVotingPower?: string;
				selfVotingPower?: string;
				parentVote: { delegatedVotingPower?: string; selfVotingPower?: string };
				delegatedVotes: IFlattenedConvictionVote[];
				lockPeriod: number;
			}) => {
				const decision = this.convertSubsquidVoteDecisionToVoteDecision({ decision: vote.decision });
				const balance = new BN(vote.balance?.value || vote.balance?.abstain || vote.balance?.aye || vote.balance?.nay || BN_ZERO.toString());
				const votingPower =
					analyticsType === EAnalyticsType.CONVICTIONS
						? votesType === EVotesDisplayType.FLATTENED
							? this.getVotingPower(balance?.toString(), vote?.lockPeriod)
							: this.getNestedVoteVotingPower(
									vote?.parentVote?.delegatedVotingPower || vote?.delegatedVotingPower || BN_ZERO.toString(),
									vote?.parentVote?.selfVotingPower || vote?.selfVotingPower || BN_ZERO.toString()
								)
						: null;

				votesData.votes[decision as keyof typeof votesData.votes]?.push({
					balanceValue: balance.toString(),
					voterAddress: vote.voter,
					lockPeriod: vote?.lockPeriod || 0,
					votingPower: votingPower?.toString(),
					isDelegated: vote?.isDelegated || false,
					delegatorsCount: vote?.delegatedVotes?.length || 0,
					decision
				});
			}
		);
		return votesData;
	}

	static async GetVotesForAddresses({
		network,
		voters,
		page,
		limit,
		proposalStatuses
	}: {
		network: ENetwork;
		voters: string[];
		page: number;
		limit: number;
		proposalStatuses?: EProposalStatus[];
	}): Promise<IGenericListingResponse<IProfileVote>> {
		const gqlClient = this.subsquidGqlClient(network);

		const query = this.GET_ALL_FLATTENED_VOTES_FOR_MULTIPLE_VOTERS;

		const variables = {
			limit,
			offset: (page - 1) * limit,
			voter_in: voters,
			...(proposalStatuses && { status_in: proposalStatuses })
		};

		const { data: subsquidData, error: subsquidErr } = await gqlClient.query(query, variables).toPromise();

		if (subsquidErr || !subsquidData) {
			console.error(`Error fetching on-chain votes for multiple voters from Subsquid: ${subsquidErr}`);
			throw new APIError(ERROR_CODES.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR, 'Error fetching on-chain votes for multiple voters from Subsquid');
		}

		const { votes, totalCount } = subsquidData;

		if (totalCount.totalCount === 0) {
			return {
				items: [],
				totalCount: totalCount.totalCount
			};
		}

		const votesData: IProfileVote[] = votes.map((vote: { decision: string; voter: string; proposalIndex: number; type: EProposalType; parentVote: { extrinsicIndex: string } }) => {
			return {
				...vote,
				decision: this.convertSubsquidVoteDecisionToVoteDecision({ decision: vote.decision }),
				voterAddress: vote.voter,
				proposalType: vote.type as EProposalType,
				extrinsicIndex: vote.parentVote?.extrinsicIndex || ''
			};
		});

		return {
			items: votesData,
			totalCount: totalCount.totalCount
		};
	}

	static async GetAllFlattenedVotesWithoutFilters({ network, page, limit }: { network: ENetwork; page: number; limit: number }): Promise<IGenericListingResponse<IProfileVote>> {
		const gqlClient = this.subsquidGqlClient(network);

		const query = this.GET_ALL_FLATTENED_VOTES_WITHOUT_FILTERS;

		const variables = {
			limit,
			offset: (page - 1) * limit
		};

		const { data: subsquidData, error: subsquidErr } = await gqlClient.query(query, variables).toPromise();

		if (subsquidErr || !subsquidData) {
			console.error(`Error fetching all flattened votes from Subsquid: ${subsquidErr}`);
			throw new APIError(ERROR_CODES.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR, 'Error fetching all flattened votes from Subsquid');
		}

		const { votes, totalCount } = subsquidData;

		if (totalCount.totalCount === 0) {
			return {
				items: [],
				totalCount: totalCount.totalCount
			};
		}

		const votesData: IProfileVote[] = votes.map((vote: { decision: string; voter: string; proposalIndex: number; type: EProposalType; parentVote: { extrinsicIndex: string } }) => {
			return {
				...vote,
				decision: this.convertSubsquidVoteDecisionToVoteDecision({ decision: vote.decision }),
				voterAddress: vote.voter,
				proposalType: vote.type as EProposalType,
				extrinsicIndex: vote.parentVote?.extrinsicIndex || ''
			};
		});

		return {
			items: votesData,
			totalCount: totalCount.totalCount
		};
	}

	static async GetGovAnalyticsStats({ network }: { network: ENetwork }): Promise<IGovAnalyticsStats> {
		const gqlClient = this.subsquidGqlClient(network);

		const query = this.GET_GOV_ANALYTICS_STATS;

		const { data: subsquidData, error: subsquidErr } = await gqlClient.query(query, {}).toPromise();

		if (subsquidErr || !subsquidData) {
			console.error(`Error fetching network governance analytics stats from Subsquid: ${subsquidErr}`);
			throw new APIError(ERROR_CODES.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR, 'Error fetching network governance analytics stats from Subsquid');
		}

		return {
			totalProposals: subsquidData.totalProposals.totalCount,
			approvedProposals: subsquidData.approvedProposals.totalCount
		};
	}

	static async GetGovAnalyticsReferendumOutcome({ network, trackNo }: { network: ENetwork; trackNo?: number }): Promise<IGovAnalyticsReferendumOutcome> {
		const gqlClient = this.subsquidGqlClient(network);

		const query = this.GET_GOV_ANALYTICS_REFERENDUM_OUTCOME;

		const { data: subsquidData, error: subsquidErr } = await gqlClient.query(query, { trackNo }).toPromise();

		if (subsquidErr || !subsquidData) {
			console.error(`Error fetching referendum outcome data from Subsquid: ${subsquidErr}`);
			throw new APIError(ERROR_CODES.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR, 'Error fetching referendum outcome data from Subsquid');
		}

		return {
			approved: subsquidData.approved.totalCount,
			rejected: subsquidData.rejected.totalCount,
			timeout: subsquidData.timeout.totalCount,
			ongoing: subsquidData.ongoing.totalCount,
			cancelled: subsquidData.cancelled.totalCount
		};
	}

	static async GetGovAnalyticsReferendumCount({ network }: { network: ENetwork }): Promise<{ categoryCounts: IGovAnalyticsCategoryCounts }> {
		const gqlClient = this.subsquidGqlClient(network);

		const query = this.GET_TOTAL_CATEGORY_PROPOSALS;

		const trackGroups = getTrackGroups(network);
		const promises = Object.entries(trackGroups).map(async ([group, trackIds]) => {
			try {
				const response = await gqlClient
					.query(query, {
						trackIds
					})
					.toPromise();

				return {
					group,
					count: response.data.count.totalCount
				};
			} catch (error) {
				console.error(`Error fetching count for group ${group}:`, error);
				return {
					group,
					count: null
				};
			}
		});

		const results = await Promise.all(promises);
		const groupResults = results.reduce(
			(acc, { group, count }) => {
				acc[group] = count;
				return acc;
			},
			{} as Record<string, number | null>
		);

		return {
			categoryCounts: {
				governance: groupResults.Governance ?? null,
				main: groupResults.Main ?? null,
				treasury: groupResults.Treasury ?? null,
				whiteList: groupResults.Whitelist ?? null
			}
		};
	}

	static async GetTurnoutData({ network }: { network: ENetwork }): Promise<IRawTurnoutData> {
		try {
			const { data: subsquidData, error: subsquidErr } = await this.subsquidGqlClient(network).query(SubsquidQueries.GET_TURNOUT_DATA, {}).toPromise();

			if (subsquidErr) {
				console.error('Subsquid Error:', subsquidErr);
				throw new APIError(ERROR_CODES.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR, 'Error fetching turnout data from Subsquid');
			}

			if (!subsquidData?.proposals) {
				console.error('No proposals found in response');
				return { proposals: [] };
			}

			return {
				proposals: subsquidData.proposals
			};
		} catch (error) {
			console.error('Error in GetTurnoutData:', error);
			throw error;
		}
	}

	static async GetTrackDelegationAnalyticsStats({ network }: { network: ENetwork }): Promise<Record<string, IGovAnalyticsDelegationStats>> {
		const gqlClient = this.subsquidGqlClient(network);

		const { data: subsquidData, error: subsquidErr } = await gqlClient.query(SubsquidQueries.GET_ALL_TRACK_LEVEL_ANALYTICS_DELEGATION_DATA, {}).toPromise();

		if (subsquidErr || !subsquidData) {
			console.error(`Error fetching track delegation analytics stats from Subsquid: ${subsquidErr}`);
			throw new APIError(ERROR_CODES.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR, 'Error fetching track delegation analytics stats from Subsquid');
		}

		const trackStats: Record<
			string,
			{
				totalCapital: string;
				totalVotesBalance: string;
				totalDelegates: number;
				totalDelegators: number;
				delegateesData: Record<string, { count: number }>;
				delegatorsData: Record<string, { count: number }>;
			}
		> = {};

		if (subsquidData.votingDelegations?.length) {
			subsquidData.votingDelegations.forEach((delegation: { lockPeriod: number; balance: string; from: string; to: string; track: number }) => {
				const { track } = delegation;
				const bnBalance = new BN(delegation.balance);
				const bnConviction = new BN(delegation.lockPeriod || 1);
				const vote = delegation.lockPeriod ? bnBalance.mul(bnConviction) : bnBalance.div(VOTING_POWER_DIVISOR);

				if (!trackStats[track]) {
					trackStats[track] = {
						totalCapital: '0',
						totalDelegates: 0,
						totalDelegators: 0,
						totalVotesBalance: '0',
						delegateesData: {},
						delegatorsData: {}
					};
				}

				trackStats[track].totalVotesBalance = new BN(trackStats[track].totalVotesBalance).add(vote).toString();
				trackStats[track].totalCapital = new BN(trackStats[track].totalCapital).add(bnBalance).toString();

				// Handle delegates
				if (!trackStats[track].delegateesData[delegation.to]) {
					trackStats[track].delegateesData[delegation.to] = {
						count: 1
					};
					trackStats[track].totalDelegates += 1;
				} else {
					trackStats[track].delegateesData[delegation.to].count += 1;
				}

				// Handle delegators
				if (!trackStats[track].delegatorsData[delegation.from]) {
					trackStats[track].delegatorsData[delegation.from] = {
						count: 1
					};
					trackStats[track].totalDelegators += 1;
				} else {
					trackStats[track].delegatorsData[delegation.from].count += 1;
				}
			});
		}

		return trackStats;
	}

	static async GetCohortReferenda({ network, indexStart, indexEnd }: { network: ENetwork; indexStart: number; indexEnd: number }) {
		const gqlClient = this.subsquidGqlClient(network);
		const { data, error } = await gqlClient
			.query(this.GET_COHORT_REFERENDA, {
				index_gte: indexStart,
				index_lte: indexEnd
			})
			.toPromise();

		if (error || !data) {
			console.error('Error fetching cohort referenda:', error);
			throw new APIError(ERROR_CODES.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR, 'Error fetching cohort referenda from Subsquid');
		}

		return data.proposals;
	}

	static async GetVotesForDelegateCohort({
		network,
		indexStart,
		indexEnd,
		voterAddresses
	}: {
		network: ENetwork;
		indexStart: number;
		indexEnd: number;
		voterAddresses: string[];
	}): Promise<IDVVotes[]> {
		const gqlClient = this.subsquidGqlClient(network);

		const referenda = await this.GetCohortReferenda({ network, indexStart, indexEnd });
		const indices = referenda.map((r: { index: number }) => r.index);

		if (indices.length === 0) {
			return [];
		}

		const encodedAddresses = voterAddresses.map((address) => getEncodedAddress(address, network)).filter((addr): addr is string => addr !== null);

		const chunkSize = 10;
		const chunkIndices: number[][] = [];
		for (let i = 0; i < indices.length; i += chunkSize) {
			chunkIndices.push(indices.slice(i, i + chunkSize));
		}

		const results = await Promise.all(
			chunkIndices.map(async (indicesChunk) => {
				const query = this.GET_BATCHED_VOTES_FOR_DELEGATE_COHORT(indicesChunk, encodedAddresses);
				const { data: subsquidData, error: subsquidErr } = await gqlClient.query(query, {}).toPromise();

				if (subsquidErr || !subsquidData) {
					console.error(`Error fetching on-chain post vote data from Subsquid: ${subsquidErr}`);
					throw new APIError(ERROR_CODES.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR, 'Error fetching on-chain post vote data from Subsquid');
				}

				return Object.values(subsquidData).flat();
			})
		);

		return results.flat() as IDVVotes[];
	}
}
