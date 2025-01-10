// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ENetwork, EPostOrigin, EProposalStatus, EProposalType, EVoteDecision } from '@shared/types';
import { ValidatorService } from '@shared/_services/validator_service';
import { APIError } from '@api/_api-utils/apiError';
import { ERROR_CODES } from '@shared/_constants/errorLiterals';
import { StatusCodes } from 'http-status-codes';
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
	}) {
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
			posts: [],
			totalCount: 0
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
		const postVoteData = await SubsquidService.GetPostVoteData({ network, proposalType, indexOrHash, page, limit, decision });
		if (postVoteData) return postVoteData;

		return {
			votes: [],
			totalCount: 0
		};
	}
}
