// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { deepParseJson } from 'deep-parse-json';
import { EDataSource, EPostOrigin, EProposalType, IActivityFeedPostListing, IGenericListingResponse, IReaction } from '@/_shared/types';
import { DEFAULT_LISTING_LIMIT, MAX_LISTING_LIMIT } from '@/_shared/_constants/listingLimit';
import { ACTIVE_PROPOSAL_STATUSES } from '@/_shared/_constants/activeProposalStatuses';
import { AuthService } from '@/app/api/_api-services/auth_service';
import { OnChainDbService } from '@/app/api/_api-services/onchain_db_service';
import { OffChainDbService } from '@/app/api/_api-services/offchain_db_service';
import { RedisService } from '@/app/api/_api-services/redis_service';
import { getNetworkFromHeaders } from '@/app/api/_api-utils/getNetworkFromHeaders';
import { withErrorHandling } from '@/app/api/_api-utils/withErrorHandling';

// 1.1 if user is logged in fetch all posts where status is active and user has not voted, sorted by createdAt
// 1.2 if user is not logged in fetch all posts where status is active, sorted by createdAt
// 2. fetch offchain data for each post with metrics
// 3. sort by comments as well

const ACTIVITY_FEED_PROPOSAL_TYPE = EProposalType.REFERENDUM_V2;
const COOKIE_HEADER_ACTION_NAME = 'Set-Cookie';

export const GET = withErrorHandling(async (req: NextRequest) => {
	const zodQuerySchema = z.object({
		page: z.coerce.number().optional().default(1),
		limit: z.coerce.number().max(MAX_LISTING_LIMIT).optional().default(DEFAULT_LISTING_LIMIT),
		origin: z.preprocess((val) => (Array.isArray(val) ? val : typeof val === 'string' ? [val] : undefined), z.array(z.nativeEnum(EPostOrigin))).optional()
	});

	const searchParamsObject = Object.fromEntries(Array.from(req.nextUrl.searchParams.entries()).map(([key]) => [key, req.nextUrl.searchParams.getAll(key)]));

	const { page, limit, origin: origins } = zodQuerySchema.parse(searchParamsObject);

	let isUserAuthenticated = false;
	let accessToken: string | undefined;
	let refreshToken: string | undefined;
	let userId: number | undefined;

	// 1. check if user is authenticated
	try {
		const { newAccessToken, newRefreshToken } = await AuthService.ValidateAuthAndRefreshTokens();
		isUserAuthenticated = true;
		accessToken = newAccessToken;
		refreshToken = newRefreshToken;
		if (accessToken) {
			userId = AuthService.GetUserIdFromAccessToken(accessToken);
		}
	} catch {
		isUserAuthenticated = false;
	}

	const network = await getNetworkFromHeaders();

	// Try to get from cache first
	const cachedData = await RedisService.GetActivityFeed({ network, page, limit, userId, origins });
	if (cachedData) {
		const response = NextResponse.json(deepParseJson(cachedData));
		if (accessToken) {
			response.headers.append(COOKIE_HEADER_ACTION_NAME, await AuthService.GetAccessTokenCookie(accessToken));
		}
		if (refreshToken) {
			response.headers.append(COOKIE_HEADER_ACTION_NAME, await AuthService.GetRefreshTokenCookie(refreshToken));
		}
		return response;
	}

	let userAddresses: string[] = [];

	if (isUserAuthenticated && accessToken && userId) {
		userAddresses = (await OffChainDbService.GetAddressesForUserId(userId)).map((a) => a.address);
	}

	let posts: IActivityFeedPostListing[] = [];
	let totalCount = 0;

	const onChainPostsListingResponse = await OnChainDbService.GetOnChainPostsListing({
		network,
		proposalType: ACTIVITY_FEED_PROPOSAL_TYPE,
		limit,
		page,
		statuses: ACTIVE_PROPOSAL_STATUSES,
		origins,
		notVotedByAddresses: isUserAuthenticated && userAddresses.length ? userAddresses : undefined
	});

	// Fetch off-chain data
	const offChainDataPromises = onChainPostsListingResponse.items.map((postInfo) => {
		return OffChainDbService.GetOffChainPostData({
			network,
			indexOrHash: postInfo.index.toString(),
			proposalType: ACTIVITY_FEED_PROPOSAL_TYPE,
			proposer: postInfo.proposer || ''
		});
	});

	const offChainData = await Promise.all(offChainDataPromises);

	let userReactions: (IReaction | null)[] = [];

	if (isUserAuthenticated && accessToken && userId) {
		// fetch user reaction for each post
		const userReactionPromises = onChainPostsListingResponse.items.map((postInfo) => {
			return OffChainDbService.GetUserReactionForPost({
				network,
				proposalType: ACTIVITY_FEED_PROPOSAL_TYPE,
				indexOrHash: postInfo.index.toString(),
				userId
			});
		});

		userReactions = await Promise.all(userReactionPromises);
	}

	// Merge on-chain and off-chain data
	posts = onChainPostsListingResponse.items.map((postInfo, index) => ({
		...offChainData[Number(index)],
		dataSource: offChainData[Number(index)]?.dataSource || EDataSource.POLKASSEMBLY,
		network,
		proposalType: ACTIVITY_FEED_PROPOSAL_TYPE,
		onChainInfo: postInfo,
		userReaction: userReactions[Number(index)] || undefined
	}));

	// Sort posts by comment count in descending order
	posts.sort((a, b) => {
		const commentsA = a.metrics?.comments || 0;
		const commentsB = b.metrics?.comments || 0;
		return commentsB - commentsA;
	});

	totalCount = onChainPostsListingResponse.totalCount;

	const responseData: IGenericListingResponse<IActivityFeedPostListing> = { items: posts, totalCount };

	// Cache the response
	await RedisService.SetActivityFeed({ network, page, limit, data: JSON.stringify(responseData), userId, origins });

	const response = NextResponse.json(responseData);

	if (accessToken) {
		response.headers.append(COOKIE_HEADER_ACTION_NAME, await AuthService.GetAccessTokenCookie(accessToken));
	}
	if (refreshToken) {
		response.headers.append(COOKIE_HEADER_ACTION_NAME, await AuthService.GetRefreshTokenCookie(refreshToken));
	}

	return response;
});
