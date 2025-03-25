// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ECookieNames, ELocales, ETheme, IAccessTokenPayload, IRefreshTokenPayload } from '@/_shared/types';
import { cookies } from 'next/headers';
import { DEFAULT_THEME } from '@/_shared/_constants/defaultTheme';
import { DEFAULT_LOCALE } from '@/_shared/_constants/defaultLocale';
import { ValidatorService } from '@/_shared/_services/validator_service';
import { decodeToken } from 'react-jwt';

export class CookieService {
	// getters
	private static async getCookieValueByName(cookieName: ECookieNames) {
		const cookieStore = await cookies();
		return cookieStore.get(cookieName);
	}

	private static decodeCookieToken<T>(token: string) {
		if (!token) return null;
		const tokenPayload = decodeToken<T>(token);

		if (tokenPayload) {
			return tokenPayload;
		}
		return null;
	}

	static async getUserFromCookie() {
		const accessToken = await this.getCookieValueByName(ECookieNames.ACCESS_TOKEN);
		if (!accessToken || !accessToken.value) return null;

		return this.decodeCookieToken<IAccessTokenPayload>(accessToken.value);
	}

	static async getRefreshTokenFromCookie() {
		const refreshToken = await this.getCookieValueByName(ECookieNames.REFRESH_TOKEN);
		if (!refreshToken || !refreshToken.value) return null;

		return this.decodeCookieToken<IRefreshTokenPayload>(refreshToken.value);
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

	private static async setCookieValueByName(cookieName: ECookieNames, value: string) {
		const cookieStore = await cookies();
		cookieStore.set(cookieName, value);
	}

	// setters (use in util functions with 'use server')
	static async setLocaleCookie(value: string) {
		await this.setCookieValueByName(ECookieNames.LOCALE, value);
	}

	static async getCookieHeaders() {
		const cookieStore = await cookies();
		return { Cookie: cookieStore.toString() };
	}
}
