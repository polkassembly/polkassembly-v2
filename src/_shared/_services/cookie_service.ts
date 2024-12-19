// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ECookieNames, ELocales, ETheme } from '@/_shared/types';
import { cookies } from 'next/headers';
import { DEFAULT_THEME } from '@/_shared/_constants/defaultTheme';
import { DEFAULT_LOCALE } from '@/_shared/_constants/defaultLocale';
import { ValidatorService } from '@/_shared/_services/validator_service';
import { CookieClientService } from '@/app/_client-services/cookie_client_service';

export class CookieService {
	// getters
	static async getCookieValueByName(cookieName: ECookieNames) {
		const cookieStore = await cookies();
		return cookieStore.get(cookieName);
	}

	static async getUserFromCookie() {
		const accessToken = await this.getCookieValueByName(ECookieNames.ACCESS_TOKEN);
		if (!accessToken || !accessToken.value) return null;

		return CookieClientService.decodeAccessToken(accessToken.value);
	}

	static async getRefreshTokenFromCookie() {
		const refreshToken = await this.getCookieValueByName(ECookieNames.REFRESH_TOKEN);
		if (!refreshToken || !refreshToken.value) return null;

		return CookieClientService.decodeRefreshToken(refreshToken.value);
	}

	static async getUserPreferencesFromCookie() {
		const themeCookie = await this.getCookieValueByName(ECookieNames.THEME);
		const localeCookie = await this.getCookieValueByName(ECookieNames.LOCALE);

		let theme = DEFAULT_THEME;
		let locale = DEFAULT_LOCALE;

		if (themeCookie?.value && ValidatorService.isValidTheme(themeCookie.value)) {
			theme = themeCookie.value as ETheme;
		}

		if (localeCookie?.value && ValidatorService.isValidLocale(localeCookie.value)) {
			locale = localeCookie.value as ELocales;
		}

		return { theme, locale };
	}

	// setters (use in util functions with 'use server')
	static async setCookieValueByName(cookieName: ECookieNames, value: string) {
		const cookieStore = await cookies();
		cookieStore.set(cookieName, value);
	}
}
