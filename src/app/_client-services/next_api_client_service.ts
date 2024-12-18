// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

/* eslint-disable lines-between-class-members */

import { fetchPF } from '@/_shared/_utils/fetchPF';
import { EWallet, IAuthResponse, IGenerateTFAResponse } from '@/_shared/types';
import { ClientError } from '@app/_client-utils/clientError';
import { StatusCodes } from 'http-status-codes';

export class NextApiClientService {
	private static async nextApiClientFetch<T>(endpoint: string, data?: Record<string, unknown>, method?: 'GET' | 'POST'): Promise<T> {
		const baseUrl = window.location.origin;
		const reqURL = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;

		const url = `${baseUrl}/api/v2/${reqURL}`;

		return fetchPF(url, {
			body: JSON.stringify(data),
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json',
				'x-api-key': process.env.NEXT_PUBLIC_POLKASSEMBLY_API_KEY || '',
				'x-network': process.env.NEXT_PUBLIC_DEFAULT_NETWORK || ''
			},
			method: method || 'POST'
		})
			.then((response) => {
				return response.json();
			})
			.catch((error) => {
				console.log('error', error);
				throw new ClientError(error.message);
			});
	}

	static async refreshAccessToken() {
		return this.nextApiClientFetch<{ message: string }>('/auth/actions/refreshAccessToken');
	}

	static async web2Login({ emailOrUsername, password }: { emailOrUsername: string; password: string }) {
		return this.nextApiClientFetch<IAuthResponse>('/auth/actions/web2Login', {
			emailOrUsername,
			password
		});
	}

	static async web2Signup({ email, username, password }: { email: string; username: string; password: string }) {
		return this.nextApiClientFetch<IAuthResponse>('/auth/actions/web2Signup', {
			email,
			username,
			password
		});
	}

	static async web3LoginOrSignup({ address, signature, wallet }: { address: string; signature: string; wallet: EWallet }) {
		return this.nextApiClientFetch<IAuthResponse>('/auth/actions/web3LoginOrSignup', {
			address,
			signature,
			wallet
		});
	}

	static async checkForUsernameAndEmail({ email, username }: { email: string; username: string }) {
		return this.nextApiClientFetch<{ usernameExists: boolean; emailExists: boolean; message: string; status: StatusCodes }>('/auth/actions/usernameExists', {
			username,
			email
		});
	}

	static async tfaLogin({ authCode, loginAddress, loginWallet, tfaToken }: { authCode: string; loginAddress: string; loginWallet: EWallet; tfaToken: string }) {
		return this.nextApiClientFetch<{ message: string; status: StatusCodes }>('/auth/actions/tfa/login', {
			authCode,
			loginAddress,
			loginWallet,
			tfaToken
		});
	}

	static async generateTfaToken() {
		return this.nextApiClientFetch<IGenerateTFAResponse>('/auth/actions/tfa/setup/generate');
	}

	static async verifyTfaToken({ authCode }: { authCode: string }) {
		return this.nextApiClientFetch<{ message: string }>('/auth/actions/tfa/setup/verify', {
			authCode
		});
	}

	static async logout() {
		return this.nextApiClientFetch<{ message: string }>('/auth/actions/logout');
	}
}
