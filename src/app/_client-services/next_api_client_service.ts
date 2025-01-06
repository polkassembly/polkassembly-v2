// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

/* eslint-disable lines-between-class-members */

import { DEFAULT_LISTING_LIMIT } from '@/_shared/_constants/listingLimit';
import { fetchPF } from '@/_shared/_utils/fetchPF';
import { getBaseUrl } from '@/_shared/_utils/getBaseUrl';
import {
	EApiRoute,
	EProposalType,
	EWallet,
	IAuthResponse,
	IComment,
	ICommentResponse,
	IErrorResponse,
	IGenerateTFAResponse,
	IOnChainPostListingResponse,
	IPost
} from '@/_shared/types';
import { OutputData } from '@editorjs/editorjs';
import { StatusCodes } from 'http-status-codes';

type Method = 'GET' | 'POST' | 'DELETE' | 'PATCH' | 'PUT';

export class NextApiClientService {
	private static getApiRoute = async (route: EApiRoute): Promise<(routeSegments?: string[], queryParams?: URLSearchParams) => { url: URL; method: Method }> => {
		const baseURL = await getBaseUrl();

		// Unified function to create URLs for both static and dynamic routes
		const createUrl = (path: string, method: Method, routeSegments?: string[], queryParams?: URLSearchParams) => {
			const segments = routeSegments?.length ? `/${routeSegments.join('/')}` : '';
			const url = new URL(`${baseURL}${path}${segments}`);

			if (queryParams) {
				queryParams.forEach((value, key) => url.searchParams.set(key, value));
			}
			return { url, method };
		};

		const routes = {
			// Static routes
			[EApiRoute.WEB2_LOGIN]: () => createUrl('/auth/actions/web2Login', 'POST'),
			[EApiRoute.WEB2_SIGNUP]: () => createUrl('/auth/actions/web2Signup', 'POST'),
			[EApiRoute.WEB3_LOGIN]: () => createUrl('/auth/actions/web3LoginOrSignup', 'POST'),
			[EApiRoute.REFRESH_ACCESS_TOKEN]: () => createUrl('/auth/actions/refreshAccessToken', 'GET'),
			[EApiRoute.USER_EXISTS]: () => createUrl('/auth/actions/usernameExists', 'GET'),
			[EApiRoute.TFA_LOGIN]: () => createUrl('/auth/actions/tfa/login', 'POST'),
			[EApiRoute.GEN_TFA_TOKEN]: () => createUrl('/auth/actions/tfa/setup/generate', 'GET'),
			[EApiRoute.VERIFY_TFA_TOKEN]: () => createUrl('/auth/actions/tfa/setup/verify', 'POST'),
			[EApiRoute.LOGOUT]: () => createUrl('/auth/actions/logout', 'GET'),

			// Dynamic routes
			[EApiRoute.POSTS_LISTING]: (routeSegments?: string[], queryParams?: URLSearchParams) => createUrl('', 'GET', routeSegments, queryParams),
			[EApiRoute.FETCH_PROPOSAL_DETAILS]: (routeSegments?: string[], queryParams?: URLSearchParams) => createUrl('', 'GET', routeSegments, queryParams),
			[EApiRoute.GET_COMMENTS]: (routeSegments?: string[], queryParams?: URLSearchParams) => createUrl('', 'GET', routeSegments, queryParams),
			[EApiRoute.ADD_COMMENT]: (routeSegments?: string[], queryParams?: URLSearchParams) => createUrl('', 'POST', routeSegments, queryParams)
		};

		return routes[`${route}`];
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

		if (response.status === StatusCodes.OK) {
			return { data: resJSON as T, error: null };
		}
		return { data: null, error: resJSON as IErrorResponse };
	}

	// auth
	protected static async refreshAccessTokenApi() {
		const { url, method } = (await this.getApiRoute(EApiRoute.REFRESH_ACCESS_TOKEN))();
		return this.nextApiClientFetch<{ message: string }>({ url, method });
	}

	protected static async web2LoginApi({ emailOrUsername, password }: { emailOrUsername: string; password: string }) {
		const { url, method } = (await this.getApiRoute(EApiRoute.WEB2_LOGIN))();
		return this.nextApiClientFetch<IAuthResponse>({ url, method, data: { emailOrUsername, password } });
	}

	protected static async web2SignupApi({ email, username, password }: { email: string; username: string; password: string }) {
		const { url, method } = (await this.getApiRoute(EApiRoute.WEB2_SIGNUP))();
		return this.nextApiClientFetch<IAuthResponse>({ url, method, data: { email, username, password } });
	}

	protected static async web3LoginOrSignupApi({ address, signature, wallet }: { address: string; signature: string; wallet: EWallet }) {
		const { url, method } = (await this.getApiRoute(EApiRoute.WEB3_LOGIN))();
		return this.nextApiClientFetch<IAuthResponse>({ url, method, data: { address, signature, wallet } });
	}

	protected static async checkForUsernameAndEmailApi({ email, username }: { email: string; username: string }) {
		const { url, method } = (await this.getApiRoute(EApiRoute.USER_EXISTS))();
		return this.nextApiClientFetch<{ usernameExists: boolean; emailExists: boolean; message: string; status: StatusCodes }>({ url, method, data: { username, email } });
	}

	protected static async tfaLoginApi({ authCode, loginAddress, loginWallet, tfaToken }: { authCode: string; loginAddress: string; loginWallet: EWallet; tfaToken: string }) {
		const { url, method } = (await this.getApiRoute(EApiRoute.TFA_LOGIN))();
		return this.nextApiClientFetch<{ message: string; status: StatusCodes }>({ url, method, data: { authCode, loginAddress, loginWallet, tfaToken } });
	}

	protected static async generateTfaTokenApi() {
		const { url, method } = (await this.getApiRoute(EApiRoute.GEN_TFA_TOKEN))();
		return this.nextApiClientFetch<IGenerateTFAResponse>({ url, method });
	}

	protected static async verifyTfaTokenApi({ authCode }: { authCode: string }) {
		const { url, method } = (await this.getApiRoute(EApiRoute.VERIFY_TFA_TOKEN))();
		return this.nextApiClientFetch<{ message: string }>({ url, method, data: { authCode } });
	}

	protected static async logoutApi() {
		const { url, method } = (await this.getApiRoute(EApiRoute.LOGOUT))();
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

		const { url, method } = (await this.getApiRoute(EApiRoute.POSTS_LISTING))([proposalType], queryParams);
		return this.nextApiClientFetch<IOnChainPostListingResponse>({ url, method });
	}
	// details
	static async fetchProposalDetailsApi(proposalType: EProposalType, index: string) {
		const { url, method } = (await this.getApiRoute(EApiRoute.FETCH_PROPOSAL_DETAILS))([proposalType, index]);
		return this.nextApiClientFetch<IPost>({ url, method });
	}

	// comments
	protected static async getCommentsOfPostApi({ proposalType, index }: { proposalType: EProposalType; index: string }) {
		const { url, method } = (await this.getApiRoute(EApiRoute.GET_COMMENTS))([proposalType, index, 'comments']);
		return this.nextApiClientFetch<ICommentResponse[]>({ url, method });
	}

	protected static async addCommentToPostApi({
		proposalType,
		index,
		content,
		parentCommentId
	}: {
		proposalType: EProposalType;
		index: string;
		content: OutputData;
		parentCommentId?: string;
	}) {
		const { url, method } = (await this.getApiRoute(EApiRoute.ADD_COMMENT))([proposalType, index, 'comments']);
		return this.nextApiClientFetch<IComment>({
			url,
			method,
			data: {
				content,
				parentCommentId
			}
		});
	}
}
