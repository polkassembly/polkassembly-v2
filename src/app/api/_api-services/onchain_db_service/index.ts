// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import {
	ENetwork,
	EPostOrigin,
	EProposalStatus,
	EProposalType,
	EVoteDecision,
	IOnChainPostListing,
	IGenericListingResponse,
	IVoteCurve,
	IPreimage,
	IBountyStats,
	IBountyProposal,
	IBountyUserActivity,
	IDelegationStats,
	EBountyStatus,
	EVoteSortOptions
} from '@shared/types';
import { ValidatorService } from '@shared/_services/validator_service';
import { APIError } from '@api/_api-utils/apiError';
import { BN, BN_ZERO } from '@polkadot/util';
import { ERROR_CODES } from '@shared/_constants/errorLiterals';
import { StatusCodes } from 'http-status-codes';
import { encodeAddress } from '@polkadot/util-crypto';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { SubsquidService } from './subsquid_service';
import { SubsquareOnChainService } from './subsquare_onchain_service';
import { SubscanOnChainService } from './subscan_onchain_service';

export class OnChainDbService {
	static async GetOnChainPostInfo({ network, indexOrHash, proposalType }: { network: ENetwork; indexOrHash: string; proposalType: EProposalType }) {
		if (ValidatorService.isValidOffChainProposalType(proposalType)) {
			throw new APIError(ERROR_CODES.INVALID_PARAMS_ERROR, StatusCodes.BAD_REQUEST);
		}

		// fetch from subsquid
		const subsquidOnChainPostInfo = await SubsquidService.GetOnChainPostInfo({ network, indexOrHash, proposalType });
		if (subsquidOnChainPostInfo) return subsquidOnChainPostInfo;

		const subsquareOnChainPostInfo = await SubsquareOnChainService.GetOnChainPostInfo({ network, indexOrHash, proposalType });
		if (subsquareOnChainPostInfo) return subsquareOnChainPostInfo;

		const subscanOnChainPostInfo = await SubscanOnChainService.GetOnChainPostInfo({ network, indexOrHash, proposalType });
		if (subscanOnChainPostInfo) return subscanOnChainPostInfo;

		return null;
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
		if (ValidatorService.isValidOffChainProposalType(proposalType)) {
			throw new APIError(ERROR_CODES.INVALID_PARAMS_ERROR, StatusCodes.BAD_REQUEST);
		}

		if (notVotedByAddresses?.length && !statuses?.length) {
			throw new APIError(ERROR_CODES.INVALID_PARAMS_ERROR, StatusCodes.BAD_REQUEST, 'Statuses are required when notVotedByAddresses is provided.');
		}

		// fetch from subsquid
		const subsquidOnChainPostsListing = await SubsquidService.GetOnChainPostsListing({
			network,
			proposalType,
			limit,
			page,
			statuses,
			origins,
			notVotedByAddresses
		});

		if (subsquidOnChainPostsListing) return subsquidOnChainPostsListing;

		return {
			items: [],
			totalCount: 0
		};
	}

	static async GetPostVoteData({
		network,
		proposalType,
		indexOrHash,
		page,
		limit,
		decision,
		voterAddress,
		orderBy
	}: {
		network: ENetwork;
		proposalType: EProposalType;
		indexOrHash: string;
		page: number;
		limit: number;
		decision?: EVoteDecision;
		voterAddress?: string;
		orderBy?: EVoteSortOptions;
	}) {
		const postVoteData = await SubsquidService.GetPostVoteData({ network, proposalType, indexOrHash, page, limit, decision, voterAddress, orderBy });
		if (postVoteData) return postVoteData;

		return {
			votes: [],
			totalCounts: {}
		};
	}

	static async GetPostVoteCurves({ network, index }: { network: ENetwork; index: number }): Promise<IVoteCurve[]> {
		const voteCurves = await SubsquidService.GetPostVoteCurves({ network, index });
		if (voteCurves) return voteCurves;

		return [];
	}

	static async GetPostOnChainMetadata({ network, indexOrHash, proposalType }: { network: ENetwork; indexOrHash: string; proposalType: EProposalType }) {
		const onChainMetadata = await SubsquidService.GetPostOnChainMetadata({ network, indexOrHash, proposalType });
		if (onChainMetadata) return onChainMetadata;

		return null;
	}

	static async GetPreimageListing({ network, page, limit }: { network: ENetwork; page: number; limit: number }) {
		const preimageListing = await SubsquidService.GetPreimageListing({ network, page, limit });
		if (preimageListing) return preimageListing;

		return {
			items: [],
			totalCount: 0
		};
	}

	static async GetPreimageByHash({ network, hash }: { network: ENetwork; hash: string }): Promise<IPreimage | null> {
		const preimage = await SubsquidService.GetPreimageByHash({ network, hash });
		if (preimage) return preimage;

		return null;
	}

	static async GetActiveVotedProposalsCount({
		addresses,
		network
	}: {
		addresses: string[];
		network: ENetwork;
	}): Promise<{ activeProposalsCount: number; votedProposalsCount: number }> {
		return SubsquidService.GetActiveVotedProposalsCount({ addresses, network });
	}

	static async GetBountyStats(network: ENetwork): Promise<IBountyStats> {
		const activeBountiesResponse = await SubsquidService.GetActiveBountiesWithRewardsByIndex({ network });
		const defaultStats: IBountyStats = {
			activeBounties: 0,
			availableBountyPool: '',
			peopleEarned: 0,
			totalBountyPool: '',
			totalRewarded: '',
			bountyAmount: ''
		};

		const activeProposals = activeBountiesResponse?.data?.items || [];
		const total = activeProposals.reduce((acc: BN, { reward }) => {
			return acc.add(new BN(reward || '0'));
		}, BN_ZERO);

		const activeBounties = activeBountiesResponse?.data?.totalCount || 0;

		if (!activeBounties) {
			return defaultStats;
		}

		const activeBountyIndices = activeProposals.map(({ index }: IBountyProposal) => index);

		const childBountiesResponse = await SubsquidService.GetChildBountiesRewards({ network, parentBountyIndices: activeBountyIndices });

		if (!childBountiesResponse?.data?.totalCount) {
			return {
				...defaultStats,
				activeBounties: Number(activeBounties),
				totalBountyPool: total.toString()
			};
		}

		const totalBountyPool = childBountiesResponse.data.items.reduce((totalValue: BN, { reward }: IBountyProposal) => totalValue.add(new BN(reward)), BN_ZERO);

		const awardedChildBounties = childBountiesResponse.data.items.filter((bounty: IBountyProposal) =>
			bounty.statusHistory?.some((item) => item?.status === EProposalStatus.Awarded)
		);

		const totalRewarded = awardedChildBounties.reduce((totalValue: BN, { reward }: IBountyProposal) => totalValue.add(new BN(reward)), BN_ZERO);

		return {
			activeBounties: Number(activeBounties),
			availableBountyPool: totalBountyPool.toString(),
			peopleEarned: childBountiesResponse.data.totalCount,
			totalBountyPool: totalBountyPool.toString(),
			totalRewarded: totalRewarded.toString(),
			bountyAmount: total.div(new BN(10).pow(new BN(10))).toString()
		};
	}

	static async GetBountyUserActivity(network: ENetwork, limit?: number): Promise<IBountyUserActivity[]> {
		const activeBountiesResponse = await SubsquidService.GetActiveBountiesWithRewardsByIndex({ network, limit });

		if (!activeBountiesResponse?.data?.totalCount) {
			return [];
		}

		const activeBountyIndices = activeBountiesResponse.data.items.map(({ index }: IBountyProposal) => index);

		const claimedChildBounties = await SubsquidService.GetChildBountiesRewards({ network, parentBountyIndices: activeBountyIndices, limit });

		if (!claimedChildBounties?.data?.totalCount) {
			return [];
		}

		return claimedChildBounties.data.items.map((proposal) => {
			const claimedProposal = proposal as IBountyProposal;
			return {
				activity: EBountyStatus.CLAIMED,
				address: claimedProposal.payee,
				amount: claimedProposal.reward,
				created_at: new Date(claimedProposal.statusHistory[0].timestamp)
			};
		});
	}

	static async GetChildBountiesByParentBountyIndex({ network, index, page, limit }: { network: ENetwork; index: number; page: number; limit: number }) {
		return SubsquidService.GetChildBountiesByParentBountyIndex({ network, index, page, limit });
	}

	static async GetConvictionVotingDelegationStats(network: ENetwork): Promise<IDelegationStats> {
		return SubsquidService.GetConvictionVotingDelegationStats(network);
	}

	static async GetLast30DaysConvictionVoteCountByAddress({ network, address }: { network: ENetwork; address: string }): Promise<number> {
		return SubsquidService.GetLast30DaysConvictionVoteCountByAddress({
			network,
			address: ValidatorService.isValidSubstrateAddress(address) ? encodeAddress(address, NETWORKS_DETAILS[network as ENetwork].ss58Format) : address
		});
	}

	static async GetAllDelegatesWithConvictionVotingPowerAndDelegationsCount(network: ENetwork) {
		return SubsquidService.GetAllDelegatesWithConvictionVotingPowerAndDelegationsCount(network);
	}

	static async GetDelegateDetails({ network, address }: { network: ENetwork; address: string }) {
		return SubsquidService.GetDelegateDetails({
			network,
			address: ValidatorService.isValidSubstrateAddress(address) ? encodeAddress(address, NETWORKS_DETAILS[network as ENetwork].ss58Format) : address
		});
	}

	static async GetConvictionVoteDelegationsToAndFromAddress({ network, address, trackNum }: { network: ENetwork; address: string; trackNum?: number }) {
		return SubsquidService.GetConvictionVoteDelegationsToAndFromAddress({
			network,
			address: ValidatorService.isValidSubstrateAddress(address) ? encodeAddress(address, NETWORKS_DETAILS[network as ENetwork].ss58Format) : address,
			trackNum
		});
	}

	static async GetActiveProposalsCountByTrackIds({ network, trackIds }: { network: ENetwork; trackIds: number[] }) {
		return SubsquidService.GetActiveProposalsCountByTrackIds({ network, trackIds });
	}

	static async GetActiveProposalListingsWithVoteForAddressByTrackId({ network, trackId, voterAddress }: { network: ENetwork; trackId: number; voterAddress: string }) {
		const formattedVoterAddress = ValidatorService.isValidSubstrateAddress(voterAddress)
			? encodeAddress(voterAddress, NETWORKS_DETAILS[network as ENetwork].ss58Format)
			: voterAddress;

		return SubsquidService.GetActiveProposalListingsWithVoteForAddressByTrackId({ network, trackId, voterAddress: formattedVoterAddress });
	}

	static async GetTrackAnalyticsStats({ network, trackId }: { network: ENetwork; trackId?: number }) {
		return SubsquidService.GetTrackAnalyticsStats({ network, trackId });
	}

	static async GetTrackAnalyticsDelegations({ network, trackId }: { network: ENetwork; trackId?: number }) {
		return SubsquidService.GetTrackAnalyticsDelegations({ network, trackId });
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
		return SubsquidService.GetOnChainPostsByProposer({ network, proposer, page, limit, proposalType });
	}
}
