// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { IPostListing, IGenericListingResponse, IPublicUser } from '@/_shared/types';
import { DEFAULT_LISTING_LIMIT, MAX_LISTING_LIMIT } from '@/_shared/_constants/listingLimit';
import { AuthService } from '@/app/api/_api-services/auth_service';
import { OnChainDbService } from '@/app/api/_api-services/onchain_db_service';
import { OffChainDbService } from '@/app/api/_api-services/offchain_db_service';
import { RedisService } from '@/app/api/_api-services/redis_service';
import { getNetworkFromHeaders } from '@/app/api/_api-utils/getNetworkFromHeaders';
import { withErrorHandling } from '@/app/api/_api-utils/withErrorHandling';
import { ValidatorService } from '@/_shared/_services/validator_service';
import { COOKIE_HEADER_ACTION_NAME } from '@/_shared/_constants/cookieHeaderActionName';

// 1. check for auth
// 2. fetch all post subscriptions for the user
// 3. fetch offchain data for each post with metrics
// 4. fetch onchain data for each post
// 5. sort by comments as well

export const GET = withErrorHandling(async (req: NextRequest) => {
	// Parse and validate query parameters
	const zodQuerySchema = z.object({
		page: z.coerce.number().optional().default(1),
		limit: z.coerce.number().max(MAX_LISTING_LIMIT).optional().default(DEFAULT_LISTING_LIMIT)
	});

	const searchParamsObject = Object.fromEntries(Array.from(req.nextUrl.searchParams.entries()).map(([key]) => [key, req.nextUrl.searchParams.getAll(key)]));
	const { page, limit } = zodQuerySchema.parse(searchParamsObject);

	// Authenticate user and get network
	const { newAccessToken, newRefreshToken } = await AuthService.ValidateAuthAndRefreshTokens();
	const userId = AuthService.GetUserIdFromAccessToken(newAccessToken);
	const network = await getNetworkFromHeaders();

	// Try to get from cache first
	const cachedData = await RedisService.GetSubscriptionFeed({ network, page, limit, userId });
	if (cachedData) {
		const response = NextResponse.json(cachedData);
		response.headers.append(COOKIE_HEADER_ACTION_NAME, await AuthService.GetAccessTokenCookie(newAccessToken));
		response.headers.append(COOKIE_HEADER_ACTION_NAME, await AuthService.GetRefreshTokenCookie(newRefreshToken));
		return response;
	}

	// Fetch subscriptions and count in parallel
	const [totalCount, userPostSubscriptions] = await Promise.all([
		OffChainDbService.GetPostSubscriptionCountByUserId({ userId, network }),
		OffChainDbService.GetPostSubscriptionsByUserId({ userId, page, limit, network })
	]);

	if (userPostSubscriptions.length === 0) {
		const emptyResponse: IGenericListingResponse<IPostListing> = { items: [], totalCount };

		// Cache the empty response
		await RedisService.SetSubscriptionFeed({ network, page, limit, data: emptyResponse, userId });

		const response = NextResponse.json(emptyResponse);
		response.headers.append(COOKIE_HEADER_ACTION_NAME, await AuthService.GetAccessTokenCookie(newAccessToken));
		response.headers.append(COOKIE_HEADER_ACTION_NAME, await AuthService.GetRefreshTokenCookie(newRefreshToken));
		return response;
	}

	// Batch fetch post data for all subscriptions in parallel
	const postDataPromises = userPostSubscriptions.map(async (postSubscription) => {
		// Fetch off-chain data for all posts in parallel
		const offChainPostData = await OffChainDbService.GetOffChainPostData({
			network,
			indexOrHash: postSubscription.indexOrHash,
			proposalType: postSubscription.proposalType
		});

		let postListingItem: IPostListing = {
			...offChainPostData,
			network,
			proposalType: postSubscription.proposalType
		};

		// Only fetch on-chain data if it's a valid on-chain proposal type
		if (ValidatorService.isValidOnChainProposalType(postSubscription.proposalType)) {
			const onChainPostInfo = await OnChainDbService.GetOnChainPostInfo({
				network,
				indexOrHash: postSubscription.indexOrHash,
				proposalType: postSubscription.proposalType
			});

			if (onChainPostInfo) {
				postListingItem = {
					...postListingItem,
					onChainInfo: {
						...onChainPostInfo,
						type: postSubscription.proposalType,
						createdAt: onChainPostInfo.createdAt || postSubscription.createdAt,
						description: onChainPostInfo.description || '',
						hash: onChainPostInfo.hash || ''
					}
				};
			}
		}

		return postListingItem;
	});

	// Wait for all post data to be fetched
	let posts = await Promise.all(postDataPromises);

	// Batch fetch reactions and public users in parallel
	const [reactions, publicUsers] = await Promise.all([
		// Fetch reactions for all posts in parallel
		Promise.all(
			posts.map((post) =>
				OffChainDbService.GetPostReactions({
					network,
					proposalType: post.proposalType,
					indexOrHash: post.index?.toString?.() || post.hash || ''
				})
			)
		),

		// Fetch public user data for all posts in parallel
		Promise.all(
			posts.map((post) => {
				if (ValidatorService.isValidUserId(Number(post.userId || -1))) {
					return OffChainDbService.GetPublicUserById(Number(post.userId));
				}
				if (post.onChainInfo?.proposer && ValidatorService.isValidWeb3Address(post.onChainInfo?.proposer || '')) {
					return OffChainDbService.GetPublicUserByAddress(post.onChainInfo.proposer);
				}
				return null;
			})
		)
	]);

	// Combine all data
	posts = posts.map((post, index) => ({
		...post,
		reactions: reactions[Number(index)] || [],
		...(publicUsers[Number(index)] ? { publicUser: publicUsers[Number(index)] as IPublicUser } : {})
	}));

	// Sort posts by comment count in descending order
	posts.sort((a, b) => (b.metrics?.comments || 0) - (a.metrics?.comments || 0));

	const responseData: IGenericListingResponse<IPostListing> = { items: posts, totalCount };

	// Cache the response
	await RedisService.SetSubscriptionFeed({ network, page, limit, data: responseData, userId });

	const response = NextResponse.json(responseData);
	response.headers.append(COOKIE_HEADER_ACTION_NAME, await AuthService.GetAccessTokenCookie(newAccessToken));
	response.headers.append(COOKIE_HEADER_ACTION_NAME, await AuthService.GetRefreshTokenCookie(newRefreshToken));
	return response;
});
