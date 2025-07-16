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
import { dayjs } from '@shared/_utils/dayjsInit';
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

			return this.GetPostVoteMetrics({ network, proposalType, indexOrHash: (ValidatorService.isValidNumber(proposal.index) ? String(proposal.index) : proposal.hash) as string });
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

	private static getVotesQuery({
		proposalType,
		subsquidDecision,
		votesType,
		voterAddress
	}: {
		proposalType: EProposalType;
		subsquidDecision: string | null;
		votesType?: EVotesDisplayType;
		voterAddress?: string;
	}): string {
		// Handle TIP proposal type
		if (proposalType === EProposalType.TIP) {
			return subsquidDecision
				? this.GET_VOTES_LISTING_BY_PROPOSAL_TYPE_AND_HASH_AND_DECISION({ voter: voterAddress })
				: this.GET_VOTES_LISTING_BY_PROPOSAL_TYPE_AND_HASH({ voter: voterAddress });
		}

		// Handle REFERENDUM_V2 and FELLOWSHIP_REFERENDUM
		const isConvictionVoteType = [EProposalType.REFERENDUM_V2, EProposalType.FELLOWSHIP_REFERENDUM].includes(proposalType);

		if (isConvictionVoteType) {
			const isFlattened = votesType === EVotesDisplayType.FLATTENED;

			if (subsquidDecision) {
				return isFlattened
					? this.GET_FLATTENED_VOTES_LISTING_BY_PROPOSAL_TYPE_AND_INDEX_AND_DECISION({ voter: voterAddress })
					: this.GET_CONVICTION_VOTES_LISTING_BY_PROPOSAL_TYPE_AND_INDEX_AND_DECISION({ voter: voterAddress });
			}

			return isFlattened
				? this.GET_FLATTENED_VOTES_LISTING_BY_PROPOSAL_TYPE_AND_INDEX({ voter: voterAddress })
				: this.GET_CONVICTION_VOTES_LISTING_BY_PROPOSAL_TYPE_AND_INDEX({ voter: voterAddress });
		}

		// Handle other proposal types
		return subsquidDecision
			? this.GET_VOTES_LISTING_BY_PROPOSAL_TYPE_AND_INDEX_AND_DECISION({ voter: voterAddress })
			: this.GET_VOTES_LISTING_BY_PROPOSAL_TYPE_AND_INDEX({ voter: voterAddress });
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
		voterAddress: address,
		orderBy,
		votesType
	}: {
		network: ENetwork;
		proposalType: EProposalType;
		indexOrHash: string;
		page: number;
		limit: number;
		decision?: EVoteDecision;
		voterAddress?: string;
		orderBy?: EVoteSortOptions;
		votesType?: EVotesDisplayType;
	}) {
		const voterAddress = address ? (getEncodedAddress(address, network) ?? undefined) : undefined;

		const gqlClient = this.subsquidGqlClient(network);

		const subsquidDecision = decision ? this.convertVoteDecisionToSubsquidFormat({ decision }) : null;
		const subsquidDecisionIn = decision ? (votesType === EVotesDisplayType.NESTED ? this.convertVoteDecisionToSubsquidFormatArray({ decision }) : [subsquidDecision]) : null;

		const query = this.getVotesQuery({
			proposalType,
			subsquidDecision,
			votesType,
			voterAddress
		});

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
	): Promise<Record<string, { votingPower: string; delegators: string[]; receivedDelegationsCount: number }>> {
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

		const result: Record<string, { votingPower: string; delegators: string[]; receivedDelegationsCount: number }> = {};

		subsquidData.votingDelegations.forEach((delegation: { to: string; balance: string; lockPeriod: number; from: string }) => {
			const delegators = result[delegation.to]
				? result[delegation.to].delegators
				: (Array.from(new Set(subsquidData.votingDelegations.filter((d: { to: string }) => d.to === delegation.to)?.map((d: { from: string }) => d.from))) as string[]);

			result[delegation.to] = {
				votingPower: result[delegation.to]?.votingPower
					? new BN(result[delegation.to].votingPower).add(this.getVotingPower(delegation.balance, delegation.lockPeriod)).toString()
					: this.getVotingPower(delegation.balance, delegation.lockPeriod).toString(),
				delegators,
				receivedDelegationsCount: result[delegation.to]?.receivedDelegationsCount ? result[delegation.to].receivedDelegationsCount + 1 : 1
			};
		});

		return result;
	}

	static async GetDelegateDetails({ network, address }: { network: ENetwork; address: string }): Promise<{
		votingPower: string;
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

		const votingPower = subsquidData.votingDelegations.reduce((acc: BN, delegation: { balance: string }) => {
			return new BN(acc).add(new BN(delegation.balance));
		}, BN_ZERO);

		const uniqueDelegates = new Set(subsquidData.votingDelegations.filter((d: { to: string }) => d.to === address)?.map((d: { from: string }) => d.from));

		return {
			votingPower: votingPower.toString(),
			receivedDelegationsCount: subsquidData.votingDelegations.length,
			last30DaysVotedProposalsCount: subsquidData.convictionVotesConnection.totalCount,
			delegators: Array.from(uniqueDelegates) as string[]
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
}
