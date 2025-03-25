// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { createId } from '@paralleldrive/cuid2';
import { ERROR_CODES } from '@/_shared/_constants/errorLiterals';
import { AuthService } from '@/app/api/_api-services/auth_service';
import { RedisService } from '@/app/api/_api-services/redis_service';
import { APIError } from '@/app/api/_api-utils/apiError';
import { withErrorHandling } from '@/app/api/_api-utils/withErrorHandling';
import { StatusCodes } from 'http-status-codes';
import { NextRequest, NextResponse } from 'next/server';
import { FIVE_MIN } from '@/app/api/_api-constants/timeConstants';
import { IQRSessionPayload } from '@/_shared/types';
import { OffChainDbService } from '@/app/api/_api-services/offchain_db_service';
import { z } from 'zod';
import { getReqBody } from '@/app/api/_api-utils/getReqBody';

const SET_COOKIE = 'Set-Cookie';

// generate qr session
export const GET = withErrorHandling(async (): Promise<NextResponse> => {
	// 1. check if user is authenticated
	const { newAccessToken, newRefreshToken } = await AuthService.ValidateAuthAndRefreshTokens();

	const user = await AuthService.GetUserWithAccessToken(newAccessToken);

	if (!user) {
		throw new APIError(ERROR_CODES.UNAUTHORIZED, StatusCodes.UNAUTHORIZED, 'User not found');
	}

	// Generate session ID
	const sessionId = createId();
	const timestamp = Date.now();

	// Store session in Redis with user info
	await RedisService.SetQRSession(sessionId, {
		userId: user.id,
		timestamp,
		expiresIn: FIVE_MIN
	});

	const qrSessionPayload: IQRSessionPayload = {
		sessionId,
		timestamp,
		expiresIn: FIVE_MIN
	};

	// Return session info to be encoded in QR
	const response = NextResponse.json(qrSessionPayload);
	response.headers.append(SET_COOKIE, await AuthService.GetAccessTokenCookie(newAccessToken));
	response.headers.append(SET_COOKIE, await AuthService.GetRefreshTokenCookie(newRefreshToken));

	return response;
});

// claim qr session
export const POST = withErrorHandling(async (req: NextRequest): Promise<NextResponse> => {
	const zodBodySchema = z.object({
		sessionId: z.string()
	});

	const { sessionId } = zodBodySchema.parse(await getReqBody(req));

	// Get session from Redis
	const session = await RedisService.GetQRSession(sessionId);

	if (!session) {
		throw new APIError(ERROR_CODES.UNAUTHORIZED, StatusCodes.UNAUTHORIZED, 'Invalid or expired session');
	}

	// Check if session is expired
	if (Date.now() > session.timestamp + session.expiresIn * 1000) {
		await RedisService.DeleteQRSession(sessionId);
		throw new APIError(ERROR_CODES.UNAUTHORIZED, StatusCodes.UNAUTHORIZED, 'Session expired');
	}

	// Get user and generate tokens
	const user = await OffChainDbService.GetUserById(session.userId);

	if (!user) {
		throw new APIError(ERROR_CODES.UNAUTHORIZED, StatusCodes.UNAUTHORIZED, 'User not found');
	}

	// Generate access token for mobile device
	const accessToken = await AuthService.GetSignedAccessToken(user);

	// Generate a new refresh token for the mobile device
	// This supports multi-device login by creating a separate token for this device
	const refreshToken = await AuthService.GetRefreshToken({
		userId: user.id
	});

	// Create cookies with the tokens
	const refreshTokenCookie = await AuthService.GetRefreshTokenCookie(refreshToken);
	const accessTokenCookie = await AuthService.GetAccessTokenCookie(accessToken);

	// Delete used QR session
	await RedisService.DeleteQRSession(sessionId);

	// Return tokens in cookies
	const response = NextResponse.json({ message: 'Session claimed successfully' });
	response.headers.append(SET_COOKIE, accessTokenCookie);
	response.headers.append(SET_COOKIE, refreshTokenCookie);

	return response;
});
