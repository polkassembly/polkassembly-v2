// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

/* eslint-disable lines-between-class-members */

import { DEFAULT_LISTING_LIMIT } from '@/_shared/_constants/listingLimit';
import { fetchPF } from '@/_shared/_utils/fetchPF';
import { EApiRoute, EWallet, IAuthResponse, IErrorResponse, IGenerateTFAResponse, IOnChainPostListingResponse } from '@/_shared/types';
import { StatusCodes } from 'http-status-codes';

type Method = 'GET' | 'POST' | 'DELETE' | 'PATCH' | 'PUT';

export class NextApiClientService {
	private static baseURL = typeof window !== 'undefined' ? `${window.location.origin}/api/v2` : '';

	private static getApiRoute: Record<EApiRoute, (routeSegments?: string[], queryParams?: URLSearchParams) => { url: URL; method: Method }> = {
		[EApiRoute.WEB2_LOGIN]: () => ({ url: new URL(`${this.baseURL}/auth/actions/web2Login`), method: 'POST' }),
		[EApiRoute.WEB2_SIGNUP]: () => ({ url: new URL(`${this.baseURL}/auth/actions/web2Signup`), method: 'POST' }),
		[EApiRoute.WEB3_LOGIN]: () => ({ url: new URL(`${this.baseURL}/auth/actions/web3LoginOrSignup`), method: 'POST' }),
		[EApiRoute.REFRESH_ACCESS_TOKEN]: () => ({ url: new URL(`${this.baseURL}/auth/actions/refreshAccessToken`), method: 'GET' }),
		[EApiRoute.USER_EXISTS]: () => ({ url: new URL(`${this.baseURL}/auth/actions/usernameExists`), method: 'GET' }),
		[EApiRoute.TFA_LOGIN]: () => ({ url: new URL(`${this.baseURL}/auth/actions/tfa/login`), method: 'POST' }),
		[EApiRoute.GEN_TFA_TOKEN]: () => ({ url: new URL(`${this.baseURL}/auth/actions/tfa/setup/generate`), method: 'GET' }),
		[EApiRoute.VERIFY_TFA_TOKEN]: () => ({ url: new URL(`${this.baseURL}/auth/actions/tfa/setup/verify`), method: 'POST' }),
		[EApiRoute.LOGOUT]: () => ({ url: new URL(`${this.baseURL}/auth/actions/logout`), method: 'GET' }),
		[EApiRoute.POSTS_LISTING]: (routeSegments?: string[], queryParams?: URLSearchParams) => {
			const url = new URL(`${this.baseURL}/${routeSegments?.join('/') || ''}`);
			if (queryParams) {
				queryParams.forEach((value, key) => {
					url.searchParams.set(key, value);
				});
			}
			return { url, method: 'GET' };
		}
	};

	private static async nextApiClientFetch<T>({
		url,
		method,
		data
	}: {
		url: URL;
		method: Method;
		data?: Record<string, unknown>;
	}): Promise<{ data: T | null; error: IErrorResponse | null }> {
		const response = await fetchPF(url, {
			body: JSON.stringify(data),
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json',
				'x-api-key': process.env.NEXT_PUBLIC_POLKASSEMBLY_API_KEY || '',
				'x-network': process.env.NEXT_PUBLIC_DEFAULT_NETWORK || ''
			},
			method
		});

		const resJSON = await response.json();

		if (response.status === StatusCodes.OK) return { data: resJSON as T, error: null };
		return { data: null, error: resJSON as IErrorResponse };
	}

	protected static async refreshAccessTokenApi() {
		const { url, method } = this.getApiRoute[EApiRoute.REFRESH_ACCESS_TOKEN]();
		return this.nextApiClientFetch<{ message: string }>({ url, method });
	}

	protected static async web2LoginApi({ emailOrUsername, password }: { emailOrUsername: string; password: string }) {
		const { url, method } = this.getApiRoute[EApiRoute.WEB2_LOGIN]();
		return this.nextApiClientFetch<IAuthResponse>({ url, method, data: { emailOrUsername, password } });
	}

	protected static async web2SignupApi({ email, username, password }: { email: string; username: string; password: string }) {
		const { url, method } = this.getApiRoute[EApiRoute.WEB2_SIGNUP]();
		return this.nextApiClientFetch<IAuthResponse>({ url, method, data: { email, username, password } });
	}

	protected static async web3LoginOrSignupApi({ address, signature, wallet }: { address: string; signature: string; wallet: EWallet }) {
		const { url, method } = this.getApiRoute[EApiRoute.WEB3_LOGIN]();
		return this.nextApiClientFetch<IAuthResponse>({ url, method, data: { address, signature, wallet } });
	}

	protected static async checkForUsernameAndEmailApi({ email, username }: { email: string; username: string }) {
		const { url, method } = this.getApiRoute[EApiRoute.USER_EXISTS]();
		return this.nextApiClientFetch<{ usernameExists: boolean; emailExists: boolean; message: string; status: StatusCodes }>({ url, method, data: { username, email } });
	}

	protected static async tfaLoginApi({ authCode, loginAddress, loginWallet, tfaToken }: { authCode: string; loginAddress: string; loginWallet: EWallet; tfaToken: string }) {
		const { url, method } = this.getApiRoute[EApiRoute.TFA_LOGIN]();
		return this.nextApiClientFetch<{ message: string; status: StatusCodes }>({ url, method, data: { authCode, loginAddress, loginWallet, tfaToken } });
	}

	protected static async generateTfaTokenApi() {
		const { url, method } = this.getApiRoute[EApiRoute.GEN_TFA_TOKEN]();
		return this.nextApiClientFetch<IGenerateTFAResponse>({ url, method });
	}

	protected static async verifyTfaTokenApi({ authCode }: { authCode: string }) {
		const { url, method } = this.getApiRoute[EApiRoute.VERIFY_TFA_TOKEN]();
		return this.nextApiClientFetch<{ message: string }>({ url, method, data: { authCode } });
	}

	protected static async logoutApi() {
		const { url, method } = this.getApiRoute[EApiRoute.LOGOUT]();
		return this.nextApiClientFetch<{ message: string }>({ url, method });
	}

	static async fetchListingDataApi(
		proposalType: string,
		page: number,
		statuses?: string[],
		origins?: string[],
		tags: string[] = []
	): Promise<{ data: IOnChainPostListingResponse | null; error: IErrorResponse | null }> {
		const queryParams = new URLSearchParams({
			page: page.toString(),
			limit: DEFAULT_LISTING_LIMIT.toString()
		});

		if (statuses?.length) {
			statuses.forEach((status) => queryParams.append('status', status));
		}

		if (tags.length) {
			tags.forEach((tag) => queryParams.append('tags', tag));
		}

		if (Array.isArray(origins) && origins.length) {
			origins.forEach((origin) => queryParams.append('origin', origin));
		}

		const { url, method } = this.getApiRoute[EApiRoute.POSTS_LISTING]([proposalType], queryParams);
		return this.nextApiClientFetch<IOnChainPostListingResponse>({ url, method });
	}
}
