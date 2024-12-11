// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ERROR_CODES } from '@/_shared/_constants/errorLiterals';
import { EAuthCookieNames } from '@/_shared/types';
import { AuthService } from '@/app/api/_api-services/auth_service';
import { APIError } from '@/app/api/_api-utils/apiError';
import { withErrorHandling } from '@/app/api/_api-utils/withErrorHandling';
import { StatusCodes } from 'http-status-codes';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { ValidatorService } from '@/_shared/_services/validator_service';

export const POST = withErrorHandling(async () => {
	// 1. read access token from cookie
	const cookieStore = await cookies();
	const accessToken = cookieStore.get(EAuthCookieNames.ACCESS_TOKEN)?.value;

	// 2. verify access token
	if (!accessToken) {
		throw new APIError(ERROR_CODES.UNAUTHORIZED, StatusCodes.UNAUTHORIZED, 'Access token not found');
	}

	const isValidAccessToken = AuthService.IsValidAccessToken(accessToken);
	if (!isValidAccessToken) {
		throw new APIError(ERROR_CODES.UNAUTHORIZED, StatusCodes.UNAUTHORIZED, 'Access token is invalid');
	}

	// 3. get user id from access token
	const userId = await AuthService.GetUserIdFromAccessToken(accessToken);

	if (!ValidatorService.isValidUserId(userId)) {
		throw new APIError(ERROR_CODES.UNAUTHORIZED, StatusCodes.UNAUTHORIZED, 'User not found');
	}

	// 4. generate TFA secret
	const { base32Secret, otpauthUrl } = await AuthService.GenerateTfaOtp(userId);

	if (!base32Secret || !otpauthUrl) {
		throw new APIError(ERROR_CODES.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to generate TFA secret');
	}

	// 5. return TFA secret
	return NextResponse.json({ base32Secret, otpauthUrl });
});
