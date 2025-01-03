// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ERROR_CODES } from '@/_shared/_constants/errorLiterals';
import { ECookieNames } from '@/_shared/types';
import { AuthService } from '@/app/api/_api-services/auth_service';
import { OffChainDbService } from '@/app/api/_api-services/offchain_db_service';
import { APIError } from '@/app/api/_api-utils/apiError';
import { withErrorHandling } from '@/app/api/_api-utils/withErrorHandling';
import { StatusCodes } from 'http-status-codes';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const GET = withErrorHandling(async () => {
	// 1. read refresh token from cookie
	const cookieStore = await cookies();
	const refreshToken = cookieStore.get(ECookieNames.REFRESH_TOKEN)?.value;

	// 2. validate refresh token
	if (!refreshToken) {
		throw new APIError(ERROR_CODES.UNAUTHORIZED, StatusCodes.UNAUTHORIZED, 'Refresh token not found');
	}

	const isValid = await AuthService.IsValidRefreshToken(refreshToken);
	if (!isValid) {
		throw new APIError(ERROR_CODES.UNAUTHORIZED, StatusCodes.UNAUTHORIZED, 'Refresh token is invalid');
	}

	// 3. generate new access token
	const payload = AuthService.GetRefreshTokenPayload(refreshToken);

	const user = await OffChainDbService.GetUserById(payload.id);

	if (!user) {
		throw new APIError(ERROR_CODES.UNAUTHORIZED, StatusCodes.UNAUTHORIZED, 'User not found');
	}

	const accessToken = await AuthService.GetSignedAccessToken({ ...user, loginAddress: payload.loginAddress, loginWallet: payload.loginWallet });

	// 4. access token cookie
	const accessTokenCookie = await AuthService.GetAccessTokenCookie(accessToken);

	if (!accessTokenCookie) {
		throw new APIError(ERROR_CODES.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR, 'Access token cookie not generated.');
	}

	// 5. rotate refresh token

	const newRefreshToken = await AuthService.GetRefreshToken({ userId: payload.id, loginAddress: payload.loginAddress, loginWallet: payload.loginWallet });

	const refreshTokenCookie = await AuthService.GetRefreshTokenCookie(newRefreshToken);

	if (!refreshTokenCookie) {
		throw new APIError(ERROR_CODES.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR, 'Refresh token cookie not generated.');
	}

	// 6. return tokens
	const response = NextResponse.json({ message: 'Access token refreshed successfully' });
	response.headers.append('Set-Cookie', accessTokenCookie);
	response.headers.append('Set-Cookie', refreshTokenCookie);

	return response;
});
