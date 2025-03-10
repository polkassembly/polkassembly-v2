// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ECookieNames } from '@/_shared/types';
import { AuthService } from '@/app/api/_api-services/auth_service';
import { withErrorHandling } from '@/app/api/_api-utils/withErrorHandling';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const POST = withErrorHandling(async () => {
	const cookiesStore = await cookies();

	const refreshToken = cookiesStore.get(ECookieNames.REFRESH_TOKEN)?.value;
	const isValidRefreshToken = await AuthService.IsValidRefreshToken(refreshToken || '');

	if (isValidRefreshToken && refreshToken) {
		// Delete only the current session's refresh token
		await AuthService.DeleteRefreshToken(refreshToken);
	}

	// send response with cleared cookies
	const response = NextResponse.json({ message: 'Logged out successfully' });
	response.cookies.delete(ECookieNames.ACCESS_TOKEN);
	response.cookies.delete(ECookieNames.REFRESH_TOKEN);

	return response;
});
