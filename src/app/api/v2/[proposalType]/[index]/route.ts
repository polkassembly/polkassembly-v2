// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { AuthService } from '@/app/api/_api-services/auth_service';
import { getReqBody } from '@/app/api/_api-utils/getReqBody';
import { OffChainDbService } from '@api/_api-services/offchain_db_service';
import { getNetworkFromHeaders } from '@api/_api-utils/getNetworkFromHeaders';
import { withErrorHandling } from '@api/_api-utils/withErrorHandling';
import { EAllowedCommentor, EHttpHeaderKey, EProposalType, IPost } from '@shared/types';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { RedisService } from '@/app/api/_api-services/redis_service';
import { fetchPostData } from '@/app/api/_api-utils/fetchPostData';
import { COOKIE_HEADER_ACTION_NAME } from '@/_shared/_constants/cookieHeaderActionName';
import { updatePostServer } from '@/app/api/_api-utils/updatePostServer';
import { ERROR_CODES } from '@/_shared/_constants/errorLiterals';
import { APIError } from '@/app/api/_api-utils/apiError';
import { StatusCodes } from 'http-status-codes';
import { headers } from 'next/headers';
import { fetchCommentsVoteData } from '@/app/api/_api-utils/fetchCommentsVoteData.server';

const SET_COOKIE = 'Set-Cookie';

const zodParamsSchema = z.object({
	proposalType: z.nativeEnum(EProposalType),
	index: z.string()
});

export const GET = withErrorHandling(async (req: NextRequest, { params }: { params: Promise<{ proposalType: string; index: string }> }): Promise<NextResponse<IPost>> => {
	const { proposalType, index } = zodParamsSchema.parse(await params);

	const [network, headersList] = await Promise.all([getNetworkFromHeaders(), headers()]);
	const skipCache = headersList.get(EHttpHeaderKey.SKIP_CACHE) === 'true';

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

	// Get post data from cache only if skipCache is not true
	let post: IPost | null = null;
	if (!skipCache) {
		post = await RedisService.GetPostData({ network, proposalType, indexOrHash: index });
	}

	if (post) {
		const response = NextResponse.json(post);

		if (accessToken) {
			response.headers.append(COOKIE_HEADER_ACTION_NAME, await AuthService.GetAccessTokenCookie(accessToken));
		}
		if (refreshToken) {
			response.headers.append(COOKIE_HEADER_ACTION_NAME, await AuthService.GetRefreshTokenCookie(refreshToken));
		}

		return response;
	}

	post = await fetchPostData({ network, proposalType, indexOrHash: index });

	// fetch post comments
	const comments = await OffChainDbService.GetPostComments({ network, proposalType, indexOrHash: index });
	const commentsWithVoteData = await fetchCommentsVoteData({ comments, network, proposalType, index });
	post = { ...post, comments: commentsWithVoteData };

	// fetch and add reactions to post
	const reactions = await OffChainDbService.GetPostReactions({ network, proposalType, indexOrHash: index });
	post = { ...post, reactions };

	// fetch and add content summary to post
	const contentSummary = await OffChainDbService.GetContentSummary({ network, indexOrHash: index, proposalType: proposalType as EProposalType });
	if (contentSummary) {
		post = { ...post, contentSummary };
	}

	// Cache the post data without user specific data
	await RedisService.SetPostData({ network, proposalType, indexOrHash: index, data: post });

	// fetch and add user subscription to post
	if (isUserAuthenticated && userId) {
		const userSubscription = await OffChainDbService.GetPostSubscriptionByPostAndUserId({ network, proposalType, indexOrHash: index, userId });
		if (userSubscription) {
			post = { ...post, userSubscriptionId: userSubscription.id };
		}
	}

	const response = NextResponse.json(post);

	if (accessToken) {
		response.headers.append(COOKIE_HEADER_ACTION_NAME, await AuthService.GetAccessTokenCookie(accessToken));
	}
	if (refreshToken) {
		response.headers.append(COOKIE_HEADER_ACTION_NAME, await AuthService.GetRefreshTokenCookie(refreshToken));
	}

	return response;
});

// update post
export const PATCH = withErrorHandling(async (req: NextRequest, { params }: { params: Promise<{ proposalType: string; index: string }> }): Promise<NextResponse> => {
	const { proposalType, index } = zodParamsSchema.parse(await params);

	const network = await getNetworkFromHeaders();

	const { newAccessToken, newRefreshToken } = await AuthService.ValidateAuthAndRefreshTokens();

	const zodBodySchema = z
		.object({
			title: z.string().min(1, 'Title is required'),
			content: z.string().min(1, 'Content is required'),
			allowedCommentor: z.nativeEnum(EAllowedCommentor).optional().default(EAllowedCommentor.ALL),
			linkedPost: z
				.object({
					proposalType: z.nativeEnum(EProposalType),
					indexOrHash: z.string()
				})
				.optional()
		})
		.refine(
			(data) => {
				if (data.linkedPost) {
					return data.linkedPost.proposalType !== proposalType;
				}
				return true;
			},
			{
				message: 'Linked post proposal type cannot be the same as the current proposal type',
				path: ['linkedPost', 'proposalType']
			}
		);

	const { content, title, allowedCommentor, linkedPost } = zodBodySchema.parse(await getReqBody(req));

	// check if linked post exists
	if (linkedPost) {
		const linkedPostData = await OffChainDbService.GetOffChainPostData({ network, proposalType: linkedPost.proposalType, indexOrHash: linkedPost.indexOrHash });
		if (!linkedPostData) {
			throw new APIError(ERROR_CODES.NOT_FOUND, StatusCodes.NOT_FOUND, 'Linked post not found');
		}
	}

	await updatePostServer({ network, proposalType, indexOrHash: index, content, title, allowedCommentor, userId: AuthService.GetUserIdFromAccessToken(newAccessToken), linkedPost });

	const response = NextResponse.json({ message: 'Post updated successfully' });
	response.headers.append(SET_COOKIE, await AuthService.GetAccessTokenCookie(newAccessToken));
	response.headers.append(SET_COOKIE, await AuthService.GetRefreshTokenCookie(newRefreshToken));

	return response;
});

// delete off-chain post (soft-delete)
export const DELETE = withErrorHandling(async (req: NextRequest, { params }: { params: Promise<{ proposalType: string; index: string }> }): Promise<NextResponse> => {
	const { proposalType, index } = zodParamsSchema.parse(await params);

	const { newAccessToken, newRefreshToken } = await AuthService.ValidateAuthAndRefreshTokens();

	const network = await getNetworkFromHeaders();

	const userId = AuthService.GetUserIdFromAccessToken(newAccessToken);

	const post = await OffChainDbService.GetOffChainPostData({ network, proposalType, indexOrHash: index });

	if (!post) {
		throw new APIError(ERROR_CODES.NOT_FOUND, StatusCodes.NOT_FOUND);
	}

	if (post.userId !== userId) {
		throw new APIError(ERROR_CODES.UNAUTHORIZED, StatusCodes.UNAUTHORIZED);
	}

	await OffChainDbService.DeleteOffChainPost({ network, proposalType, index: Number(index) });

	// Invalidate caches
	await RedisService.DeletePostData({ network, proposalType, indexOrHash: index });
	await RedisService.DeletePostsListing({ network, proposalType });
	await RedisService.DeleteActivityFeed({ network });
	await RedisService.DeleteContentSummary({ network, indexOrHash: index, proposalType });
	await RedisService.DeleteOverviewPageData({ network });

	const response = NextResponse.json({ message: 'Post deleted successfully' });
	response.headers.append(SET_COOKIE, await AuthService.GetAccessTokenCookie(newAccessToken));
	response.headers.append(SET_COOKIE, await AuthService.GetRefreshTokenCookie(newRefreshToken));

	return response;
});
