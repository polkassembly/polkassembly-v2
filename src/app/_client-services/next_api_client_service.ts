// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

/* eslint-disable sonarjs/no-duplicate-string */

import { DEFAULT_LISTING_LIMIT, PREIMAGES_LISTING_LIMIT } from '@/_shared/_constants/listingLimit';
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
	IUserActivity,
	IPreimage,
	IQRSessionPayload,
	ESocial,
	IFollowEntry,
	ITag,
	EAllowedCommentor,
	EOffChainPostTopic,
	IBountyStats,
	IBountyUserActivity,
	IVoteCartItem,
	EConvictionAmount,
	IDelegationStats,
	IDelegateDetails,
	ITrackDelegationStats,
	ITrackDelegationDetails,
	ISocialHandle,
	ITreasuryStats,
	IContentSummary,
	IAddressRelations,
	IVoteCurve,
	ITrackAnalyticsStats,
	IVoteHistoryData,
	IUserPosts,
	ITrackAnalyticsDelegations,
	IOnChainMetadata,
	EVoteSortOptions,
	EHttpHeaderKey,
	IPostLink
} from '@/_shared/types';
import { StatusCodes } from 'http-status-codes';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { getSharedEnvVars } from '@/_shared/_utils/getSharedEnvVars';
import { ValidatorService } from '@/_shared/_services/validator_service';
import { ERROR_CODES, ERROR_MESSAGES } from '@/_shared/_constants/errorLiterals';
import { getCookieHeadersServer } from '@/_shared/_utils/getCookieHeadersServer';
import { dayjs } from '@/_shared/_utils/dayjsInit';
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
	GET_ON_CHAIN_METADATA_FOR_POST = 'GET_ON_CHAIN_METADATA_FOR_POST',
	FETCH_PREIMAGES = 'FETCH_PREIMAGES',
	DELETE_COMMENT = 'DELETE_COMMENT',
	EDIT_COMMENT = 'EDIT_COMMENT',
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
	CREATE_OFFCHAIN_POST = 'CREATE_OFFCHAIN_POST',
	FETCH_CHILD_BOUNTIES = 'FETCH_CHILD_BOUNTIES',
	FETCH_BOUNTIES_STATS = 'FETCH_BOUNTIES_STATS',
	FETCH_BOUNTIES_USER_ACTIVITY = 'FETCH_BOUNTIES_USER_ACTIVITY',
	GET_CHILD_BOUNTIES = 'GET_CHILD_BOUNTIES',
	GET_BATCH_VOTE_CART = 'GET_BATCH_VOTE_CART',
	EDIT_BATCH_VOTE_CART_ITEM = 'EDIT_BATCH_VOTE_CART_ITEM',
	DELETE_BATCH_VOTE_CART_ITEM = 'DELETE_BATCH_VOTE_CART_ITEM',
	DELETE_BATCH_VOTE_CART = 'DELETE_BATCH_VOTE_CART',
	ADD_TO_BATCH_VOTE_CART = 'ADD_TO_BATCH_VOTE_CART',
	GET_SUBSCRIBED_ACTIVITY_FEED = 'GET_SUBSCRIBED_ACTIVITY_FEED',
	ADD_POST_SUBSCRIPTION = 'ADD_POST_SUBSCRIPTION',
	DELETE_POST_SUBSCRIPTION = 'DELETE_POST_SUBSCRIPTION',
	GET_DELEGATE_STATS = 'GET_DELEGATE_STATS',
	FETCH_DELEGATES = 'FETCH_DELEGATES',
	CREATE_PA_DELEGATE = 'CREATE_PA_DELEGATE',
	UPDATE_PA_DELEGATE = 'UPDATE_PA_DELEGATE',
	GET_USER_SOCIAL_HANDLES = 'GET_USER_SOCIAL_HANDLES',
	INIT_SOCIAL_VERIFICATION = 'INIT_SOCIAL_VERIFICATION',
	CONFIRM_SOCIAL_VERIFICATION = 'CONFIRM_SOCIAL_VERIFICATION',
	JUDGEMENT_CALL = 'JUDGEMENT_CALL',
	GET_TREASURY_STATS = 'GET_TREASURY_STATS',
	GET_ADDRESS_RELATIONS = 'GET_ADDRESS_RELATIONS',
	GET_VOTE_CURVES = 'GET_VOTE_CURVES',
	GET_CONTENT_SUMMARY = 'GET_CONTENT_SUMMARY',
	GET_TRACK_ANALYTICS = 'GET_TRACK_ANALYTICS',
	GET_USER_POSTS = 'GET_USER_POSTS'
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
			case EApiRoute.GET_SUBSCRIBED_ACTIVITY_FEED:
				path = '/activity-feed/subscriptions';
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
			case EApiRoute.GET_TREASURY_STATS:
				path = '/meta/treasury-stats';
				break;
			case EApiRoute.PUBLIC_USER_DATA_BY_ID:
			case EApiRoute.FETCH_USER_ACTIVITY:
			case EApiRoute.GET_FOLLOWING:
			case EApiRoute.GET_FOLLOWERS:
			case EApiRoute.GET_BATCH_VOTE_CART:
			case EApiRoute.GET_USER_SOCIAL_HANDLES:
				path = '/users/id';
				break;
			case EApiRoute.GET_ADDRESS_RELATIONS:
			case EApiRoute.PUBLIC_USER_DATA_BY_ADDRESS:
			case EApiRoute.GET_USER_POSTS:
				path = '/users/address';
				break;

			case EApiRoute.PUBLIC_USER_DATA_BY_USERNAME:
				path = '/users/username';
				break;
			case EApiRoute.GET_DELEGATE_STATS:
				path = '/delegation/stats';
				break;
			case EApiRoute.FETCH_DELEGATES:
				path = '/delegation/delegates';
				break;
			case EApiRoute.FETCH_BOUNTIES_STATS:
				path = '/bounties/stats';
				break;
			case EApiRoute.FETCH_BOUNTIES_USER_ACTIVITY:
				path = '/bounties/user-activity';
				break;
			case EApiRoute.GET_CHILD_BOUNTIES:
			case EApiRoute.POSTS_LISTING:
			case EApiRoute.FETCH_PROPOSAL_DETAILS:
			case EApiRoute.GET_ON_CHAIN_METADATA_FOR_POST:
			case EApiRoute.GET_COMMENTS:
			case EApiRoute.GET_VOTES_HISTORY:
			case EApiRoute.GET_CONTENT_SUMMARY:
			case EApiRoute.FETCH_CHILD_BOUNTIES:
			case EApiRoute.GET_VOTE_CURVES:
				break;
			case EApiRoute.GET_TRACK_ANALYTICS:
				path = '/track-analytics';
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
			case EApiRoute.ADD_TO_BATCH_VOTE_CART:
			case EApiRoute.FOLLOW_USER:
			case EApiRoute.INIT_SOCIAL_VERIFICATION:
			case EApiRoute.CONFIRM_SOCIAL_VERIFICATION:
				path = '/users/id';
				method = 'POST';
				break;
			case EApiRoute.CREATE_PA_DELEGATE:
				path = '/delegation/delegates';
				method = 'POST';
				break;
			case EApiRoute.CREATE_OFFCHAIN_POST:
			case EApiRoute.ADD_COMMENT:
			case EApiRoute.ADD_POST_SUBSCRIPTION:
			case EApiRoute.ADD_POST_REACTION:
				method = 'POST';
				break;
			case EApiRoute.JUDGEMENT_CALL:
				path = '/identity/judgement-call';
				method = 'POST';
				break;

			// patch routes
			case EApiRoute.EDIT_USER_PROFILE:
			case EApiRoute.EDIT_BATCH_VOTE_CART_ITEM:
				path = '/users/id';
				method = 'PATCH';
				break;
			case EApiRoute.UPDATE_PA_DELEGATE:
				path = '/delegation/delegates';
				method = 'PATCH';
				break;
			case EApiRoute.EDIT_PROPOSAL_DETAILS:
			case EApiRoute.EDIT_COMMENT:
				method = 'PATCH';
				break;

			// delete routes
			case EApiRoute.DELETE_ACCOUNT:
			case EApiRoute.UNFOLLOW_USER:
			case EApiRoute.DELETE_BATCH_VOTE_CART_ITEM:
			case EApiRoute.DELETE_BATCH_VOTE_CART:
				path = '/users/id';
				method = 'DELETE';
				break;
			case EApiRoute.DELETE_REACTION:
			case EApiRoute.DELETE_POST_SUBSCRIPTION:
			case EApiRoute.DELETE_COMMENT:
				method = 'DELETE';
				break;

			default:
				throw new ClientError(`Invalid route: ${route}`);
		}

		const url = new URL(`${baseURL}${path}${segments}`);
		if (queryParams) {
			// Get all keys in the URLSearchParams
			const keys = Array.from(new Set(Array.from(queryParams.keys())));

			// For each unique key
			keys.forEach((key) => {
				// Get all values for this key
				const values = queryParams.getAll(key);

				// If there's only one value, use set
				if (values.length === 1) {
					url.searchParams.set(key, values[0]);
				}
				// If there are multiple values, use append for each
				else if (values.length > 1) {
					// First clear any existing values for this key
					url.searchParams.delete(key);
					// Then append each value
					values.forEach((value) => {
						url.searchParams.append(key, value);
					});
				}
			});
		}

		return { url, method };
	}

	private static async nextApiClientFetch<T>({
		url,
		method,
		data,
		skipCache = false
	}: {
		url: URL;
		method: Method;
		data?: Record<string, unknown>;
		skipCache?: boolean;
	}): Promise<{ data: T | null; error: IErrorResponse | null }> {
		const currentNetwork = await this.getCurrentNetwork();

		const response = await fetch(url, {
			body: JSON.stringify(data),
			credentials: 'include',
			headers: {
				...(!global.window ? await getCookieHeadersServer() : {}),
				'Content-Type': 'application/json',
				'x-api-key': getSharedEnvVars().NEXT_PUBLIC_POLKASSEMBLY_API_KEY,
				'x-network': currentNetwork,
				[EHttpHeaderKey.SKIP_CACHE]: skipCache.toString()
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
		limit = DEFAULT_LISTING_LIMIT,
		userId
	}: {
		proposalType: string;
		page: number;
		statuses?: string[];
		origins?: EPostOrigin[];
		tags?: string[];
		limit?: number;
		userId?: number;
	}): Promise<{ data: IGenericListingResponse<IPostListing> | null; error: IErrorResponse | null }> {
		// try redis cache first if ssr
		if (this.isServerSide() && !ValidatorService.isValidNumber(userId)) {
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

		if (userId) {
			queryParams.set('userId', userId.toString());
		}

		if (limit) {
			queryParams.set('limit', limit.toString());
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
	static async fetchProposalDetails({ proposalType, indexOrHash, skipCache = false }: { proposalType: EProposalType; indexOrHash: string; skipCache?: boolean }) {
		if (this.isServerSide() && !skipCache) {
			const currentNetwork = await this.getCurrentNetwork();

			const cachedData = await redisServiceSSR('GetPostData', {
				network: currentNetwork,
				proposalType,
				indexOrHash
			});

			if (cachedData) {
				return { data: cachedData, error: null };
			}
		}

		const { url, method } = await this.getRouteConfig({ route: EApiRoute.FETCH_PROPOSAL_DETAILS, routeSegments: [proposalType, indexOrHash] });
		return this.nextApiClientFetch<IPost>({ url, method, skipCache });
	}

	static async editProposalDetails({
		proposalType,
		index,
		data
	}: {
		proposalType: EProposalType;
		index: string;
		data: { title: string; content: string; linkedPost?: IPostLink };
	}) {
		const { url, method } = await this.getRouteConfig({ route: EApiRoute.EDIT_PROPOSAL_DETAILS, routeSegments: [proposalType, index] });
		return this.nextApiClientFetch<{ message: string }>({ url, method, data });
	}

	static async getOnChainMetadataForPost(proposalType: EProposalType, index: string) {
		const { url, method } = await this.getRouteConfig({ route: EApiRoute.GET_ON_CHAIN_METADATA_FOR_POST, routeSegments: [proposalType, index, 'on-chain-metadata'] });
		return this.nextApiClientFetch<IOnChainMetadata>({ url, method });
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
		content: string;
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

	protected static async editCommentFromPostApi({ id, proposalType, index, content }: { id: string; proposalType: EProposalType; index: string; content: string }) {
		const { url, method } = await this.getRouteConfig({ route: EApiRoute.EDIT_COMMENT, routeSegments: [proposalType, index, 'comments', id] });
		return this.nextApiClientFetch<{ message: string }>({ url, method, data: { content } });
	}

	// votes
	static async getVotesHistory({
		proposalType,
		index,
		page,
		decision,
		orderBy
	}: {
		proposalType: EProposalType;
		index: string;
		page: number;
		decision: EVoteDecision;
		orderBy: EVoteSortOptions;
	}) {
		const queryParams = new URLSearchParams({
			page: page.toString(),
			limit: DEFAULT_LISTING_LIMIT.toString(),
			decision,
			orderBy
		});
		const { url, method } = await this.getRouteConfig({ route: EApiRoute.GET_VOTES_HISTORY, routeSegments: [proposalType, index, 'votes'], queryParams });
		return this.nextApiClientFetch<IVoteHistoryData>({ url, method });
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

	static async getSubscribedActivityFeed({ page, limit = DEFAULT_LISTING_LIMIT, userId }: { page: number; limit?: number; userId: number }) {
		if (this.isServerSide()) {
			const currentNetwork = await this.getCurrentNetwork();

			const cachedData = await redisServiceSSR('GetSubscriptionFeed', {
				network: currentNetwork,
				page,
				limit,
				userId
			});

			if (cachedData) {
				return { data: cachedData, error: null };
			}
		}

		const queryParams = new URLSearchParams({
			page: page.toString(),
			limit: limit.toString()
		});

		const { url, method } = await this.getRouteConfig({ route: EApiRoute.GET_SUBSCRIBED_ACTIVITY_FEED, queryParams });
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

	protected static async getBatchVoteCartApi({ userId }: { userId: number }) {
		const { url, method } = await this.getRouteConfig({ route: EApiRoute.GET_BATCH_VOTE_CART, routeSegments: [userId.toString(), 'vote-cart'] });
		return this.nextApiClientFetch<{ voteCart: IVoteCartItem[] }>({ url, method });
	}

	protected static async addToBatchVoteCartApi({
		userId,
		postIndexOrHash,
		proposalType,
		decision,
		amount,
		conviction
	}: {
		userId: number;
		postIndexOrHash: string;
		proposalType: EProposalType;
		decision: EVoteDecision;
		amount: { abstain?: string; aye?: string; nay?: string };
		conviction: EConvictionAmount;
	}) {
		const { url, method } = await this.getRouteConfig({ route: EApiRoute.ADD_TO_BATCH_VOTE_CART, routeSegments: [userId.toString(), 'vote-cart'] });
		return this.nextApiClientFetch<{ voteCartItem: IVoteCartItem }>({ url, method, data: { postIndexOrHash, proposalType, decision, amount, conviction } });
	}

	protected static async editBatchVoteCartItemApi({
		userId,
		id,
		decision,
		amount,
		conviction
	}: {
		userId: number;
		id: string;
		decision: EVoteDecision;
		amount: { abstain?: string; aye?: string; nay?: string };
		conviction: EConvictionAmount;
	}) {
		const { url, method } = await this.getRouteConfig({ route: EApiRoute.EDIT_BATCH_VOTE_CART_ITEM, routeSegments: [userId.toString(), 'vote-cart'] });
		return this.nextApiClientFetch<{ voteCartItem: IVoteCartItem }>({ url, method, data: { id, decision, amount, conviction } });
	}

	protected static async deleteBatchVoteCartItemApi({ userId, id }: { userId: number; id: string }) {
		const { url, method } = await this.getRouteConfig({ route: EApiRoute.DELETE_BATCH_VOTE_CART_ITEM, routeSegments: [userId.toString(), 'vote-cart'] });
		return this.nextApiClientFetch<{ message: string }>({ url, method, data: { id } });
	}

	protected static async clearBatchVoteCartApi({ userId }: { userId: number }) {
		const { url, method } = await this.getRouteConfig({ route: EApiRoute.DELETE_BATCH_VOTE_CART, routeSegments: [userId.toString(), 'vote-cart', 'clear'] });
		return this.nextApiClientFetch<{ message: string }>({ url, method });
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

	protected static async generateQRSessionApi() {
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
		content: string;
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

	static async fetchBountiesStats() {
		const { url, method } = await this.getRouteConfig({ route: EApiRoute.FETCH_BOUNTIES_STATS });
		return this.nextApiClientFetch<IBountyStats>({ url, method });
	}

	static async fetchBountiesUserActivity() {
		const { url, method } = await this.getRouteConfig({ route: EApiRoute.FETCH_BOUNTIES_USER_ACTIVITY });
		return this.nextApiClientFetch<IBountyUserActivity[]>({ url, method });
	}

	static async getChildBounties(proposalType: EProposalType, index: string) {
		const { url, method } = await this.getRouteConfig({ route: EApiRoute.GET_CHILD_BOUNTIES, routeSegments: [proposalType, index, 'child-bounties'] });
		return this.nextApiClientFetch<IPreimage>({ url, method });
	}

	static async addPostSubscription(proposalType: EProposalType, index: string) {
		const { url, method } = await this.getRouteConfig({ route: EApiRoute.ADD_POST_SUBSCRIPTION, routeSegments: [proposalType, index, 'subscription'] });
		return this.nextApiClientFetch<{ message: string; id: string }>({ url, method });
	}

	static async deletePostSubscription(proposalType: EProposalType, index: string) {
		const { url, method } = await this.getRouteConfig({ route: EApiRoute.DELETE_POST_SUBSCRIPTION, routeSegments: [proposalType, index, 'subscription'] });
		return this.nextApiClientFetch<{ message: string }>({ url, method });
	}

	static async getDelegateStats() {
		const { url, method } = await this.getRouteConfig({ route: EApiRoute.GET_DELEGATE_STATS });
		return this.nextApiClientFetch<IDelegationStats>({ url, method });
	}

	static async fetchDelegates() {
		const { url, method } = await this.getRouteConfig({ route: EApiRoute.FETCH_DELEGATES });
		return this.nextApiClientFetch<IDelegateDetails[]>({ url, method });
	}

	static async createPADelegate({ address, manifesto }: { address: string; manifesto: string }) {
		const { url, method } = await this.getRouteConfig({ route: EApiRoute.CREATE_PA_DELEGATE });
		return this.nextApiClientFetch<{ id: string }>({ url, method, data: { address, manifesto } });
	}

	static async updatePADelegate({ address, manifesto }: { address: string; manifesto: string }) {
		const { url, method } = await this.getRouteConfig({ route: EApiRoute.UPDATE_PA_DELEGATE, routeSegments: [address] });
		return this.nextApiClientFetch<{ message: string }>({ url, method, data: { manifesto } });
	}

	static async getPADelegateManifesto({ address }: { address: string }) {
		const { url, method } = await this.getRouteConfig({ route: EApiRoute.FETCH_DELEGATES, routeSegments: [address] });
		return this.nextApiClientFetch<IDelegateDetails>({ url, method });
	}

	static async getDelegateTracks({ address }: { address: string }) {
		const { url, method } = await this.getRouteConfig({ route: EApiRoute.PUBLIC_USER_DATA_BY_ADDRESS, routeSegments: [address, 'delegation', 'tracks'] });
		return this.nextApiClientFetch<{ delegationStats: ITrackDelegationStats[] }>({ url, method });
	}

	static async getDelegateTrack({ address, trackId }: { address: string; trackId: number }) {
		const { url, method } = await this.getRouteConfig({ route: EApiRoute.PUBLIC_USER_DATA_BY_ADDRESS, routeSegments: [address, 'delegation', 'tracks', trackId.toString()] });
		return this.nextApiClientFetch<ITrackDelegationDetails>({ url, method });
	}

	static async fetchContentSummary({ proposalType, indexOrHash }: { proposalType: EProposalType; indexOrHash: string }) {
		if (this.isServerSide()) {
			const currentNetwork = await this.getCurrentNetwork();

			const cachedData = await redisServiceSSR('GetContentSummary', {
				network: currentNetwork,
				proposalType,
				indexOrHash
			});

			if (cachedData) {
				return { data: cachedData, error: null };
			}
		}

		const { url, method } = await this.getRouteConfig({
			route: EApiRoute.GET_CONTENT_SUMMARY,
			routeSegments: [proposalType, indexOrHash, 'content-summary']
		});
		return this.nextApiClientFetch<IContentSummary>({ url, method });
	}

	static async fetchChildBountiesApi({ bountyIndex, limit, page }: { bountyIndex: string; limit: string; page: string }) {
		const queryParams = new URLSearchParams({
			limit,
			page
		});

		const { url, method } = await this.getRouteConfig({
			route: EApiRoute.FETCH_CHILD_BOUNTIES,
			routeSegments: [EProposalType.BOUNTY, bountyIndex.toString(), 'child-bounties'],
			queryParams
		});
		return this.nextApiClientFetch<IGenericListingResponse<IPostListing>>({ url, method });
	}

	static async fetchUserSocialHandles({ userId, address }: { userId: number; address: string }) {
		const queryParams = new URLSearchParams({
			address
		});
		const { url, method } = await this.getRouteConfig({
			route: EApiRoute.GET_USER_SOCIAL_HANDLES,
			routeSegments: [userId.toString(), 'socials'],
			queryParams
		});
		return this.nextApiClientFetch<{ socialHandles: Record<ESocial, ISocialHandle> }>({ url, method });
	}

	static async initSocialVerification({ userId, social, handle, address }: { userId: number; social: ESocial; handle: string; address: string }) {
		const { url, method } = await this.getRouteConfig({ route: EApiRoute.INIT_SOCIAL_VERIFICATION, routeSegments: [userId.toString(), 'socials', 'init-verification'] });
		return this.nextApiClientFetch<ISocialHandle>({ url, method, data: { social, handle, address } });
	}

	static async confirmSocialVerification({ userId, social, token, twitterOauthVerifier }: { userId: number; social: ESocial; token: string; twitterOauthVerifier?: string }) {
		const { url, method } = await this.getRouteConfig({ route: EApiRoute.CONFIRM_SOCIAL_VERIFICATION, routeSegments: [userId.toString(), 'socials', 'confirm-verification'] });
		return this.nextApiClientFetch<{ message: string }>({ url, method, data: { social, token, twitterOauthVerifier } });
	}

	static async judgementCall({ userAddress, identityHash }: { userAddress: string; identityHash: string }) {
		const { url, method } = await this.getRouteConfig({ route: EApiRoute.JUDGEMENT_CALL });
		return this.nextApiClientFetch<{ message: string }>({ url, method, data: { userAddress, identityHash } });
	}

	static async fetchAddressRelations(address: string) {
		const { url, method } = await this.getRouteConfig({ route: EApiRoute.GET_ADDRESS_RELATIONS, routeSegments: [address, 'relations'] });
		return this.nextApiClientFetch<IAddressRelations>({ url, method });
	}

	static async getVoteCurves({ proposalType, indexOrHash }: { proposalType: EProposalType; indexOrHash: string }) {
		const { url, method } = await this.getRouteConfig({ route: EApiRoute.GET_VOTE_CURVES, routeSegments: [proposalType, indexOrHash, 'vote-curves'] });
		return this.nextApiClientFetch<IVoteCurve[]>({ url, method });
	}

	static async getTreasuryStats(params?: { from?: Date; to?: Date }) {
		const queryParams = new URLSearchParams({
			from: params?.from?.toISOString() || '',
			to: params?.to?.toISOString() || ''
		});
		const { url, method } = await this.getRouteConfig({ route: EApiRoute.GET_TREASURY_STATS, queryParams });
		return this.nextApiClientFetch<ITreasuryStats[]>({ url, method });
	}

	static async getTrackAnalyticsStats({ origin }: { origin: EPostOrigin | 'all' }) {
		const { url, method } = await this.getRouteConfig({ route: EApiRoute.GET_TRACK_ANALYTICS, routeSegments: [origin, 'stats'] });
		return this.nextApiClientFetch<ITrackAnalyticsStats>({ url, method });
	}

	static async getTrackAnalyticsDelegations({ origin }: { origin: EPostOrigin | 'all' }) {
		const { url, method } = await this.getRouteConfig({ route: EApiRoute.GET_TRACK_ANALYTICS, routeSegments: [origin, 'delegations'] });
		return this.nextApiClientFetch<ITrackAnalyticsDelegations>({ url, method });
	}

	static async fetchOverviewData(): Promise<{
		allTracks: { data: IGenericListingResponse<IPostListing> | null; error: IErrorResponse | null };
		treasuryStats: { data: ITreasuryStats[] | null; error: IErrorResponse | null };
	}> {
		const currentNetwork = await this.getCurrentNetwork();

		if (this.isServerSide()) {
			const cachedOverviewData = await redisServiceSSR('GetOverviewPageData', {
				network: currentNetwork
			});

			if (cachedOverviewData) {
				return {
					allTracks: {
						data: cachedOverviewData.allTracks,
						error: null
					},
					treasuryStats: {
						data: cachedOverviewData.treasuryStats,
						error: null
					}
				};
			}
		}

		const [allTracksResponse, treasuryStatsResponse] = await Promise.all([
			this.fetchListingData({
				proposalType: EProposalType.REFERENDUM_V2,
				limit: DEFAULT_LISTING_LIMIT,
				page: 1
			}),
			this.getTreasuryStats({
				from: dayjs().subtract(1, 'hour').toDate(),
				to: dayjs().toDate()
			})
		]);

		if (allTracksResponse.data && treasuryStatsResponse.data) {
			await redisServiceSSR('SetOverviewPageData', {
				network: currentNetwork,
				data: {
					allTracks: allTracksResponse.data,
					treasuryStats: treasuryStatsResponse.data
				}
			});
		}

		return {
			allTracks: {
				data: allTracksResponse.data,
				error: allTracksResponse.error
			},
			treasuryStats: {
				data: treasuryStatsResponse.data,
				error: treasuryStatsResponse.error
			}
		};
	}

	static async getUserPosts({ address, page, limit }: { address: string; page: number; limit: number }) {
		const queryParams = new URLSearchParams({
			page: page.toString(),
			limit: limit.toString()
		});
		const { url, method } = await this.getRouteConfig({ route: EApiRoute.GET_USER_POSTS, routeSegments: [address, 'posts'], queryParams });
		return this.nextApiClientFetch<IUserPosts>({ url, method });
	}
}
