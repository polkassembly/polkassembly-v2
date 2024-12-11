// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { AuthService } from '@api/_api-services/auth_service';
import { APIError } from '@api/_api-utils/apiError';
import { getReqBody } from '@api/_api-utils/getReqBody';
import { withErrorHandling } from '@api/_api-utils/withErrorHandling';
import { ERROR_CODES } from '@shared/_constants/errorLiterals';
import { ValidatorService } from '@shared/_services/validator_service';
import { ENetwork } from '@shared/types';
import { StatusCodes } from 'http-status-codes';
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export const POST = withErrorHandling(async (req: NextRequest) => {
	const network = (await headers()).get('x-network') || '';
	if (!ValidatorService.isValidNetwork(network)) {
		throw new APIError(ERROR_CODES.INVALID_NETWORK, StatusCodes.BAD_REQUEST);
	}

	const { email = '', password = '', username = '' } = await getReqBody(req);

	if (!email || !password || !username) {
		throw new APIError(ERROR_CODES.MISSING_REQUIRED_FIELDS, StatusCodes.BAD_REQUEST);
	}
	if (!ValidatorService.isValidEmail(email)) {
		throw new APIError(ERROR_CODES.BAD_REQUEST, StatusCodes.BAD_REQUEST, 'Invalid email');
	}
	if (!ValidatorService.isValidUsername(username)) {
		throw new APIError(ERROR_CODES.BAD_REQUEST, StatusCodes.BAD_REQUEST, 'Invalid username');
	}
	if (!ValidatorService.isValidPassword(password)) {
		throw new APIError(ERROR_CODES.BAD_REQUEST, StatusCodes.BAD_REQUEST, 'Invalid password');
	}

	const { accessToken, refreshToken } = await AuthService.Web2SignUp(email.toLowerCase(), password, username, network as ENetwork);

	if (!accessToken) {
		throw new APIError(ERROR_CODES.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR, 'Access token not generated.');
	}

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

	const response = NextResponse.json({ message: 'Web2 signup successful' });
	response.headers.append('Set-Cookie', accessTokenCookie);
	response.headers.append('Set-Cookie', refreshTokenCookie);

	return response;
});
