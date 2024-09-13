// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { OffChainDbService } from '@api/_api-services/offchain_db_service';
import { OnChainDbService } from '@api/_api-services/onchain_db_service';
import { APIError } from '@api/_api-utils/apiError';
import { getNetworkFromHeaders } from '@api/_api-utils/getNetworkFromHeaders';
import { withErrorHandling } from '@api/_api-utils/withErrorHandling';
import { ERROR_CODES } from '@shared/_constants/errorLiterals';
import { DEFAULT_LISTING_LIMIT, MAX_LISTING_LIMIT } from '@shared/_constants/listingLimit';
import { ValidatorService } from '@shared/_services/validator_service';
import { EProposalType, IPostListing } from '@shared/types';
import { StatusCodes } from 'http-status-codes';
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export const GET = withErrorHandling(async (req: NextRequest, { params }) => {
	const { proposalType = '' } = params;

	if (!proposalType || !ValidatorService.isValidProposalType(proposalType)) {
		throw new APIError(ERROR_CODES.INVALID_PARAMS_ERROR, StatusCodes.BAD_REQUEST);
	}

	// fetch page and limit from query params
	const page = Number(req.nextUrl.searchParams.get('page')) || 1;
	const limit = Number(req.nextUrl.searchParams.get('limit')) || DEFAULT_LISTING_LIMIT;

	if (limit > MAX_LISTING_LIMIT) {
		throw new APIError(ERROR_CODES.INVALID_PARAMS_ERROR, StatusCodes.BAD_REQUEST, `Limit cannot be greater than ${MAX_LISTING_LIMIT}`);
	}

	if (isNaN(page) || isNaN(limit)) {
		throw new APIError(ERROR_CODES.INVALID_PARAMS_ERROR, StatusCodes.BAD_REQUEST, 'Invalid page or limit');
	}

	const network = getNetworkFromHeaders(headers());

	let posts: IPostListing[] = [];

	// 1. if proposal type is on-chain, get on-chain posts from onchain_db_service, then get the corresponding off-chain data from offchain_db_service for each on-chain post
	if (ValidatorService.isValidOnChainProposalType(proposalType)) {
		const onChainPosts = await OnChainDbService.GetOnChainPostsListing({ network, proposalType, limit, page });

		if (!onChainPosts) {
			throw new APIError(ERROR_CODES.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to fetch on-chain posts');
		}

		// Fetch off-chain data
		const offChainDataPromises = onChainPosts.map((post) => {
			return OffChainDbService.GetOffChainPostData({
				network,
				indexOrHash: proposalType === EProposalType.TIP ? post.index.toString() : post.hash,
				proposalType
			});
		});

		const offChainData = await Promise.all(offChainDataPromises);

		// Merge on-chain and off-chain data
		posts = onChainPosts.map((post, index) => ({
			...offChainData[Number(index)],
			network,
			proposalType,
			onChainInfo: post
		}));
	} else {
		// 2. if proposal type is off-chain, get off-chain posts from offchain_db_service
		posts = await OffChainDbService.GetOffChainPostsListing({
			network,
			proposalType,
			limit,
			page
		});
	}

	// 3. return the data
	return NextResponse.json(posts);
});
