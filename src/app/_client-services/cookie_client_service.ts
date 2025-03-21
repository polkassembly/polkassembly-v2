// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ValidatorService } from '@/_shared/_services/validator_service';
import { ECookieNames, ELocales, ETheme, IAccessTokenPayload, IRefreshTokenPayload } from '@/_shared/types';
import { deleteCookie, getCookie, setCookie } from 'cookies-next/client';
import { decodeToken } from 'react-jwt';

export class CookieClientService {
	private static getCookieInClient(cookieName: ECookieNames) {
		return getCookie(cookieName);
	}

	private static deleteCookieFromClient(cookieName: ECookieNames) {
		return deleteCookie(cookieName);
	}

	private static setCookieInClient(cookieName: ECookieNames, value: string) {
		return setCookie(cookieName, value);
	}

	private static decodeCookieToken<T>(token: string) {
		if (!token) return null;
		const tokenPayload = decodeToken<T>(token);

		if (tokenPayload) {
			return tokenPayload;
		}
		return null;
	}

	static getAccessTokenPayload() {
		const accessToken = this.getCookieInClient(ECookieNames.ACCESS_TOKEN);
		return this.decodeCookieToken<IAccessTokenPayload>(accessToken || '');
	}

	static getRefreshTokenPayload() {
		const refreshToken = this.getCookieInClient(ECookieNames.REFRESH_TOKEN);
		return this.decodeCookieToken<IRefreshTokenPayload>(refreshToken || '');
	}

	static deleteAccessToken() {
		this.deleteCookieFromClient(ECookieNames.ACCESS_TOKEN);
	}

	static deleteRefreshToken() {
		this.deleteCookieFromClient(ECookieNames.REFRESH_TOKEN);
	}

	static setThemeCookie(theme: ETheme) {
		this.setCookieInClient(ECookieNames.THEME, theme);
	}

	static getThemeCookie(): ETheme {
		const theme = this.getCookieInClient(ECookieNames.THEME);
		if (theme && ValidatorService.isValidTheme(theme)) {
			return theme as ETheme;
		}
		return ETheme.LIGHT;
	}

	static setLocaleCookie(locale: ELocales) {
		this.setCookieInClient(ECookieNames.LOCALE, locale);
	}

	static getLocaleCookie(): ELocales {
		const locale = this.getCookieInClient(ECookieNames.LOCALE);
		if (locale && ValidatorService.isValidLocale(locale)) {
			return locale as ELocales;
		}
		return ELocales.ENGLISH;
	}
}
