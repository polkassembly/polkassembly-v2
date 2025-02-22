// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { AuthService } from '@/app/api/_api-services/auth_service';
import { getReqBody } from '@/app/api/_api-utils/getReqBody';
import { convertContentForFirestoreServer } from '@/app/api/_api-utils/convertContentForFirestoreServer';
import { OffChainDbService } from '@api/_api-services/offchain_db_service';
import { OnChainDbService } from '@api/_api-services/onchain_db_service';
import { APIError } from '@api/_api-utils/apiError';
import { getNetworkFromHeaders } from '@api/_api-utils/getNetworkFromHeaders';
import { withErrorHandling } from '@api/_api-utils/withErrorHandling';
import { ERROR_CODES } from '@shared/_constants/errorLiterals';
import { ValidatorService } from '@shared/_services/validator_service';
import { EAllowedCommentor, EDataSource, ENetwork, EProposalType, IOffChainPost, IOnChainPostInfo, IPost, IPublicUser } from '@shared/types';
import { StatusCodes } from 'http-status-codes';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { isValidRichContent } from '@/_shared/_utils/isValidRichContent';
import { RedisService } from '@/app/api/_api-services/redis_service';
import { AIService } from '@/app/api/_api-services/ai_service';

const SET_COOKIE = 'Set-Cookie';

const zodParamsSchema = z.object({
	proposalType: z.nativeEnum(EProposalType),
	index: z.string()
});

async function handleOffChainPost(network: string, proposalType: string, index: string, offChainPostData: IOffChainPost) {
	if (!offChainPostData) {
		throw new APIError(ERROR_CODES.POST_NOT_FOUND_ERROR, StatusCodes.NOT_FOUND);
	}

	let post: IPost = offChainPostData;

	if (offChainPostData.userId && ValidatorService.isValidUserId(Number(offChainPostData.userId || -1))) {
		const publicUser = await OffChainDbService.GetPublicUserById(offChainPostData.userId);
		if (publicUser) {
			post = { ...offChainPostData, publicUser };
		}
	}

	await RedisService.SetPostData({ network, proposalType, indexOrHash: index, data: post });
	return post;
}

async function getPublicUser(onChainPostInfo: IOnChainPostInfo, offChainPostData: IOffChainPost) {
	let publicUser: IPublicUser | null = null;

	if (onChainPostInfo.proposer && ValidatorService.isValidWeb3Address(onChainPostInfo.proposer)) {
		publicUser = await OffChainDbService.GetPublicUserByAddress(onChainPostInfo.proposer);
	}

	if (!publicUser && offChainPostData.userId && ValidatorService.isValidUserId(Number(offChainPostData.userId || -1))) {
		publicUser = await OffChainDbService.GetPublicUserById(offChainPostData.userId);
	}

	return publicUser;
}

export const GET = withErrorHandling(async (req: NextRequest, { params }: { params: Promise<{ proposalType: string; index: string }> }): Promise<NextResponse> => {
	const { proposalType, index } = zodParamsSchema.parse(await params);
	const network = await getNetworkFromHeaders();

	const cachedData = await RedisService.GetPostData({ network, proposalType, indexOrHash: index });
	if (cachedData) {
		return NextResponse.json(cachedData);
	}

	const offChainPostData = await OffChainDbService.GetOffChainPostData({ network, indexOrHash: index, proposalType: proposalType as EProposalType });

	// if is off-chain post just return the offchain post data
	if (ValidatorService.isValidOffChainProposalType(proposalType)) {
		return NextResponse.json(await handleOffChainPost(network, proposalType, index, offChainPostData));
	}

	// if is on-chain post
	const onChainPostInfo = await OnChainDbService.GetOnChainPostInfo({ network, indexOrHash: index, proposalType: proposalType as EProposalType });
	if (!onChainPostInfo) {
		throw new APIError(ERROR_CODES.POST_NOT_FOUND_ERROR, StatusCodes.NOT_FOUND);
	}

	let post: IPost = {
		...offChainPostData,
		dataSource: offChainPostData?.dataSource || EDataSource.POLKASSEMBLY,
		proposalType: proposalType as EProposalType,
		network: network as ENetwork,
		onChainInfo: onChainPostInfo
	};

	const publicUser = await getPublicUser(onChainPostInfo, offChainPostData);
	if (publicUser) {
		post = { ...post, publicUser };
	}

	let accessToken: string | undefined;
	let refreshToken: string | undefined;

	// if user is authenticated, fetch user reaction for the post
	try {
		const { newAccessToken, newRefreshToken } = await AuthService.ValidateAuthAndRefreshTokens();
		accessToken = newAccessToken;
		refreshToken = newRefreshToken;
		const userId = accessToken ? AuthService.GetUserIdFromAccessToken(accessToken) : undefined;

		if (userId) {
			const userReaction = await OffChainDbService.GetUserReactionForPost({
				network,
				proposalType,
				indexOrHash: index,
				userId
			});

			if (userReaction) {
				post = { ...post, userReaction };
			}
		}
	} catch {
		// do nothing
	}

	// Cache the response
	await RedisService.SetPostData({ network, proposalType, indexOrHash: index, data: post });

	const response = NextResponse.json(post);

	if (accessToken) {
		response.headers.append(SET_COOKIE, await AuthService.GetAccessTokenCookie(accessToken));
	}
	if (refreshToken) {
		response.headers.append(SET_COOKIE, await AuthService.GetRefreshTokenCookie(refreshToken));
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
		content: z.union([z.custom<Record<string, unknown>>(), z.string()]).refine(isValidRichContent, 'Invalid content'),
		allowedCommentor: z.nativeEnum(EAllowedCommentor).optional().default(EAllowedCommentor.ALL)
	});

	const { content, title, allowedCommentor } = zodBodySchema.parse(await getReqBody(req));

	const formattedContent = convertContentForFirestoreServer(content);

	if (ValidatorService.isValidOffChainProposalType(proposalType)) {
		await OffChainDbService.UpdateOffChainPost({
			network,
			indexOrHash: index,
			proposalType: proposalType as EProposalType,
			userId: AuthService.GetUserIdFromAccessToken(newAccessToken),
			content: formattedContent,
			title,
			allowedCommentor
		});
	} else {
		await OffChainDbService.UpdateOnChainPost({
			network,
			indexOrHash: index,
			proposalType: proposalType as EProposalType,
			userId: AuthService.GetUserIdFromAccessToken(newAccessToken),
			content: formattedContent,
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
