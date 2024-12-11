// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { EAuthCookieNames } from '@/_shared/types';
import { cookies } from 'next/headers';
import { AuthClientService } from '../_client-services/auth_service';

export const getJwtTokenFromCookie = async (cookieName: EAuthCookieNames) => {
	const cookieStore = await cookies();
	return cookieStore.get(cookieName);
};

export const getUserFromCookie = async () => {
	const accessToken = await getJwtTokenFromCookie(EAuthCookieNames.ACCESS_TOKEN);
	if (!accessToken || !accessToken.value) return null;

	return AuthClientService.decodeAccessToken(accessToken.value);
};

export const getRefreshTokenFromCookie = async () => {
	const refreshToken = await getJwtTokenFromCookie(EAuthCookieNames.REFRESH_TOKEN);
	if (!refreshToken || !refreshToken.value) return null;

	return AuthClientService.decodeRefreshToken(refreshToken.value);
};
