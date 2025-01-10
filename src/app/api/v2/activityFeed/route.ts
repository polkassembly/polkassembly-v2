// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextRequest, NextResponse } from 'next/server';
import { EDataSource, EProposalType, IPostListing } from '@/_shared/types';
import { z } from 'zod';
import { DEFAULT_LISTING_LIMIT, MAX_LISTING_LIMIT } from '@/_shared/_constants/listingLimit';
import { ACTIVE_PROPOSAL_STATUSES } from '@/_shared/_constants/activeProposalStatuses';
import { getNetworkFromHeaders } from '../../_api-utils/getNetworkFromHeaders';
import { withErrorHandling } from '../../_api-utils/withErrorHandling';
import { AuthService } from '../../_api-services/auth_service';
import { OnChainDbService } from '../../_api-services/onchain_db_service';
import { OffChainDbService } from '../../_api-services/offchain_db_service';

// 1.1 if user is logged in fetch all posts where status is active and user has not voted, sorted by createdAt
// 1.2 if user is not logged in fetch all posts where status is active, sorted by createdAt
// 2. fetch offchain data for each post with metrics
// 3. sort by comments as well

export const GET = withErrorHandling(async (req: NextRequest) => {
	const zodQuerySchema = z.object({
		page: z.coerce.number().optional().default(1),
		limit: z.coerce.number().max(MAX_LISTING_LIMIT).optional().default(DEFAULT_LISTING_LIMIT)
	});

	const { page, limit } = zodQuerySchema.parse(Object.fromEntries(req.nextUrl.searchParams));

	let isUserAuthenticated = false;
	let accessToken: string | undefined;
	let refreshToken: string | undefined;

	// 1. check if user is authenticated
	try {
		const { newAccessToken, newRefreshToken } = await AuthService.ValidateAuthAndRefreshTokens();
		isUserAuthenticated = true;
		accessToken = newAccessToken;
		refreshToken = newRefreshToken;
	} catch {
		isUserAuthenticated = false;
	}

	let userAddresses: string[] = [];

	if (isUserAuthenticated && accessToken) {
		const userId = AuthService.GetUserIdFromAccessToken(accessToken);
		userAddresses = (await OffChainDbService.GetAddressesForUserId(userId)).map((a) => a.address);
	}

	const network = await getNetworkFromHeaders();

	let posts: IPostListing[] = [];
	let totalCount = 0;

	const onChainPostsListingResponse = await OnChainDbService.GetOnChainPostsListing({
		network,
		proposalType: EProposalType.REFERENDUM_V2,
		limit,
		page,
		statuses: ACTIVE_PROPOSAL_STATUSES,
		notVotedByAddresses: isUserAuthenticated && userAddresses.length ? userAddresses : undefined
	});

	// Fetch off-chain data
	const offChainDataPromises = onChainPostsListingResponse.posts.map((postInfo) => {
		return OffChainDbService.GetOffChainPostData({
			network,
			indexOrHash: postInfo.index.toString(),
			proposalType: EProposalType.REFERENDUM_V2,
			proposer: postInfo.proposer || ''
		});
	});

	const offChainData = await Promise.all(offChainDataPromises);

	// Merge on-chain and off-chain data
	posts = onChainPostsListingResponse.posts.map((postInfo, index) => ({
		...offChainData[Number(index)],
		dataSource: offChainData[Number(index)]?.dataSource || EDataSource.POLKASSEMBLY,
		network,
		proposalType: EProposalType.REFERENDUM_V2,
		onChainInfo: postInfo
	}));

	// Sort posts by comment count in descending order
	posts.sort((a, b) => {
		const commentsA = a.metrics?.comments || 0;
		const commentsB = b.metrics?.comments || 0;
		return commentsB - commentsA;
	});

	totalCount = onChainPostsListingResponse.totalCount;

	const response = NextResponse.json({ posts, totalCount });

	if (accessToken) {
		response.headers.append('Set-Cookie', await AuthService.GetAccessTokenCookie(accessToken));
	}
	if (refreshToken) {
		response.headers.append('Set-Cookie', await AuthService.GetRefreshTokenCookie(refreshToken));
	}

	return response;
});
