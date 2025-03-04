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
	const zodQuerySchema = z.object({
		page: z.coerce.number().optional().default(1),
		limit: z.coerce.number().max(MAX_LISTING_LIMIT).optional().default(DEFAULT_LISTING_LIMIT)
	});

	const searchParamsObject = Object.fromEntries(Array.from(req.nextUrl.searchParams.entries()).map(([key]) => [key, req.nextUrl.searchParams.getAll(key)]));

	const { page, limit } = zodQuerySchema.parse(searchParamsObject);

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

	const totalCount = await OffChainDbService.GetPostSubscriptionCountByUserId({ userId, network });

	const userPostSubscriptions = await OffChainDbService.GetPostSubscriptionsByUserId({ userId, page, limit, network });

	// Fetch post data for each post subscription
	const postDataPromises = userPostSubscriptions.map(async (postSubscription) => {
		let postListingItem: IPostListing;

		const offChainPostData = await OffChainDbService.GetOffChainPostData({
			network,
			indexOrHash: postSubscription.indexOrHash,
			proposalType: postSubscription.proposalType
		});

		postListingItem = {
			...offChainPostData,
			network,
			proposalType: postSubscription.proposalType
		};

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

	let posts = await Promise.all(postDataPromises);

	// fetch reactions for each post
	const reactionsPromises = posts.map((post) => {
		return OffChainDbService.GetPostReactions({
			network,
			proposalType: post.proposalType,
			indexOrHash: post.index?.toString?.() || post.hash || ''
		});
	});

	const reactions = await Promise.all(reactionsPromises);
	posts = posts.map((post, index) => ({
		...post,
		reactions: reactions[Number(index)] || []
	}));

	// Sort posts by comment count in descending order
	posts.sort((a, b) => {
		const commentsA = a.metrics?.comments || 0;
		const commentsB = b.metrics?.comments || 0;
		return commentsB - commentsA;
	});

	// fetch public user for each post
	const publicUserPromises = posts.map((post) => {
		if (ValidatorService.isValidUserId(Number(post.userId || -1))) {
			return OffChainDbService.GetPublicUserById(Number(post.userId));
		}
		if (post.onChainInfo?.proposer && ValidatorService.isValidWeb3Address(post.onChainInfo?.proposer || '')) {
			return OffChainDbService.GetPublicUserByAddress(post.onChainInfo.proposer);
		}
		return null;
	});

	const publicUsers = await Promise.all(publicUserPromises);

	posts = posts.map((post, index) => ({
		...post,
		...(publicUsers[Number(index)] ? { publicUser: publicUsers[Number(index)] as IPublicUser } : {})
	}));

	const responseData: IGenericListingResponse<IPostListing> = { items: posts, totalCount };

	// Cache the response
	await RedisService.SetSubscriptionFeed({ network, page, limit, data: responseData, userId });

	const response = NextResponse.json(responseData);
	response.headers.append(COOKIE_HEADER_ACTION_NAME, await AuthService.GetAccessTokenCookie(newAccessToken));
	response.headers.append(COOKIE_HEADER_ACTION_NAME, await AuthService.GetRefreshTokenCookie(newRefreshToken));
	return response;
});
