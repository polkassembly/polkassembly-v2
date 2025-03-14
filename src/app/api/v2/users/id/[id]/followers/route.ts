// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandling } from '@/app/api/_api-utils/withErrorHandling';
import { z } from 'zod';
import { OffChainDbService } from '@/app/api/_api-services/offchain_db_service';
import { ValidatorService } from '@/_shared/_services/validator_service';
import { AuthService } from '@/app/api/_api-services/auth_service';
import { StatusCodes } from 'http-status-codes';
import { APIError } from '@/app/api/_api-utils/apiError';
import { ERROR_CODES } from '@/_shared/_constants/errorLiterals';

const SET_COOKIE = 'Set-Cookie';

const zodParamsSchema = z.object({
	id: z.coerce.number().refine((val) => ValidatorService.isValidUserId(val), 'Invalid user ID')
});

// get followers
export const GET = withErrorHandling(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> => {
	const { id } = zodParamsSchema.parse(await params);

	const followers = await OffChainDbService.GetFollowers(id);

	return NextResponse.json({ followers });
});

// follow user
export const POST = withErrorHandling(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> => {
	const { id } = zodParamsSchema.parse(await params);

	const { newAccessToken, newRefreshToken } = await AuthService.ValidateAuthAndRefreshTokens();

	const userToFollow = await OffChainDbService.GetPublicUserById(id);

	if (!userToFollow) {
		throw new APIError(ERROR_CODES.NOT_FOUND, StatusCodes.NOT_FOUND, 'User not found');
	}

	const userId = AuthService.GetUserIdFromAccessToken(newAccessToken);

	// cannot follow yourself
	if (userId === id) {
		throw new APIError(ERROR_CODES.BAD_REQUEST, StatusCodes.BAD_REQUEST, 'You cannot follow yourself');
	}

	// check if user is already following
	const isFollowing = await OffChainDbService.IsUserFollowing({ userId, userIdToFollow: id });

	if (isFollowing) {
		throw new APIError(ERROR_CODES.BAD_REQUEST, StatusCodes.BAD_REQUEST, 'You are already following this user');
	}

	// follow user
	await OffChainDbService.FollowUser({ userId, userIdToFollow: id });

	const response = NextResponse.json({ message: 'User followed successfully' });
	response.headers.append(SET_COOKIE, await AuthService.GetAccessTokenCookie(newAccessToken));
	response.headers.append(SET_COOKIE, await AuthService.GetRefreshTokenCookie(newRefreshToken));

	return response;
});

// unfollow user
export const DELETE = withErrorHandling(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> => {
	const { id } = zodParamsSchema.parse(await params);

	const { newAccessToken, newRefreshToken } = await AuthService.ValidateAuthAndRefreshTokens();

	const userId = AuthService.GetUserIdFromAccessToken(newAccessToken);

	// cannot unfollow yourself
	if (userId === id) {
		throw new APIError(ERROR_CODES.BAD_REQUEST, StatusCodes.BAD_REQUEST, 'You cannot unfollow yourself');
	}

	const userToUnfollow = await OffChainDbService.GetPublicUserById(id);

	if (!userToUnfollow) {
		throw new APIError(ERROR_CODES.NOT_FOUND, StatusCodes.NOT_FOUND, 'User not found');
	}

	await OffChainDbService.UnfollowUser({ userId, userIdToUnfollow: id });

	const response = NextResponse.json({ message: 'User unfollowed successfully' });
	response.headers.append(SET_COOKIE, await AuthService.GetAccessTokenCookie(newAccessToken));
	response.headers.append(SET_COOKIE, await AuthService.GetRefreshTokenCookie(newRefreshToken));

	return response;
});
