// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

/* eslint-disable sonarjs/no-duplicate-string */

import { AuthService } from '@/app/api/_api-services/auth_service';
import { withErrorHandling } from '@/app/api/_api-utils/withErrorHandling';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { OffChainDbService } from '@/app/api/_api-services/offchain_db_service';
import { getReqBody } from '@/app/api/_api-utils/getReqBody';
import { APIError } from '@/app/api/_api-utils/apiError';
import { StatusCodes } from 'http-status-codes';
import { ERROR_CODES } from '@/_shared/_constants/errorLiterals';
import { RedisService } from '@/app/api/_api-services/redis_service';
import { getNetworkFromHeaders } from '@/app/api/_api-utils/getNetworkFromHeaders';
import { AIService } from '@/app/api/_api-services/ai_service';

const SET_COOKIE = 'Set-Cookie';

const zodParamsSchema = z.object({
	id: z.string(),
	proposalType: z.string(),
	index: z.string()
});

export const GET = withErrorHandling(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> => {
	const { id } = zodParamsSchema.parse(await params);

	const comment = await OffChainDbService.GetCommentById(id);

	if (!comment) {
		throw new APIError(ERROR_CODES.COMMENT_NOT_FOUND, StatusCodes.NOT_FOUND);
	}

	return NextResponse.json(comment);
});

// update comment
export const PATCH = withErrorHandling(async (req: NextRequest, { params }: { params: Promise<{ id: string; proposalType: string; index: string }> }): Promise<NextResponse> => {
	const { id, proposalType, index } = zodParamsSchema.parse(await params);

	// 1. check if user is authenticated
	const { newAccessToken, newRefreshToken } = await AuthService.ValidateAuthAndRefreshTokens();

	// 2. read and validate the request body
	const zodBodySchema = z.object({
		content: z.string().min(1, 'Content is required')
	});

	const { content } = zodBodySchema.parse(await getReqBody(req));

	// 3. check if user is the owner of the comment
	const userId = AuthService.GetUserIdFromAccessToken(newAccessToken);

	const comment = await OffChainDbService.GetCommentById(id);

	if (!comment) {
		throw new APIError(ERROR_CODES.COMMENT_NOT_FOUND, StatusCodes.NOT_FOUND);
	}

	if (comment.userId !== userId) {
		throw new APIError(ERROR_CODES.UNAUTHORIZED, StatusCodes.UNAUTHORIZED, 'User is not the owner of the comment');
	}

	await OffChainDbService.UpdateComment({
		commentId: id,
		content
	});

	const network = await getNetworkFromHeaders();

	await AIService.UpdatePostCommentsSummary({ network, proposalType: comment.proposalType, indexOrHash: comment.indexOrHash, newCommentId: comment.id });
	if (!comment.sentiment) {
		await AIService.UpdateCommentSentiment(comment.id);
	}

	// Invalidate caches since comment content changed
	await RedisService.DeletePostData({ network, proposalType, indexOrHash: index });
	await RedisService.DeletePostsListing({ network, proposalType });
	await RedisService.DeleteActivityFeed({ network });
	await RedisService.DeleteContentSummary({ network, indexOrHash: index, proposalType });

	const response = NextResponse.json({ message: 'Comment updated successfully' });
	response.headers.append(SET_COOKIE, await AuthService.GetAccessTokenCookie(newAccessToken));
	response.headers.append(SET_COOKIE, await AuthService.GetRefreshTokenCookie(newRefreshToken));

	return response;
});

// delete comment
export const DELETE = withErrorHandling(async (req: NextRequest, { params }: { params: Promise<{ id: string; proposalType: string; index: string }> }): Promise<NextResponse> => {
	const { id, proposalType, index } = zodParamsSchema.parse(await params);

	// 1. check if user is authenticated
	const { newAccessToken, newRefreshToken } = await AuthService.ValidateAuthAndRefreshTokens();

	// 2. check if user is the owner of the comment
	const userId = AuthService.GetUserIdFromAccessToken(newAccessToken);

	const comment = await OffChainDbService.GetCommentById(id);

	if (!comment) {
		throw new APIError(ERROR_CODES.COMMENT_NOT_FOUND, StatusCodes.NOT_FOUND);
	}

	if (comment.userId !== userId) {
		throw new APIError(ERROR_CODES.UNAUTHORIZED, StatusCodes.UNAUTHORIZED, 'User is not the owner of the comment');
	}

	await OffChainDbService.DeleteComment(id);

	const network = await getNetworkFromHeaders();

	await AIService.UpdatePostCommentsSummary({ network, proposalType: comment.proposalType, indexOrHash: comment.indexOrHash });

	// Invalidate caches since comment was deleted
	await RedisService.DeletePostData({ network, proposalType, indexOrHash: index });
	await RedisService.DeletePostsListing({ network, proposalType });
	await RedisService.DeleteActivityFeed({ network });
	await RedisService.DeleteContentSummary({ network, indexOrHash: index, proposalType });

	const response = NextResponse.json({ message: 'Comment deleted successfully' });
	response.headers.append(SET_COOKIE, await AuthService.GetAccessTokenCookie(newAccessToken));
	response.headers.append(SET_COOKIE, await AuthService.GetRefreshTokenCookie(newRefreshToken));

	return response;
});
