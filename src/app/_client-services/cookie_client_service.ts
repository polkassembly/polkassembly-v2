// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ECookieNames, ETheme, IAccessTokenPayload, IRefreshTokenPayload } from '@/_shared/types';
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
}
