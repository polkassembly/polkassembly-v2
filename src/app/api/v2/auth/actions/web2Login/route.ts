// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { AuthService } from '@api/_api-services/auth_service';
import { APIError } from '@api/_api-utils/apiError';
import { getReqBody } from '@api/_api-utils/getReqBody';
import { withErrorHandling } from '@api/_api-utils/withErrorHandling';
import { ERROR_CODES } from '@shared/_constants/errorLiterals';
import { EAuthCookieNames } from '@shared/types';
import { StatusCodes } from 'http-status-codes';
import { NextRequest, NextResponse } from 'next/server';

export const POST = withErrorHandling(async (req: NextRequest) => {
	const { emailOrUsername = '', password = '' } = await getReqBody(req);

	if (!emailOrUsername || !password) {
		throw new APIError(ERROR_CODES.INVALID_PARAMS_ERROR, StatusCodes.BAD_REQUEST);
	}

	const { accessToken = '', isTFAEnabled = false, tfaToken = '', refreshToken } = await AuthService.Web2Login(emailOrUsername, password);

	// If 2FA is not enabled and accessToken is not generated, throw error
	if (!accessToken && !isTFAEnabled) {
		throw new APIError(ERROR_CODES.UNAUTHORIZED, StatusCodes.UNAUTHORIZED);
	}

	// If 2FA is enabled, return the tfaToken and userId
	if (isTFAEnabled) return NextResponse.json({ isTFAEnabled, tfaToken });

	if (!refreshToken) {
		throw new APIError(ERROR_CODES.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR, 'Refresh token not generated.');
	}

	const refreshTokenCookie = await AuthService.GetRefreshTokenCookie(refreshToken);

	if (!refreshTokenCookie) {
		throw new APIError(ERROR_CODES.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR, 'Refresh token cookie not generated.');
	}

	const accessTokenCookie = await AuthService.GetAccessTokenCookie(accessToken);

	if (!accessTokenCookie) {
		throw new APIError(ERROR_CODES.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR, 'Access token cookie not generated.');
	}

	// no 2FA, successful login
	const response = NextResponse.json({ isTFAEnabled, message: 'Web2 login successful' });
	response.cookies.set(EAuthCookieNames.ACCESS_TOKEN, accessTokenCookie);
	response.cookies.set(EAuthCookieNames.REFRESH_TOKEN, refreshTokenCookie);

	return response;
});
