// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ECookieNames, IAccessTokenPayload, IRefreshTokenPayload } from '@/_shared/types';
import { decodeToken } from 'react-jwt';
import { deleteCookie } from 'cookies-next/client';
import { NextApiClientService } from './next_api_client_service';

export class AuthClientService {
	static decodeAccessToken(token: string) {
		if (!token) return null;
		const tokenPayload = decodeToken<IAccessTokenPayload>(token);

		if (tokenPayload && tokenPayload.sub) {
			return tokenPayload;
		}
		return null;
	}

	static decodeRefreshToken(token: string) {
		if (!token) return null;
		const tokenPayload = decodeToken<IRefreshTokenPayload>(token);

		if (tokenPayload) {
			return tokenPayload;
		}
		return null;
	}

	static async logout(onLogout?: () => void) {
		onLogout?.();
		deleteCookie(ECookieNames.ACCESS_TOKEN);
		deleteCookie(ECookieNames.REFRESH_TOKEN);

		const data = await NextApiClientService.logout();

		if (data?.message) {
			console.log(data.message);
		}
	}
}
