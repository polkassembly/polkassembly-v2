// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ECookieNames, EWallet, IAccessTokenPayload, IRefreshTokenPayload } from '@/_shared/types';
import { decodeToken } from 'react-jwt';
import { NextApiClientService } from './next_api_client_service';
import { CookieClientService } from './cookie_client_service';

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

	static async refreshAccessToken() {
		return NextApiClientService.refreshAccessToken();
	}

	static async web2Login({ emailOrUsername, password }: { emailOrUsername: string; password: string }) {
		return NextApiClientService.web2Login({
			emailOrUsername,
			password
		});
	}

	static async web2Signup({ email, username, password }: { email: string; username: string; password: string }) {
		return NextApiClientService.web2Signup({
			email,
			username,
			password
		});
	}

	static async web3LoginOrSignup({ address, signature, wallet }: { address: string; signature: string; wallet: EWallet }) {
		return NextApiClientService.web3LoginOrSignup({
			address,
			signature,
			wallet
		});
	}

	static async checkForUsernameAndEmail({ email, username }: { email: string; username: string }) {
		return NextApiClientService.checkForUsernameAndEmail({
			username,
			email
		});
	}

	static async tfaLogin({ authCode, loginAddress, loginWallet, tfaToken }: { authCode: string; loginAddress: string; loginWallet: EWallet; tfaToken: string }) {
		return NextApiClientService.tfaLogin({
			authCode,
			loginAddress,
			loginWallet,
			tfaToken
		});
	}

	static async generateTfaToken() {
		return NextApiClientService.generateTfaToken();
	}

	static async verifyTfaToken({ authCode }: { authCode: string }) {
		return NextApiClientService.verifyTfaToken({
			authCode
		});
	}

	static async logout(onLogout?: () => void) {
		onLogout?.();
		CookieClientService.deleteCookieFromClient(ECookieNames.ACCESS_TOKEN);
		CookieClientService.deleteCookieFromClient(ECookieNames.REFRESH_TOKEN);

		const { data } = await NextApiClientService.logout();

		if (data?.message) {
			console.log(data.message);
		}
	}
}
