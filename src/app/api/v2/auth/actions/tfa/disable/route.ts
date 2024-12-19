// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ERROR_CODES } from '@/_shared/_constants/errorLiterals';
import { ECookieNames } from '@/_shared/types';
import { AuthService } from '@/app/api/_api-services/auth_service';
import { APIError } from '@/app/api/_api-utils/apiError';
import { withErrorHandling } from '@/app/api/_api-utils/withErrorHandling';
import { StatusCodes } from 'http-status-codes';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const POST = withErrorHandling(async () => {
	// 1. read access token from cookie
	const cookieStore = await cookies();
	const accessToken = cookieStore.get(ECookieNames.ACCESS_TOKEN)?.value;

	// 2. verify access token
	if (!accessToken) {
		throw new APIError(ERROR_CODES.UNAUTHORIZED, StatusCodes.UNAUTHORIZED, 'Access token not found');
	}

	const isValidAccessToken = AuthService.IsValidAccessToken(accessToken);
	if (!isValidAccessToken) {
		throw new APIError(ERROR_CODES.UNAUTHORIZED, StatusCodes.UNAUTHORIZED, 'Access token is invalid');
	}

	const accessTokenPayload = AuthService.GetAccessTokenPayload(accessToken);

	// 3. verify if user has tfa enabled
	const user = await AuthService.GetUserWithAccessToken(accessToken);

	if (!user?.twoFactorAuth || !user?.twoFactorAuth?.enabled || !user?.twoFactorAuth?.base32Secret || !user?.twoFactorAuth?.url) {
		throw new APIError(ERROR_CODES.BAD_REQUEST, StatusCodes.BAD_REQUEST, 'TFA is not enabled for this user');
	}

	// 4. disable tfa
	await AuthService.DisableTfa(user.id);

	const newUser = await AuthService.GetUserWithAccessToken(accessToken);

	if (!newUser) {
		throw new APIError(ERROR_CODES.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR, 'User not found');
	}

	// 5. return success response with new access token
	const newAccessToken = await AuthService.GetSignedAccessToken({ ...newUser, loginAddress: accessTokenPayload.loginAddress, loginWallet: accessTokenPayload.loginWallet });

	if (!newAccessToken) {
		throw new APIError(ERROR_CODES.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR, 'Access token not generated');
	}

	const newAccessTokenCookie = await AuthService.GetAccessTokenCookie(newAccessToken);

	if (!newAccessTokenCookie) {
		throw new APIError(ERROR_CODES.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR, 'Access token cookie not generated');
	}

	const response = NextResponse.json({ message: 'TFA disabled successfully' });
	response.headers.append('Set-Cookie', newAccessTokenCookie);

	return response;
});
