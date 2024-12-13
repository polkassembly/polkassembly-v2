// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { IAccessTokenPayload, IRefreshTokenPayload } from '@/_shared/types';
import { decodeToken } from 'react-jwt';

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
}
