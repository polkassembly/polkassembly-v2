// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

/* eslint-disable lines-between-class-members */

import { DEFAULT_LISTING_LIMIT, PREIMAGES_LISTING_LIMIT } from '@/_shared/_constants/listingLimit';
import { fetchPF } from '@/_shared/_utils/fetchPF';
import { getBaseUrl } from '@/_shared/_utils/getBaseUrl';
import {
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
	IGenericListingResponse,
	IPostListing,
	IPost,
	IPublicUser,
	IVoteData,
	IUserActivity,
	IPreimage,
	IQRSessionPayload,
	ESocial,
	IFollowEntry,
	ITag,
	EAllowedCommentor,
	EOffChainPostTopic
} from '@/_shared/types';
import { OutputData } from '@editorjs/editorjs';
import { StatusCodes } from 'http-status-codes';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { getSharedEnvVars } from '@/_shared/_utils/getSharedEnvVars';
import { ValidatorService } from '@/_shared/_services/validator_service';
import { ERROR_CODES, ERROR_MESSAGES } from '@/_shared/_constants/errorLiterals';
import { ClientError } from '../_client-utils/clientError';
import { getNetworkFromHeaders } from '../api/_api-utils/getNetworkFromHeaders';
import { redisServiceSSR } from '../api/_api-utils/redisServiceSSR';

type Method = 'GET' | 'POST' | 'DELETE' | 'PATCH' | 'PUT';

enum EApiRoute {
	WEB2_LOGIN = 'WEB2_LOGIN',
	WEB2_SIGNUP = 'WEB2_SIGNUP',
	WEB3_LOGIN = 'WEB3_LOGIN',
	REFRESH_ACCESS_TOKEN = 'REFRESH_ACCESS_TOKEN',
	USER_EXISTS = 'USER_EXISTS',
	TFA_LOGIN = 'TFA_LOGIN',
	GEN_TFA_TOKEN = 'GEN_TFA_TOKEN',
	VERIFY_TFA_TOKEN = 'VERIFY_TFA_TOKEN',
	LOGOUT = 'LOGOUT',
	POSTS_LISTING = 'POSTS_LISTING',
	FETCH_PROPOSAL_DETAILS = 'FETCH_PROPOSAL_DETAILS',
	GET_COMMENTS = 'GET_COMMENTS',
	ADD_COMMENT = 'ADD_COMMENT',
	GET_ACTIVITY_FEED = 'GET_ACTIVITY_FEED',
	GET_VOTES_HISTORY = 'GET_VOTES_HISTORY',
	ADD_POST_REACTION = 'ADD_POST_REACTION',
	DELETE_REACTION = 'DELETE_REACTION',
	PUBLIC_USER_DATA_BY_ID = 'PUBLIC_USER_DATA_BY_ID',
	PUBLIC_USER_DATA_BY_ADDRESS = 'PUBLIC_USER_DATA_BY_ADDRESS',
	PUBLIC_USER_DATA_BY_USERNAME = 'PUBLIC_USER_DATA_BY_USERNAME',
	EDIT_PROPOSAL_DETAILS = 'EDIT_PROPOSAL_DETAILS',
	FETCH_USER_ACTIVITY = 'FETCH_USER_ACTIVITY',
	GET_PREIMAGE_FOR_POST = 'GET_PREIMAGE_FOR_POST',
	FETCH_PREIMAGES = 'FETCH_PREIMAGES',
	DELETE_COMMENT = 'DELETE_COMMENT',
	GENERATE_QR_SESSION = 'GENERATE_QR_SESSION',
	CLAIM_QR_SESSION = 'CLAIM_QR_SESSION',
	LINK_ADDRESS = 'LINK_ADDRESS',
	EDIT_USER_PROFILE = 'EDIT_USER_PROFILE',
	DELETE_ACCOUNT = 'DELETE_ACCOUNT',
	FETCH_LEADERBOARD = 'FETCH_LEADERBOARD',
	FOLLOW_USER = 'FOLLOW_USER',
	UNFOLLOW_USER = 'UNFOLLOW_USER',
	GET_FOLLOWING = 'GET_FOLLOWING',
	GET_FOLLOWERS = 'GET_FOLLOWERS',
	FETCH_ALL_TAGS = 'FETCH_ALL_TAGS',
	CREATE_TAGS = 'CREATE_TAGS',
	CREATE_OFFCHAIN_POST = 'CREATE_OFFCHAIN_POST'
}

export class NextApiClientService {
	private static isServerSide() {
		return !global?.window;
	}

	private static async getCurrentNetwork() {
		return this.isServerSide() ? getNetworkFromHeaders() : getCurrentNetwork();
	}

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

		// eslint-disable-next-line sonarjs/max-switch-cases
		switch (route) {
			// TODO: remove this route, use get public user via usernameroute instead
			case EApiRoute.USER_EXISTS:
				path = '/auth/username-exists';
				method = 'POST';
				break;

			// get routes
			case EApiRoute.REFRESH_ACCESS_TOKEN:
				path = '/auth/refresh-access-token';
				break;
			case EApiRoute.GENERATE_QR_SESSION:
				path = '/auth/qr-session';
				break;
			case EApiRoute.GET_ACTIVITY_FEED:
				path = '/activity-feed';
				break;
			case EApiRoute.FETCH_LEADERBOARD:
				path = '/users';
				break;
			case EApiRoute.FETCH_PREIMAGES:
				path = '/preimages';
				break;
			case EApiRoute.FETCH_ALL_TAGS:
				path = '/meta/tags';
				break;
			case EApiRoute.PUBLIC_USER_DATA_BY_ID:
			case EApiRoute.FETCH_USER_ACTIVITY:
				path = '/users/id';
				break;
			case EApiRoute.GET_FOLLOWING:
			case EApiRoute.GET_FOLLOWERS:
				path = '/users/id';
				break;
			case EApiRoute.PUBLIC_USER_DATA_BY_ADDRESS:
				path = '/users/address';
				break;
			case EApiRoute.PUBLIC_USER_DATA_BY_USERNAME:
				path = '/users/username';
				break;
			case EApiRoute.POSTS_LISTING:
			case EApiRoute.FETCH_PROPOSAL_DETAILS:
			case EApiRoute.GET_PREIMAGE_FOR_POST:
			case EApiRoute.GET_COMMENTS:
			case EApiRoute.GET_VOTES_HISTORY:
				break;

			// post routes
			case EApiRoute.LOGOUT:
				path = '/auth/logout';
				method = 'POST';
				break;
			case EApiRoute.LINK_ADDRESS:
				path = '/auth/link-address';
				method = 'POST';
				break;
			case EApiRoute.CLAIM_QR_SESSION:
				path = '/auth/qr-session';
				method = 'POST';
				break;
			case EApiRoute.VERIFY_TFA_TOKEN:
				path = '/auth/tfa/setup/verify';
				method = 'POST';
				break;
			case EApiRoute.GEN_TFA_TOKEN:
				path = '/auth/tfa/setup/generate';
				method = 'POST';
				break;
			case EApiRoute.TFA_LOGIN:
				path = '/auth/tfa/login';
				method = 'POST';
				break;
			case EApiRoute.WEB2_SIGNUP:
				path = '/auth/web2-auth/signup';
				method = 'POST';
				break;
			case EApiRoute.WEB3_LOGIN:
				path = '/auth/web3-auth';
				method = 'POST';
				break;
			case EApiRoute.WEB2_LOGIN:
				path = '/auth/web2-auth/login';
				method = 'POST';
				break;
			case EApiRoute.CREATE_TAGS:
				method = 'POST';
				path = '/meta/tags';
				break;
			case EApiRoute.FOLLOW_USER:
				path = '/users/id';
				method = 'POST';
				break;
			case EApiRoute.CREATE_OFFCHAIN_POST:
			case EApiRoute.ADD_COMMENT:
			case EApiRoute.ADD_POST_REACTION:
				method = 'POST';
				break;

			// patch routes
			case EApiRoute.EDIT_USER_PROFILE:
				path = '/users/id';
				method = 'PATCH';
				break;
			case EApiRoute.EDIT_PROPOSAL_DETAILS:
				method = 'PATCH';
				break;

			// delete routes
			case EApiRoute.DELETE_ACCOUNT:
			case EApiRoute.UNFOLLOW_USER:
				path = '/users/id';
				method = 'DELETE';
				break;
			case EApiRoute.DELETE_REACTION:
			case EApiRoute.DELETE_COMMENT:
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
		const currentNetwork = await this.getCurrentNetwork();

		const response = await fetchPF(url, {
			body: JSON.stringify(data),
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json',
				'x-api-key': getSharedEnvVars().NEXT_PUBLIC_POLKASSEMBLY_API_KEY,
				'x-network': currentNetwork
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

	protected static async linkAddressApi({ address, signature, wallet }: { address: string; signature: string; wallet: EWallet }) {
		const { url, method } = await this.getRouteConfig({ route: EApiRoute.LINK_ADDRESS });
		return this.nextApiClientFetch<{ message: string }>({ url, method, data: { address, signature, wallet } });
	}

	static async fetchListingData({
		proposalType,
		page,
		statuses,
		origins = [],
		tags = [],
		limit = DEFAULT_LISTING_LIMIT
	}: {
		proposalType: string;
		page: number;
		statuses?: string[];
		origins?: EPostOrigin[];
		tags?: string[];
		limit?: number;
	}): Promise<{ data: IGenericListingResponse<IPostListing> | null; error: IErrorResponse | null }> {
		// try redis cache first if ssr
		if (this.isServerSide()) {
			const currentNetwork = await this.getCurrentNetwork();

			const cachedData = await redisServiceSSR('GetPostsListing', {
				network: currentNetwork,
				proposalType,
				page,
				limit,
				statuses,
				origins,
				tags
			});

			if (cachedData) {
				return { data: cachedData, error: null };
			}
		}

		const queryParams = new URLSearchParams({
			page: page.toString(),
			limit: DEFAULT_LISTING_LIMIT.toString()
		});

		if (limit) {
			queryParams.append('limit', limit.toString());
		}

		if (statuses?.length) {
			statuses.forEach((status) => queryParams.append('status', status));
		}

		if (tags?.length) {
			tags.forEach((tag) => queryParams.append('tags', tag));
		}

		if (origins?.length) {
			origins.forEach((origin) => queryParams.append('origin', origin));
		}

		const { url, method } = await this.getRouteConfig({ route: EApiRoute.POSTS_LISTING, routeSegments: [proposalType], queryParams });
		return this.nextApiClientFetch<IGenericListingResponse<IPostListing>>({ url, method });
	}

	// Post Reactions
	static async addPostReaction(proposalType: EProposalType, index: string, reactionType: EReaction) {
		const { url, method } = await this.getRouteConfig({ route: EApiRoute.ADD_POST_REACTION, routeSegments: [proposalType, index, 'reactions'] });
		return this.nextApiClientFetch<{ message: string; reactionId: string }>({ url, method, data: { reaction: reactionType } });
	}

	// Delete Post Reaction
	static async deletePostReaction(proposalType: EProposalType, index: string, reactionId: string) {
		const { url, method } = await this.getRouteConfig({ route: EApiRoute.DELETE_REACTION, routeSegments: [proposalType, index, 'reactions', reactionId] });
		return this.nextApiClientFetch<{ message: string }>({ url, method });
	}

	// details
	static async fetchProposalDetails(proposalType: EProposalType, index: string) {
		if (this.isServerSide()) {
			const currentNetwork = await this.getCurrentNetwork();

			const cachedData = await redisServiceSSR('GetPostData', {
				network: currentNetwork,
				proposalType,
				indexOrHash: index
			});

			if (cachedData) {
				return { data: cachedData, error: null };
			}
		}

		const { url, method } = await this.getRouteConfig({ route: EApiRoute.FETCH_PROPOSAL_DETAILS, routeSegments: [proposalType, index] });
		return this.nextApiClientFetch<IPost>({ url, method });
	}

	static async editProposalDetails(proposalType: EProposalType, index: string, data: { title: string; content: OutputData }) {
		const { url, method } = await this.getRouteConfig({ route: EApiRoute.EDIT_PROPOSAL_DETAILS, routeSegments: [proposalType, index] });
		return this.nextApiClientFetch<{ message: string }>({ url, method, data });
	}

	static async getPreimageForPost(proposalType: EProposalType, index: string) {
		const { url, method } = await this.getRouteConfig({ route: EApiRoute.GET_PREIMAGE_FOR_POST, routeSegments: [proposalType, index, 'preimage'] });
		return this.nextApiClientFetch<IPreimage>({ url, method });
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

	protected static async deleteCommentFromPostApi({ id, proposalType, index }: { id: string; proposalType: EProposalType; index: string }) {
		const { url, method } = await this.getRouteConfig({ route: EApiRoute.DELETE_COMMENT, routeSegments: [proposalType, index, 'comments', id] });
		return this.nextApiClientFetch<{ message: string }>({ url, method });
	}

	// votes
	static async getVotesHistory({ proposalType, index, page, decision }: { proposalType: EProposalType; index: string; page: number; decision: EVoteDecision }) {
		const queryParams = new URLSearchParams({
			page: page.toString(),
			limit: DEFAULT_LISTING_LIMIT.toString(),
			decision
		});
		const { url, method } = await this.getRouteConfig({ route: EApiRoute.GET_VOTES_HISTORY, routeSegments: [proposalType, index, 'votes'], queryParams });
		return this.nextApiClientFetch<{ votes: IVoteData[]; totalCount: number }>({ url, method });
	}

	// activity feed
	static async fetchActivityFeed({ page, origins, limit = DEFAULT_LISTING_LIMIT, userId }: { page: number; origins?: EPostOrigin[]; limit?: number; userId?: number }) {
		if (this.isServerSide()) {
			const currentNetwork = await this.getCurrentNetwork();

			const cachedData = await redisServiceSSR('GetActivityFeed', {
				network: currentNetwork,
				page,
				limit,
				...(origins ? { origins } : {}),
				...(userId ? { userId } : {})
			});

			if (cachedData) {
				return { data: cachedData, error: null };
			}
		}

		const queryParams = new URLSearchParams({
			page: page.toString(),
			limit: limit.toString()
		});

		if (origins?.length) {
			origins.forEach((origin) => queryParams.append('origin', origin));
		}

		const { url, method } = await this.getRouteConfig({ route: EApiRoute.GET_ACTIVITY_FEED, queryParams });
		return this.nextApiClientFetch<IGenericListingResponse<IPostListing>>({ url, method });
	}

	// user data
	protected static async fetchPublicUserByIdApi({ userId }: { userId: number }) {
		const { url, method } = await this.getRouteConfig({ route: EApiRoute.PUBLIC_USER_DATA_BY_ID, routeSegments: [userId.toString()] });
		return this.nextApiClientFetch<IPublicUser>({ url, method });
	}

	protected static async fetchPublicUserByAddressApi({ address }: { address: string }) {
		const { url, method } = await this.getRouteConfig({ route: EApiRoute.PUBLIC_USER_DATA_BY_ADDRESS, routeSegments: [address] });
		return this.nextApiClientFetch<IPublicUser>({ url, method });
	}

	protected static async fetchPublicUserByUsernameApi({ username }: { username: string }) {
		const { url, method } = await this.getRouteConfig({ route: EApiRoute.PUBLIC_USER_DATA_BY_USERNAME, routeSegments: [username] });
		return this.nextApiClientFetch<IPublicUser>({ url, method });
	}

	protected static async fetchUserActivityApi({ userId }: { userId: number }) {
		const { url, method } = await this.getRouteConfig({ route: EApiRoute.FETCH_USER_ACTIVITY, routeSegments: [userId.toString(), 'activities'] });
		return this.nextApiClientFetch<IUserActivity[]>({ url, method });
	}

	protected static async editUserProfileApi({
		userId,
		bio,
		badges,
		title,
		image,
		coverImage,
		publicSocialLinks,
		email,
		username
	}: {
		userId: number;
		bio?: string;
		badges?: string[];
		title?: string;
		image?: string;
		coverImage?: string;
		publicSocialLinks?: { platform: ESocial; url: string }[];
		email?: string;
		username?: string;
	}) {
		const { url, method } = await this.getRouteConfig({ route: EApiRoute.EDIT_USER_PROFILE, routeSegments: [userId.toString()] });
		return this.nextApiClientFetch<{ message: string }>({ url, method, data: { bio, badges, title, image, coverImage, publicSocialLinks, email, username } });
	}

	protected static async deleteAccountApi({ userId }: { userId: number }) {
		const { url, method } = await this.getRouteConfig({ route: EApiRoute.DELETE_ACCOUNT, routeSegments: [userId.toString()] });
		return this.nextApiClientFetch<{ message: string }>({ url, method });
	}

	protected static async followUserApi({ userId }: { userId: number }) {
		const { url, method } = await this.getRouteConfig({ route: EApiRoute.FOLLOW_USER, routeSegments: [userId.toString(), 'followers'] });
		return this.nextApiClientFetch<{ message: string }>({ url, method });
	}

	protected static async unfollowUserApi({ userId }: { userId: number }) {
		const { url, method } = await this.getRouteConfig({ route: EApiRoute.UNFOLLOW_USER, routeSegments: [userId.toString(), 'followers'] });
		return this.nextApiClientFetch<{ message: string }>({ url, method });
	}

	protected static async getFollowingApi({ userId }: { userId: number }) {
		const { url, method } = await this.getRouteConfig({ route: EApiRoute.GET_FOLLOWING, routeSegments: [userId.toString(), 'following'] });
		return this.nextApiClientFetch<{ following: IFollowEntry[] }>({ url, method });
	}

	protected static async getFollowersApi({ userId }: { userId: number }) {
		const { url, method } = await this.getRouteConfig({ route: EApiRoute.GET_FOLLOWERS, routeSegments: [userId.toString(), 'followers'] });
		return this.nextApiClientFetch<{ followers: IFollowEntry[] }>({ url, method });
	}

	static async fetchPreimages({ page }: { page: number }) {
		const queryParams = new URLSearchParams({
			page: page.toString(),
			limit: PREIMAGES_LISTING_LIMIT.toString()
		});

		const { url, method } = await this.getRouteConfig({ route: EApiRoute.FETCH_PREIMAGES, queryParams });
		return this.nextApiClientFetch<IGenericListingResponse<IPreimage>>({ url, method });
	}

	static async fetchPreimageByHash({ hash }: { hash: string }) {
		const { url, method } = await this.getRouteConfig({ route: EApiRoute.FETCH_PREIMAGES, routeSegments: [hash] });
		return this.nextApiClientFetch<IPreimage>({ url, method });
	}

	protected static async generateQRSession() {
		const { url, method } = await this.getRouteConfig({ route: EApiRoute.GENERATE_QR_SESSION });
		return this.nextApiClientFetch<IQRSessionPayload>({ url, method });
	}
	static async fetchAllTags() {
		const { url, method } = await this.getRouteConfig({ route: EApiRoute.FETCH_ALL_TAGS });
		return this.nextApiClientFetch<IGenericListingResponse<ITag>>({ url, method });
	}

	static async createTags(tags: string[]) {
		const { url, method } = await this.getRouteConfig({ route: EApiRoute.CREATE_TAGS });
		if (!tags.length || tags.some((tag) => !ValidatorService.isValidTag(tag))) {
			throw new ClientError(ERROR_CODES.CLIENT_ERROR, ERROR_MESSAGES[ERROR_CODES.CLIENT_ERROR]);
		}
		return this.nextApiClientFetch<{ message: string }>({ url, method, data: { tags } });
	}

	static async createOffChainPost({
		proposalType,
		allowedCommentor,
		content,
		title,
		tags,
		topic
	}: {
		proposalType: EProposalType;
		content: OutputData;
		title: string;
		allowedCommentor: EAllowedCommentor;
		tags?: ITag[];
		topic?: EOffChainPostTopic;
	}) {
		if (!ValidatorService.isValidOffChainProposalType(proposalType)) {
			throw new ClientError(ERROR_CODES.CLIENT_ERROR, ERROR_MESSAGES[ERROR_CODES.CLIENT_ERROR]);
		}
		const { url, method } = await this.getRouteConfig({ route: EApiRoute.CREATE_OFFCHAIN_POST, routeSegments: [proposalType] });
		return this.nextApiClientFetch<{ message: string; data: { id: string; index: number } }>({ url, method, data: { content, title, allowedCommentor, tags, topic } });
	}
	static async fetchLeaderboardApi({ page, limit }: { page: number; limit?: number }) {
		const queryParams = new URLSearchParams({
			page: page.toString() || '1',
			limit: limit?.toString() || DEFAULT_LISTING_LIMIT.toString()
		});

		const { url, method } = await this.getRouteConfig({ route: EApiRoute.FETCH_LEADERBOARD, queryParams });
		return this.nextApiClientFetch<IGenericListingResponse<IPublicUser>>({ url, method });
	}
}
