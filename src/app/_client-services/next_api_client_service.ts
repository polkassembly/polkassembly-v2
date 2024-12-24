// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

/* eslint-disable lines-between-class-members */

import { DEFAULT_LISTING_LIMIT } from '@/_shared/_constants/listingLimit';
import { fetchPF } from '@/_shared/_utils/fetchPF';
import { EApiRoute, EWallet, IAuthResponse, IErrorResponse, IGenerateTFAResponse, IOnChainPostListingResponse } from '@/_shared/types';
import { StatusCodes } from 'http-status-codes';

export class NextApiClientService {
	private static baseURL = typeof window !== 'undefined' ? `${window.location.origin}/api/v2` : '';

	private static getApiRoute: Record<EApiRoute, (routeSegments?: string[], queryParams?: URLSearchParams) => URL> = {
		[EApiRoute.WEB2_LOGIN]: () => new URL(`${this.baseURL}/auth/actions/web2Login`),
		[EApiRoute.WEB2_SIGNUP]: () => new URL(`${this.baseURL}/auth/actions/web2Signup`),
		[EApiRoute.WEB3_LOGIN]: () => new URL(`${this.baseURL}/auth/actions/web3LoginOrSignup`),
		[EApiRoute.REFRESH_ACCESS_TOKEN]: () => new URL(`${this.baseURL}/auth/actions/refreshAccessToken`),
		[EApiRoute.USER_EXISTS]: () => new URL(`${this.baseURL}/auth/actions/usernameExists`),
		[EApiRoute.TFA_LOGIN]: () => new URL(`${this.baseURL}/auth/actions/tfa/login`),
		[EApiRoute.GEN_TFA_TOKEN]: () => new URL(`${this.baseURL}/auth/actions/tfa/setup/generate`),
		[EApiRoute.VERIFY_TFA_TOKEN]: () => new URL(`${this.baseURL}/auth/actions/tfa/setup/verify`),
		[EApiRoute.LOGOUT]: () => new URL(`${this.baseURL}/auth/actions/logout`),
		[EApiRoute.POSTS_LISTING]: (routeSegments?: string[], queryParams?: URLSearchParams) => {
			const url = new URL(`${this.baseURL}/${routeSegments?.join('/') || ''}`);
			if (queryParams) {
				queryParams.forEach((value, key) => {
					url.searchParams.set(key, value);
				});
			}
			return url;
		}
	};

	private static async nextApiClientFetch<T>(url: URL, data?: Record<string, unknown>, method?: 'GET' | 'POST'): Promise<{ data: T | null; error: IErrorResponse | null }> {
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

	protected static async refreshAccessTokenApi() {
		return this.nextApiClientFetch<{ message: string }>(this.getApiRoute[EApiRoute.REFRESH_ACCESS_TOKEN]());
	}

	protected static async web2LoginApi({ emailOrUsername, password }: { emailOrUsername: string; password: string }) {
		return this.nextApiClientFetch<IAuthResponse>(this.getApiRoute[EApiRoute.WEB2_LOGIN](), {
			emailOrUsername,
			password
		});
	}

	protected static async web2SignupApi({ email, username, password }: { email: string; username: string; password: string }) {
		return this.nextApiClientFetch<IAuthResponse>(this.getApiRoute[EApiRoute.WEB2_SIGNUP](), {
			email,
			username,
			password
		});
	}

	protected static async web3LoginOrSignupApi({ address, signature, wallet }: { address: string; signature: string; wallet: EWallet }) {
		return this.nextApiClientFetch<IAuthResponse>(this.getApiRoute[EApiRoute.WEB3_LOGIN](), {
			address,
			signature,
			wallet
		});
	}

	protected static async checkForUsernameAndEmailApi({ email, username }: { email: string; username: string }) {
		return this.nextApiClientFetch<{ usernameExists: boolean; emailExists: boolean; message: string; status: StatusCodes }>(this.getApiRoute[EApiRoute.USER_EXISTS](), {
			username,
			email
		});
	}

	protected static async tfaLoginApi({ authCode, loginAddress, loginWallet, tfaToken }: { authCode: string; loginAddress: string; loginWallet: EWallet; tfaToken: string }) {
		return this.nextApiClientFetch<{ message: string; status: StatusCodes }>(this.getApiRoute[EApiRoute.TFA_LOGIN](), {
			authCode,
			loginAddress,
			loginWallet,
			tfaToken
		});
	}

	protected static async generateTfaTokenApi() {
		return this.nextApiClientFetch<IGenerateTFAResponse>(this.getApiRoute[EApiRoute.GEN_TFA_TOKEN]());
	}

	protected static async verifyTfaTokenApi({ authCode }: { authCode: string }) {
		return this.nextApiClientFetch<{ message: string }>(this.getApiRoute[EApiRoute.VERIFY_TFA_TOKEN](), {
			authCode
		});
	}

	protected static async logoutApi() {
		return this.nextApiClientFetch<{ message: string }>(this.getApiRoute[EApiRoute.LOGOUT]());
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

		const url = this.getApiRoute[EApiRoute.POSTS_LISTING]([proposalType], queryParams);
		return this.nextApiClientFetch<IOnChainPostListingResponse>(url, undefined, 'GET');
	}
}
