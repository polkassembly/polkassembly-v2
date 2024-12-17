// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { ECookieNames, ELocales, ETheme } from '@/_shared/types';
import { cookies } from 'next/headers';
import { ValidatorService } from '@/_shared/_services/validator_service';
import { DEFAULT_THEME } from '@/_shared/_constants/defaultTheme';
import { DEFAULT_LOCALE } from '@/_shared/_constants/defaultLocale';
import { AuthClientService } from '../_client-services/auth_service';

export const getCookieValueByName = async (cookieName: ECookieNames) => {
	const cookieStore = await cookies();
	return cookieStore.get(cookieName);
};

export const getUserFromCookie = async () => {
	const accessToken = await getCookieValueByName(ECookieNames.ACCESS_TOKEN);
	if (!accessToken || !accessToken.value) return null;

	return AuthClientService.decodeAccessToken(accessToken.value);
};

export const getRefreshTokenFromCookie = async () => {
	const refreshToken = await getCookieValueByName(ECookieNames.REFRESH_TOKEN);
	if (!refreshToken || !refreshToken.value) return null;

	return AuthClientService.decodeRefreshToken(refreshToken.value);
};

export const getUserPreferencesFromCookie = async () => {
	const themeCookie = await getCookieValueByName(ECookieNames.THEME);
	const localeCookie = await getCookieValueByName(ECookieNames.LOCALE);

	let theme = DEFAULT_THEME;
	let locale = DEFAULT_LOCALE;

	if (themeCookie?.value && ValidatorService.isValidTheme(themeCookie.value)) {
		theme = themeCookie.value as ETheme;
	}

	if (localeCookie?.value && ValidatorService.isValidLocale(localeCookie.value)) {
		locale = localeCookie.value as ELocales;
	}

	return { theme, locale };
};
