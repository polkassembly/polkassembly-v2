// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { EDataSource, EPostOrigin, EProposalType, IPostListing, IGenericListingResponse, IPublicUser, ENetwork } from '@/_shared/types';
import { DEFAULT_LISTING_LIMIT, MAX_LISTING_LIMIT } from '@/_shared/_constants/listingLimit';
import { ACTIVE_PROPOSAL_STATUSES } from '@/_shared/_constants/activeProposalStatuses';
import { AuthService } from '@/app/api/_api-services/auth_service';
import { OnChainDbService } from '@/app/api/_api-services/onchain_db_service';
import { OffChainDbService } from '@/app/api/_api-services/offchain_db_service';
import { RedisService } from '@/app/api/_api-services/redis_service';
import { getNetworkFromHeaders } from '@/app/api/_api-utils/getNetworkFromHeaders';
import { withErrorHandling } from '@/app/api/_api-utils/withErrorHandling';
import { ValidatorService } from '@/_shared/_services/validator_service';
import { encodeAddress, cryptoWaitReady } from '@polkadot/util-crypto';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';

// 1.1 if user is logged in fetch all posts where status is active and user has not voted, sorted by createdAt
// 1.2 if user is not logged in fetch all posts where status is active, sorted by createdAt
// 2. fetch offchain data for each post with metrics
// 3. sort by comments as well

const ACTIVITY_FEED_PROPOSAL_TYPE = EProposalType.REFERENDUM_V2;
const COOKIE_HEADER_ACTION_NAME = 'Set-Cookie';

// Helper function to create consistent response with auth cookies
async function createResponse(data: IGenericListingResponse<IPostListing>, accessToken?: string, refreshToken?: string) {
	const response = NextResponse.json(data);

	// Add auth cookies if available
	const cookiePromises = [];
	if (accessToken) {
		cookiePromises.push(AuthService.GetAccessTokenCookie(accessToken));
	}
	if (refreshToken) {
		cookiePromises.push(AuthService.GetRefreshTokenCookie(refreshToken));
	}

	if (cookiePromises.length > 0) {
		const cookies = await Promise.all(cookiePromises);
		cookies.forEach((cookie) => {
			response.headers.append(COOKIE_HEADER_ACTION_NAME, cookie);
		});
	}

	return response;
}

export const GET = withErrorHandling(async (req: NextRequest) => {
	// Parse query parameters
	const zodQuerySchema = z.object({
		page: z.coerce.number().optional().default(1),
		limit: z.coerce.number().max(MAX_LISTING_LIMIT).optional().default(DEFAULT_LISTING_LIMIT),
		origin: z.preprocess((val) => (Array.isArray(val) ? val : typeof val === 'string' ? [val] : undefined), z.array(z.nativeEnum(EPostOrigin))).optional()
	});

	const searchParamsObject = Object.fromEntries(Array.from(req.nextUrl.searchParams.entries()).map(([key]) => [key, req.nextUrl.searchParams.getAll(key)]));
	const { page, limit, origin: origins } = zodQuerySchema.parse(searchParamsObject);

	// Fetch network and authenticate user in parallel
	const [network, authResult] = await Promise.all([
		getNetworkFromHeaders(),
		AuthService.ValidateAuthAndRefreshTokens().catch(() => ({ newAccessToken: undefined, newRefreshToken: undefined })),
		cryptoWaitReady()
	]);

	const { newAccessToken: accessToken, newRefreshToken: refreshToken } = authResult;
	const isUserAuthenticated = !!accessToken;
	const userId = accessToken ? AuthService.GetUserIdFromAccessToken(accessToken) : undefined;

	// Try to get from cache first
	const cachedData = await RedisService.GetActivityFeed({ network, page, limit, userId, origins });
	if (cachedData) {
		return createResponse(cachedData, accessToken, refreshToken);
	}

	// Fetch user addresses if authenticated (needed for filtering posts not voted by user)
	const userAddressesPromise =
		isUserAuthenticated && userId
			? OffChainDbService.GetAddressesForUserId(userId).then((addresses) =>
					addresses.filter((a) => ValidatorService.isValidSubstrateAddress(a.address)).map((a) => encodeAddress(a.address, NETWORKS_DETAILS[network as ENetwork].ss58Format))
				)
			: Promise.resolve([]);

	// Fetch user addresses first, then use them for on-chain posts query
	const userAddresses = await userAddressesPromise;

	const onChainPostsListingResponse = await OnChainDbService.GetOnChainPostsListing({
		network,
		proposalType: ACTIVITY_FEED_PROPOSAL_TYPE,
		limit,
		page,
		statuses: ACTIVE_PROPOSAL_STATUSES,
		origins,
		notVotedByAddresses: isUserAuthenticated && userAddresses.length ? userAddresses : undefined
	});

	if (onChainPostsListingResponse.items.length === 0) {
		const emptyResponse: IGenericListingResponse<IPostListing> = { items: [], totalCount: onChainPostsListingResponse.totalCount };

		// Cache empty results too
		await RedisService.SetActivityFeed({ network, page, limit, data: emptyResponse, userId, origins });

		return createResponse(emptyResponse, accessToken, refreshToken);
	}

	// Prepare all data fetching operations in parallel
	const postDataPromises = onChainPostsListingResponse.items.map((postInfo) => {
		const indexOrHash = postInfo.index!.toString();

		// For each post, fetch off-chain data, reactions, and subscriptions in parallel
		return Promise.all([
			// Off-chain post data
			OffChainDbService.GetOffChainPostData({ network, indexOrHash, proposalType: ACTIVITY_FEED_PROPOSAL_TYPE, proposer: postInfo.proposer || '' }),

			// Post reactions
			OffChainDbService.GetPostReactions({ network, proposalType: ACTIVITY_FEED_PROPOSAL_TYPE, indexOrHash }),

			// User subscription (only if authenticated)
			isUserAuthenticated && userId
				? OffChainDbService.GetPostSubscriptionByPostAndUserId({ network, proposalType: ACTIVITY_FEED_PROPOSAL_TYPE, indexOrHash, userId })
				: Promise.resolve(null)
		]).then(([offChainData, reactions, subscription]) => ({ postInfo, offChainData, reactions, subscriptionId: subscription?.id || null }));
	});

	// Wait for all post data to be fetched
	const postsData = await Promise.all(postDataPromises);

	// Create merged posts with on-chain and off-chain data
	const posts = postsData.map(({ postInfo, offChainData, reactions, subscriptionId }) => ({
		...offChainData,
		dataSource: offChainData?.dataSource || EDataSource.POLKASSEMBLY,
		network,
		proposalType: ACTIVITY_FEED_PROPOSAL_TYPE,
		onChainInfo: postInfo,
		reactions,
		...(subscriptionId ? { userSubscriptionId: subscriptionId } : {})
	}));

	// Sort posts by comment count in descending order
	posts.sort((a, b) => (b.metrics?.comments || 0) - (a.metrics?.comments || 0));

	// Fetch public users for all posts in parallel
	const publicUserPromises = posts.map((post) => {
		if (ValidatorService.isValidUserId(Number(post.userId || -1))) {
			return OffChainDbService.GetPublicUserById(Number(post.userId));
		}
		if (post.onChainInfo?.proposer && ValidatorService.isValidWeb3Address(post.onChainInfo.proposer)) {
			return OffChainDbService.GetPublicUserByAddress(post.onChainInfo.proposer);
		}
		return Promise.resolve(null);
	});

	const publicUsers = await Promise.all(publicUserPromises);

	// Merge public user data with posts
	const enrichedPosts = posts.map((post, index) => ({ ...post, ...(publicUsers[Number(index)] ? { publicUser: publicUsers[Number(index)] as IPublicUser } : {}) }));

	const responseData: IGenericListingResponse<IPostListing> = { items: enrichedPosts, totalCount: onChainPostsListingResponse.totalCount };

	// Cache the response (don't await to avoid blocking the response)
	RedisService.SetActivityFeed({ network, page, limit, data: responseData, userId, origins }).catch((error) => console.error('Failed to cache activity feed:', error));

	return createResponse(responseData, accessToken, refreshToken);
});
