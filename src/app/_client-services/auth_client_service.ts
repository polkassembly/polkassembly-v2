// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { EWallet } from '@/_shared/types';
import { NextApiClientService } from './next_api_client_service';
import { CookieClientService } from './cookie_client_service';
import { LocalStorageClientService } from './local_storage_client_service';

export class AuthClientService extends NextApiClientService {
	static async refreshAccessToken() {
		return this.refreshAccessTokenApi();
	}

	static async web2Login({ emailOrUsername, password }: { emailOrUsername: string; password: string }) {
		return this.web2LoginApi({
			emailOrUsername,
			password
		});
	}

	static async web2Signup({ email, username, password }: { email: string; username: string; password: string }) {
		return this.web2SignupApi({
			email,
			username,
			password
		});
	}

	static async web3LoginOrSignup({ address, signature, wallet }: { address: string; signature: string; wallet: EWallet }) {
		return this.web3LoginOrSignupApi({
			address,
			signature,
			wallet
		});
	}

	static async remarkLogin({ address, wallet, remarkHash }: { address: string; wallet: EWallet; remarkHash: string }) {
		return this.remarkLoginApi({
			address,
			wallet,
			remarkHash
		});
	}

	static async getRemarkLoginMessage({ address }: { address: string }) {
		return this.getRemarkLoginMessageApi({ address });
	}

	static async checkForUsernameAndEmail({ email, username }: { email: string; username: string }) {
		return this.checkForUsernameAndEmailApi({
			username,
			email
		});
	}

	static async tfaLogin({ authCode, loginAddress, loginWallet, tfaToken }: { authCode: string; loginAddress: string; loginWallet: EWallet; tfaToken: string }) {
		return this.tfaLoginApi({
			authCode,
			loginAddress,
			loginWallet,
			tfaToken
		});
	}

	static async generateTfaToken() {
		return this.generateTfaTokenApi();
	}

	static async verifyTfaToken({ authCode }: { authCode: string }) {
		return this.verifyTfaTokenApi({
			authCode
		});
	}

	static async logout({ isIframe, onLogout }: { isIframe?: boolean; onLogout?: () => void }) {
		this.logoutApi();
		onLogout?.();

		CookieClientService.deleteAccessToken(isIframe);
		CookieClientService.deleteRefreshToken(isIframe);
		LocalStorageClientService.logout();
	}

	static async linkAddress({ address, signature, wallet }: { address: string; signature: string; wallet: EWallet }) {
		return this.linkAddressApi({ address, signature, wallet });
	}

	static async generateQRSession() {
		return this.generateQRSessionApi();
	}

	static async sendResetPasswordEmail({ email }: { email: string }) {
		return this.sendResetPasswordEmailApi({ email });
	}

	static async resetPasswordWithToken({ token, newPassword }: { token: string; newPassword: string }) {
		return this.resetPasswordWithTokenApi({ token, newPassword });
	}
}
