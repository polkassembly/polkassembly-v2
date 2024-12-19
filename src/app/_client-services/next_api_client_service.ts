// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

/* eslint-disable lines-between-class-members */

import { fetchPF } from '@/_shared/_utils/fetchPF';
import { EApiRoute, EWallet, IAuthResponse, IErrorResponse, IGenerateTFAResponse } from '@/_shared/types';
import { StatusCodes } from 'http-status-codes';

export class NextApiClientService {
	private static baseURL = typeof window !== 'undefined' ? `${window.location.origin}/api/v2` : '';

	private static getApiRoute: Record<EApiRoute, (data?: Record<string, unknown>) => URL> = {
		[EApiRoute.WEB2_LOGIN]: () => new URL(`${this.baseURL}/auth/actions/web2Login`),
		[EApiRoute.WEB2_SIGNUP]: () => new URL(`${this.baseURL}/auth/actions/web2Signup`),
		[EApiRoute.WEB3_LOGIN]: () => new URL(`${this.baseURL}/auth/actions/web3LoginOrSignup`),
		[EApiRoute.REFRESH_ACCESS_TOKEN]: () => new URL(`${this.baseURL}/auth/actions/refreshAccessToken`),
		[EApiRoute.USER_EXISTS]: () => new URL(`${this.baseURL}/auth/actions/usernameExists`),
		[EApiRoute.TFA_LOGIN]: () => new URL(`${this.baseURL}/auth/actions/tfa/login`),
		[EApiRoute.GEN_TFA_TOKEN]: () => new URL(`${this.baseURL}/auth/actions/tfa/setup/generate`),
		[EApiRoute.VERIFY_TFA_TOKEN]: () => new URL(`${this.baseURL}/auth/actions/tfa/setup/verify`),
		[EApiRoute.LOGOUT]: () => new URL(`${this.baseURL}/auth/actions/logout`)
	};

	private static async nextApiClientFetch<T>(
		endpoint: EApiRoute,
		data?: Record<string, unknown>,
		method?: 'GET' | 'POST'
	): Promise<{ data: T | null; error: IErrorResponse | null }> {
		const url = this.getApiRoute[endpoint]();

		const response = await fetchPF(url, {
			body: JSON.stringify(data),
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json',
				'x-api-key': process.env.NEXT_PUBLIC_POLKASSEMBLY_API_KEY || '',
				'x-network': process.env.NEXT_PUBLIC_DEFAULT_NETWORK || ''
			},
			method: method || 'POST'
		});

		const resJSON = await response.json();

		if (response.status === StatusCodes.OK) return { data: resJSON as T, error: null };
		return { data: null, error: resJSON as IErrorResponse };
	}

	static async refreshAccessToken() {
		return this.nextApiClientFetch<{ message: string }>(EApiRoute.REFRESH_ACCESS_TOKEN);
	}

	static async web2Login({ emailOrUsername, password }: { emailOrUsername: string; password: string }) {
		return this.nextApiClientFetch<IAuthResponse>(EApiRoute.WEB2_LOGIN, {
			emailOrUsername,
			password
		});
	}

	static async web2Signup({ email, username, password }: { email: string; username: string; password: string }) {
		return this.nextApiClientFetch<IAuthResponse>(EApiRoute.WEB2_SIGNUP, {
			email,
			username,
			password
		});
	}

	static async web3LoginOrSignup({ address, signature, wallet }: { address: string; signature: string; wallet: EWallet }) {
		return this.nextApiClientFetch<IAuthResponse>(EApiRoute.WEB3_LOGIN, {
			address,
			signature,
			wallet
		});
	}

	static async checkForUsernameAndEmail({ email, username }: { email: string; username: string }) {
		return this.nextApiClientFetch<{ usernameExists: boolean; emailExists: boolean; message: string; status: StatusCodes }>(EApiRoute.USER_EXISTS, {
			username,
			email
		});
	}

	static async tfaLogin({ authCode, loginAddress, loginWallet, tfaToken }: { authCode: string; loginAddress: string; loginWallet: EWallet; tfaToken: string }) {
		return this.nextApiClientFetch<{ message: string; status: StatusCodes }>(EApiRoute.TFA_LOGIN, {
			authCode,
			loginAddress,
			loginWallet,
			tfaToken
		});
	}

	static async generateTfaToken() {
		return this.nextApiClientFetch<IGenerateTFAResponse>(EApiRoute.GEN_TFA_TOKEN);
	}

	static async verifyTfaToken({ authCode }: { authCode: string }) {
		return this.nextApiClientFetch<{ message: string }>(EApiRoute.VERIFY_TFA_TOKEN, {
			authCode
		});
	}

	static async logout() {
		return this.nextApiClientFetch<{ message: string }>(EApiRoute.LOGOUT);
	}
}
