// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { IAccessTokenPayload } from '@/_shared/types';
import { decodeToken } from 'react-jwt';

export class AuthClientService {
	static handleTokenChange(token: string) {
		if (!token) return null;
		const tokenPayload = token && decodeToken<IAccessTokenPayload>(token);

		if (tokenPayload && tokenPayload.sub) {
			const {
				addresses,
				defaultAddress,
				roles,
				id,
				username,
				email,
				isEmailVerified,
				web3signup,
				is2FAEnabled = false,
				loginAddress,
				loginWallet
			} = tokenPayload as IAccessTokenPayload;

			return {
				addresses,
				defaultAddress,
				roles,
				id,
				username,
				email,
				isEmailVerified,
				web3signup,
				is2FAEnabled,
				loginAddress,
				loginWallet
			};
		}
		return null;
	}
}
