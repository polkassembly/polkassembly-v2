// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ECookieNames } from '@/_shared/types';
import { AuthService } from '@/app/api/_api-services/auth_service';
import { APIError } from '@/app/api/_api-utils/apiError';
import { withErrorHandling } from '@/app/api/_api-utils/withErrorHandling';
import { ERROR_CODES } from '@shared/_constants/errorLiterals';
import { StatusCodes } from 'http-status-codes';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const POST = withErrorHandling(async () => {
	const cookiesStore = await cookies();

	const accessToken = cookiesStore.get(ECookieNames.ACCESS_TOKEN)?.value;

	if (!accessToken) {
		throw new APIError(ERROR_CODES.UNAUTHORIZED, StatusCodes.UNAUTHORIZED, 'User not logged in');
	}

	// Get user ID from access token
	const userId = AuthService.GetUserIdFromAccessToken(accessToken);

	if (!userId) {
		throw new APIError(ERROR_CODES.UNAUTHORIZED, StatusCodes.UNAUTHORIZED, 'Invalid access token');
	}

	// Delete all refresh tokens for this user
	await AuthService.DeleteAllRefreshTokens(userId);

	// Send response with cleared cookies
	const response = NextResponse.json({ message: 'Logged out from all sessions successfully' });
	response.cookies.delete(ECookieNames.ACCESS_TOKEN);
	response.cookies.delete(ECookieNames.REFRESH_TOKEN);

	return response;
});
