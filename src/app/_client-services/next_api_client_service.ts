// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

/* eslint-disable lines-between-class-members */

import { DEFAULT_LISTING_LIMIT } from '@/_shared/_constants/listingLimit';
import { fetchPF } from '@/_shared/_utils/fetchPF';
import { getBaseUrl } from '@/_shared/_utils/getBaseUrl';
import {
	EApiRoute,
	EPostOrigin,
	EProposalType,
	EReaction,
	EVoteDecision,
	EWallet,
	IAuthResponse,
	IComment,
	ICommentResponse,
	IErrorResponse,
	IGenerateTFAResponse,
	IOnChainPostListingResponse,
	IPost,
	IPublicUser,
	IVoteData
} from '@/_shared/types';
import { OutputData } from '@editorjs/editorjs';
import { StatusCodes } from 'http-status-codes';
import { ClientError } from '../_client-utils/clientError';

type Method = 'GET' | 'POST' | 'DELETE' | 'PATCH' | 'PUT';

export class NextApiClientService {
	private static async getRouteConfig({
		route,
		routeSegments,
		queryParams
	}: {
		route: EApiRoute;
		routeSegments?: string[];
		queryParams?: URLSearchParams;
	}): Promise<{ url: URL; method: Method }> {
		const baseURL = await getBaseUrl();
		const segments = routeSegments?.length ? `/${routeSegments.join('/')}` : '';
		let path = '';
		let method: Method = 'GET';

		switch (route) {
			// Static routes
			case EApiRoute.WEB2_LOGIN:
				path = '/auth/actions/web2Login';
				method = 'POST';
				break;
			case EApiRoute.WEB2_SIGNUP:
				path = '/auth/actions/web2Signup';
				method = 'POST';
				break;
			case EApiRoute.WEB3_LOGIN:
				path = '/auth/actions/web3LoginOrSignup';
				method = 'POST';
				break;
			case EApiRoute.REFRESH_ACCESS_TOKEN:
				path = '/auth/actions/refreshAccessToken';
				break;
			case EApiRoute.USER_EXISTS:
				path = '/auth/actions/usernameExists';
				method = 'POST';
				break;
			case EApiRoute.TFA_LOGIN:
				path = '/auth/actions/tfa/login';
				method = 'POST';
				break;
			case EApiRoute.GEN_TFA_TOKEN:
				path = '/auth/actions/tfa/setup/generate';
				method = 'POST';
				break;
			case EApiRoute.VERIFY_TFA_TOKEN:
				path = '/auth/actions/tfa/setup/verify';
				method = 'POST';
				break;
			case EApiRoute.LOGOUT:
				path = '/auth/actions/logout';
				method = 'POST';
				break;
			// Dynamic routes
			case EApiRoute.POSTS_LISTING:
			case EApiRoute.FETCH_PROPOSAL_DETAILS:
			case EApiRoute.GET_COMMENTS:
			case EApiRoute.GET_ACTIVITY_FEED:
			case EApiRoute.GET_VOTES_HISTORY:
			case EApiRoute.GET_USER_BY_ID:
				break;
			case EApiRoute.ADD_COMMENT:
			case EApiRoute.POST_REACTIONS:
				method = 'POST';
				break;
			case EApiRoute.DELETE_REACTION:
				method = 'DELETE';
				break;
			default:
				throw new ClientError(`Invalid route: ${route}`);
		}

		const url = new URL(`${baseURL}${path}${segments}`);
		if (queryParams) {
			queryParams.forEach((value, key) => url.searchParams.set(key, value));
		}

		return { url, method };
	}

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
		const { url, method } = await this.getRouteConfig({ route: EApiRoute.REFRESH_ACCESS_TOKEN });
		return this.nextApiClientFetch<{ message: string }>({ url, method });
	}

	protected static async web2LoginApi({ emailOrUsername, password }: { emailOrUsername: string; password: string }) {
		const { url, method } = await this.getRouteConfig({ route: EApiRoute.WEB2_LOGIN });
		return this.nextApiClientFetch<IAuthResponse>({ url, method, data: { emailOrUsername, password } });
	}

	protected static async web2SignupApi({ email, username, password }: { email: string; username: string; password: string }) {
		const { url, method } = await this.getRouteConfig({ route: EApiRoute.WEB2_SIGNUP });
		return this.nextApiClientFetch<IAuthResponse>({ url, method, data: { email, username, password } });
	}

	protected static async web3LoginOrSignupApi({ address, signature, wallet }: { address: string; signature: string; wallet: EWallet }) {
		const { url, method } = await this.getRouteConfig({ route: EApiRoute.WEB3_LOGIN });
		return this.nextApiClientFetch<IAuthResponse>({ url, method, data: { address, signature, wallet } });
	}

	protected static async checkForUsernameAndEmailApi({ email, username }: { email: string; username: string }) {
		const { url, method } = await this.getRouteConfig({ route: EApiRoute.USER_EXISTS });
		return this.nextApiClientFetch<{ usernameExists: boolean; emailExists: boolean; message: string; status: StatusCodes }>({ url, method, data: { username, email } });
	}

	protected static async tfaLoginApi({ authCode, loginAddress, loginWallet, tfaToken }: { authCode: string; loginAddress: string; loginWallet: EWallet; tfaToken: string }) {
		const { url, method } = await this.getRouteConfig({ route: EApiRoute.TFA_LOGIN });
		return this.nextApiClientFetch<{ message: string; status: StatusCodes }>({ url, method, data: { authCode, loginAddress, loginWallet, tfaToken } });
	}

	protected static async generateTfaTokenApi() {
		const { url, method } = await this.getRouteConfig({ route: EApiRoute.GEN_TFA_TOKEN });
		return this.nextApiClientFetch<IGenerateTFAResponse>({ url, method });
	}

	protected static async verifyTfaTokenApi({ authCode }: { authCode: string }) {
		const { url, method } = await this.getRouteConfig({ route: EApiRoute.VERIFY_TFA_TOKEN });
		return this.nextApiClientFetch<{ message: string }>({ url, method, data: { authCode } });
	}

	protected static async logoutApi() {
		const { url, method } = await this.getRouteConfig({ route: EApiRoute.LOGOUT });
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

		const { url, method } = await this.getRouteConfig({ route: EApiRoute.POSTS_LISTING, routeSegments: [proposalType], queryParams });
		return this.nextApiClientFetch<IOnChainPostListingResponse>({ url, method });
	}

	// get user by id users/id/{{userId}}
	static async getUserByIdApi(userId: string) {
		const { url, method } = await this.getRouteConfig({ route: EApiRoute.GET_USER_BY_ID, routeSegments: ['users', 'id', userId] });
		return this.nextApiClientFetch<IPublicUser>({ url, method });
	}

	// Post Reactions
	static async postReactionsApi(proposalType: EProposalType, index: string, reactionType: EReaction) {
		const { url, method } = await this.getRouteConfig({ route: EApiRoute.POST_REACTIONS, routeSegments: [proposalType, index, 'reactions'] });
		return this.nextApiClientFetch<{ message: string; reactionId: string }>({ url, method, data: { reaction: reactionType } });
	}

	// Delete Post Reaction
	static async deletePostReactionApi(proposalType: EProposalType, index: string, reactionId: string) {
		const { url, method } = await this.getRouteConfig({ route: EApiRoute.DELETE_REACTION, routeSegments: [proposalType, index, 'reactions', reactionId] });
		return this.nextApiClientFetch<{ message: string }>({ url, method });
	}

	// details
	static async fetchProposalDetailsApi(proposalType: EProposalType, index: string) {
		const { url, method } = await this.getRouteConfig({ route: EApiRoute.FETCH_PROPOSAL_DETAILS, routeSegments: [proposalType, index] });
		return this.nextApiClientFetch<IPost>({ url, method });
	}

	// comments
	protected static async getCommentsOfPostApi({ proposalType, index }: { proposalType: EProposalType; index: string }) {
		const { url, method } = await this.getRouteConfig({ route: EApiRoute.GET_COMMENTS, routeSegments: [proposalType, index, 'comments'] });
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
		const { url, method } = await this.getRouteConfig({ route: EApiRoute.ADD_COMMENT, routeSegments: [proposalType, index, 'comments'] });
		return this.nextApiClientFetch<IComment>({
			url,
			method,
			data: {
				content,
				parentCommentId
			}
		});
	}

	// votes
	static async getVotesHistoryApi({ proposalType, index, page, decision }: { proposalType: EProposalType; index: string; page: number; decision: EVoteDecision }) {
		const queryParams = new URLSearchParams({
			page: page.toString(),
			limit: DEFAULT_LISTING_LIMIT.toString(),
			decision
		});
		const { url, method } = await this.getRouteConfig({ route: EApiRoute.GET_VOTES_HISTORY, routeSegments: [proposalType, index, 'votes'], queryParams });
		return this.nextApiClientFetch<{ votes: IVoteData[]; totalCount: number }>({ url, method });
	}

	// activity feed
	static async fetchActivityFeedApi(page: number, origin?: EPostOrigin, limit: number = DEFAULT_LISTING_LIMIT) {
		const queryParams = new URLSearchParams({
			page: page.toString(),
			limit: limit.toString()
		});

		if (origin) {
			queryParams.append('origin', origin.toString());
		}

		const { url, method } = await this.getRouteConfig({ route: EApiRoute.GET_ACTIVITY_FEED, routeSegments: ['activityFeed'], queryParams });
		return this.nextApiClientFetch<IOnChainPostListingResponse>({ url, method });
	}
}
