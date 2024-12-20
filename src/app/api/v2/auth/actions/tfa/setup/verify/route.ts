// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ERROR_CODES } from '@/_shared/_constants/errorLiterals';
import { ECookieNames } from '@/_shared/types';
import { AuthService } from '@/app/api/_api-services/auth_service';
import { APIError } from '@/app/api/_api-utils/apiError';
import { getReqBody } from '@/app/api/_api-utils/getReqBody';
import { withErrorHandling } from '@/app/api/_api-utils/withErrorHandling';
import { StatusCodes } from 'http-status-codes';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

export const POST = withErrorHandling(async (req: NextRequest) => {
	const zodBodySchema = z.object({
		authCode: z.string()
	});

	const bodyRaw = await getReqBody(req);

	// 1. get authCode from req body
	const { authCode } = zodBodySchema.parse(bodyRaw);

	// 2. read access token from cookie
	const cookieStore = await cookies();
	const accessToken = cookieStore.get(ECookieNames.ACCESS_TOKEN)?.value;

	// 3. verify access token
	if (!accessToken) {
		throw new APIError(ERROR_CODES.UNAUTHORIZED, StatusCodes.UNAUTHORIZED, 'Access token not found');
	}

	const isValidAccessToken = AuthService.IsValidAccessToken(accessToken);
	if (!isValidAccessToken) {
		throw new APIError(ERROR_CODES.UNAUTHORIZED, StatusCodes.UNAUTHORIZED, 'Access token is invalid');
	}

	const acessTokenPayload = AuthService.GetAccessTokenPayload(accessToken);

	// 5. check if user has tfa initialized
	const user = await AuthService.GetUserWithAccessToken(accessToken);

	if (!user?.twoFactorAuth?.base32Secret || !user?.twoFactorAuth?.url) {
		throw new APIError(ERROR_CODES.BAD_REQUEST, StatusCodes.BAD_REQUEST, 'Two factor authentication has not been initialized for user');
	}

	// 6. verify auth code
	const isValidAuthCode = await AuthService.IsValidTfaAuthCode({ userId: user.id, authCode, base32Secret: user.twoFactorAuth.base32Secret });

	if (!isValidAuthCode) {
		throw new APIError(ERROR_CODES.BAD_REQUEST, StatusCodes.BAD_REQUEST, 'Invalid auth code');
	}

	// 7. verify and enable tfa for user
	await AuthService.VerifyTfa(user.id, user.twoFactorAuth);

	const newUser = await AuthService.GetUserWithAccessToken(accessToken);

	if (!newUser) {
		throw new APIError(ERROR_CODES.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR, 'User not found');
	}

	// 8. send new acessToken
	const newAccessToken = await AuthService.GetSignedAccessToken({ ...newUser, loginAddress: acessTokenPayload.loginAddress, loginWallet: acessTokenPayload.loginWallet });

	if (!newAccessToken) {
		throw new APIError(ERROR_CODES.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR, 'Access token not generated.');
	}

	const accessTokenCookie = await AuthService.GetAccessTokenCookie(newAccessToken);

	if (!accessTokenCookie) {
		throw new APIError(ERROR_CODES.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR, 'Access token cookie not generated.');
	}

	// 6. return tokens
	const response = NextResponse.json({ message: 'TFA auth code verified successfully' });
	response.headers.append('Set-Cookie', accessTokenCookie);

	return response;
});
