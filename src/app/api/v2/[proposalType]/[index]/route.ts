// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { OffChainDbService } from '@api/_api-services/offchain_db_service';
import { OnChainDbService } from '@api/_api-services/onchain_db_service';
import { APIError } from '@api/_api-utils/apiError';
import { getNetworkFromHeaders } from '@api/_api-utils/getNetworkFromHeaders';
import { withErrorHandling } from '@api/_api-utils/withErrorHandling';
import { ERROR_CODES } from '@shared/_constants/errorLiterals';
import { ValidatorService } from '@shared/_services/validator_service';
import { ENetwork, EProposalType, IPost } from '@shared/types';
import { StatusCodes } from 'http-status-codes';
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export const GET = withErrorHandling(async (req: NextRequest, { params }) => {
	const { proposalType = '', index = '' } = params;

	if (!proposalType || !index || !ValidatorService.isValidProposalType(proposalType)) {
		throw new APIError(ERROR_CODES.INVALID_PARAMS_ERROR, StatusCodes.BAD_REQUEST);
	}

	const network = getNetworkFromHeaders(headers());

	const offChainPostData = await OffChainDbService.GetOffChainPostData({ network, indexOrHash: index, proposalType: proposalType as EProposalType });

	// if is off-chain post just return the offchain post data
	if (ValidatorService.isValidOffChainProposalType(proposalType)) {
		if (!offChainPostData) {
			throw new APIError(ERROR_CODES.POST_NOT_FOUND_ERROR, StatusCodes.NOT_FOUND);
		}

		return NextResponse.json(offChainPostData);
	}

	// is on-chain post
	const onChainPostInfo = await OnChainDbService.GetOnChainPostInfo({ network, indexOrHash: index, proposalType: proposalType as EProposalType });

	if (!onChainPostInfo) {
		throw new APIError(ERROR_CODES.POST_NOT_FOUND_ERROR, StatusCodes.NOT_FOUND);
	}

	const post: IPost = {
		...offChainPostData,
		proposalType: proposalType as EProposalType,
		network: network as ENetwork,
		onChainInfo: onChainPostInfo
	};

	return NextResponse.json(post);
});
