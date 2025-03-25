// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { AuthService } from '@/app/api/_api-services/auth_service';
import { getReqBody } from '@/app/api/_api-utils/getReqBody';
import { OffChainDbService } from '@api/_api-services/offchain_db_service';
import { getNetworkFromHeaders } from '@api/_api-utils/getNetworkFromHeaders';
import { withErrorHandling } from '@api/_api-utils/withErrorHandling';
import { ValidatorService } from '@shared/_services/validator_service';
import { EAllowedCommentor, EProposalType, IPost } from '@shared/types';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { RedisService } from '@/app/api/_api-services/redis_service';
import { AIService } from '@/app/api/_api-services/ai_service';
import { fetchPostData } from '@/app/api/_api-utils/fetchPostData';
import { COOKIE_HEADER_ACTION_NAME } from '@/_shared/_constants/cookieHeaderActionName';

const SET_COOKIE = 'Set-Cookie';

const zodParamsSchema = z.object({
	proposalType: z.nativeEnum(EProposalType),
	index: z.string()
});

export const GET = withErrorHandling(async (req: NextRequest, { params }: { params: Promise<{ proposalType: string; index: string }> }): Promise<NextResponse<IPost>> => {
	const { proposalType, index } = zodParamsSchema.parse(await params);
	const network = await getNetworkFromHeaders();

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

	// Get post data from cache
	let post = await RedisService.GetPostData({ network, proposalType, indexOrHash: index });

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

	// fetch and add reactions to post
	const reactions = await OffChainDbService.GetPostReactions({ network, proposalType, indexOrHash: index });
	post = { ...post, reactions };

	// fetch and add user subscription to post

	if (isUserAuthenticated && userId) {
		const userSubscription = await OffChainDbService.GetPostSubscriptionByPostAndUserId({ network, proposalType, indexOrHash: index, userId });
		if (userSubscription) {
			post = { ...post, userSubscriptionId: userSubscription.id };
		}
	}

	// Cache the post data
	await RedisService.SetPostData({ network, proposalType, indexOrHash: index, data: post });

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

	const zodBodySchema = z.object({
		title: z.string().min(1, 'Title is required'),
		content: z.string().min(1, 'Content is required'),
		allowedCommentor: z.nativeEnum(EAllowedCommentor).optional().default(EAllowedCommentor.ALL)
	});

	const { content, title, allowedCommentor } = zodBodySchema.parse(await getReqBody(req));

	if (ValidatorService.isValidOffChainProposalType(proposalType)) {
		await OffChainDbService.UpdateOffChainPost({
			network,
			indexOrHash: index,
			proposalType: proposalType as EProposalType,
			userId: AuthService.GetUserIdFromAccessToken(newAccessToken),
			content,
			title,
			allowedCommentor
		});
	} else {
		await OffChainDbService.UpdateOnChainPost({
			network,
			indexOrHash: index,
			proposalType: proposalType as EProposalType,
			userId: AuthService.GetUserIdFromAccessToken(newAccessToken),
			content,
			title,
			allowedCommentor
		});
	}

	await AIService.UpdatePostSummary({ network, proposalType, indexOrHash: index });

	// Invalidate caches
	await RedisService.DeletePostData({ network, proposalType, indexOrHash: index });
	await RedisService.DeletePostsListing({ network, proposalType });
	await RedisService.DeleteContentSummary({ network, indexOrHash: index, proposalType });

	const response = NextResponse.json({ message: 'Post updated successfully' });
	response.headers.append(SET_COOKIE, await AuthService.GetAccessTokenCookie(newAccessToken));
	response.headers.append(SET_COOKIE, await AuthService.GetRefreshTokenCookie(newRefreshToken));

	return response;
});
