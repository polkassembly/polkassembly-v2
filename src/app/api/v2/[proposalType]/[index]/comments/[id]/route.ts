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

const zodParamsSchema = z.object({
	id: z.string()
});

export const GET = withErrorHandling(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> => {
	const { id } = zodParamsSchema.parse(await params);

	const comment = await OffChainDbService.GetCommentById(id);

	if (!comment) {
		throw new APIError(ERROR_CODES.COMMENT_NOT_FOUND, StatusCodes.NOT_FOUND);
	}

	return NextResponse.json(comment);
});

export const PATCH = withErrorHandling(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> => {
	const { id } = zodParamsSchema.parse(await params);

	// 1. check if user is logged in
	const { newAccessToken, newRefreshToken } = await AuthService.ValidateAuthAndRefreshTokens();

	// 2. read and validate the request body
	const zodBodySchema = z.object({
		content: z.string()
	});

	const { content } = zodBodySchema.parse(await getReqBody(req));

	// 3. check if user is the owner of the comment
	const userId = await AuthService.GetUserIdFromAccessToken(newAccessToken);

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

	const response = NextResponse.json({ message: 'Comment updated successfully' });
	response.headers.append('Set-Cookie', await AuthService.GetAccessTokenCookie(newAccessToken));
	response.headers.append('Set-Cookie', await AuthService.GetRefreshTokenCookie(newRefreshToken));

	return response;
});

export const DELETE = withErrorHandling(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> => {
	const { id } = zodParamsSchema.parse(await params);

	// 1. check if user is logged in
	const { newAccessToken, newRefreshToken } = await AuthService.ValidateAuthAndRefreshTokens();

	// 2. check if user is the owner of the comment
	const userId = await AuthService.GetUserIdFromAccessToken(newAccessToken);

	const comment = await OffChainDbService.GetCommentById(id);

	if (!comment) {
		throw new APIError(ERROR_CODES.COMMENT_NOT_FOUND, StatusCodes.NOT_FOUND);
	}

	if (comment.userId !== userId) {
		throw new APIError(ERROR_CODES.UNAUTHORIZED, StatusCodes.UNAUTHORIZED, 'User is not the owner of the comment');
	}

	await OffChainDbService.DeleteComment(id);

	const response = NextResponse.json({ message: 'Comment deleted successfully' });
	response.headers.append('Set-Cookie', await AuthService.GetAccessTokenCookie(newAccessToken));
	response.headers.append('Set-Cookie', await AuthService.GetRefreshTokenCookie(newRefreshToken));

	return response;
});
