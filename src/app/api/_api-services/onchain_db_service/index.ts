// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ENetwork, EProposalType } from '@shared/types';
import { ValidatorService } from '@shared/_services/validator_service';
import { APIError } from '@api/_api-utils/apiError';
import { ERROR_CODES } from '@shared/_constants/errorLiterals';
import { StatusCodes } from 'http-status-codes';
import { OnChainSubsquidService } from './onchain_subsquid_service';

// TODO: implement fallbacks with onchain subsquare service, onchain subscan service, etc

export class OnChainDbService {
	static async GetOnChainPostInfo({ network, indexOrHash, proposalType }: { network: ENetwork; indexOrHash: string; proposalType: EProposalType }) {
		if (ValidatorService.isValidOffChainProposalType(proposalType)) {
			throw new APIError(ERROR_CODES.INVALID_PARAMS_ERROR, StatusCodes.BAD_REQUEST);
		}

		// fetch from subsquid
		const subsquidOnChainPostInfo = await OnChainSubsquidService.GetOnChainPostInfo({ network, indexOrHash, proposalType });
		if (subsquidOnChainPostInfo) return subsquidOnChainPostInfo;

		return null;
	}

	static async GetOnChainPostsListing({ network, proposalType, limit, page }: { network: ENetwork; proposalType: EProposalType; limit: number; page: number }) {
		if (ValidatorService.isValidOffChainProposalType(proposalType)) {
			throw new APIError(ERROR_CODES.INVALID_PARAMS_ERROR, StatusCodes.BAD_REQUEST);
		}

		// fetch from subsquid
		const subsquidOnChainPostsListing = await OnChainSubsquidService.GetOnChainPostsListing({ network, proposalType, limit, page });
		if (subsquidOnChainPostsListing) return subsquidOnChainPostsListing;

		return null;
	}
}
