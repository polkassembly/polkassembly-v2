// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

// TODO: change types for params eg: network, origin, etc.

import { IS_CACHE_ENABLED, REDIS_URL } from '@api/_api-constants/apiEnvVars';
import { APIError } from '@api/_api-utils/apiError';
import { ERROR_CODES } from '@shared/_constants/errorLiterals';
import { StatusCodes } from 'http-status-codes';
import Redis from 'ioredis';
import {
	ENetwork,
	EProposalStatus,
	EAnalyticsType,
	EPostOrigin,
	EProposalType,
	IContentSummary,
	IDelegateDetails,
	IDelegationStats,
	IGenericListingResponse,
	IPost,
	IPostAnalytics,
	IPostListing,
	EVotesDisplayType,
	IPostBubbleVotes,
	ITrackAnalyticsDelegations,
	ITrackAnalyticsStats,
	ITreasuryStats
} from '@/_shared/types';
import { deepParseJson } from 'deep-parse-json';
import { ACTIVE_PROPOSAL_STATUSES } from '@/_shared/_constants/activeProposalStatuses';
import { createId as createCuid } from '@paralleldrive/cuid2';
import {
	FIVE_MIN,
	HALF_HOUR_IN_SECONDS,
	ONE_DAY_IN_SECONDS,
	REFRESH_TOKEN_LIFE_IN_SECONDS,
	SIX_HOURS_IN_SECONDS,
	THIRTY_DAYS_IN_SECONDS,
	THREE_DAYS_IN_SECONDS
} from '../../_api-constants/timeConstants';

if (!REDIS_URL) {
	throw new APIError(ERROR_CODES.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR, 'REDIS_URL is not set');
}

enum ERedisKeys {
	PASSWORD_RESET_TOKEN = 'PRT',
	EMAIL_VERIFICATION_TOKEN = 'EVT',
	TWO_FACTOR_AUTH_TOKEN = 'TFA',
	SUBSCAN_DATA = 'SDT',
	REFRESH_TOKEN_SET = 'RFTS',
	REFRESH_TOKEN_ITEM = 'RFTI',
	POST_DATA = 'PDT',
	POSTS_LISTING = 'PLT',
	ACTIVITY_FEED = 'AFD',
	QR_SESSION = 'QRS',
	CONTENT_SUMMARY = 'CSM',
	SUBSCRIPTION_FEED = 'SFD',
	DELEGATION_STATS = 'DGS',
	DELEGATE_DETAILS = 'DLD',
	TRACK_ANALYTICS_DELEGATION = 'TAD',
	TRACK_ANALYTICS_STATS = 'TAS',
	TREASURY_STATS = 'TRS',
	OVERVIEW_PAGE_DATA = 'OPD',
	REMARK_LOGIN_MESSAGE = 'RLM',
	POST_ANALYTICS_DATA = 'PAD',
	POST_BUBBLE_VOTES_DATA = 'PBVD'
}

export class RedisService {
	private static readonly client: Redis = (() => {
		const client = new Redis(REDIS_URL, {
			connectTimeout: 20000, // Increase connection timeout to 20 seconds
			maxRetriesPerRequest: 3,
			retryStrategy: (times) => {
				return Math.min(times * 50, 2000);
			},
			reconnectOnError: (err) => err.message.includes('READONLY'),
			keepAlive: 8000
		});

		client.on('error', (err) => {
			console.error('Redis Client Error:', err);
		});

		return client;
	})();

	private static readonly redisKeysMap = {
		[ERedisKeys.PASSWORD_RESET_TOKEN]: (token: string): string => `${ERedisKeys.PASSWORD_RESET_TOKEN}-${token}`,
		[ERedisKeys.EMAIL_VERIFICATION_TOKEN]: (token: string): string => `${ERedisKeys.EMAIL_VERIFICATION_TOKEN}-${token}`,
		[ERedisKeys.TWO_FACTOR_AUTH_TOKEN]: (tfaToken: string): string => `${ERedisKeys.TWO_FACTOR_AUTH_TOKEN}-${tfaToken}`,
		[ERedisKeys.SUBSCAN_DATA]: (network: string, url: string, body?: Record<string, unknown>): string => {
			const bodyPart = body ? `-b:${JSON.stringify(body)}` : '';
			return `${ERedisKeys.SUBSCAN_DATA}-${network}-${url}${bodyPart}`;
		},
		[ERedisKeys.REFRESH_TOKEN_SET]: (userId: number): string => `${ERedisKeys.REFRESH_TOKEN_SET}-${userId}`,
		[ERedisKeys.REFRESH_TOKEN_ITEM]: (userId: number, tokenId: string): string => `${ERedisKeys.REFRESH_TOKEN_ITEM}-${userId}-${tokenId}`,
		[ERedisKeys.POST_DATA]: (network: string, proposalType: EProposalType, indexOrHash: string): string => `${ERedisKeys.POST_DATA}-${network}-${proposalType}-${indexOrHash}`,
		[ERedisKeys.POSTS_LISTING]: (
			network: string,
			proposalType: EProposalType,
			page: number,
			limit: number,
			statuses?: string[],
			origins?: EPostOrigin[],
			tags?: string[]
		): string => {
			const baseKey = `${ERedisKeys.POSTS_LISTING}-${network}-${proposalType}-${page}-${limit}`;
			const statusesPart = statuses?.length ? `-s:${statuses.sort().join(',')}` : '';
			const originsPart = origins?.length ? `-o:${origins.sort().join(',')}` : '';
			const tagsPart = tags?.length ? `-t:${tags.sort().join(',')}` : '';
			return baseKey + statusesPart + originsPart + tagsPart;
		},
		[ERedisKeys.ACTIVITY_FEED]: (network: string, page: number, limit: number, userId?: number, origins?: EPostOrigin[]): string => {
			const baseKey = `${ERedisKeys.ACTIVITY_FEED}-${network}-${page}-${limit}`;
			const userPart = userId ? `-u:${userId}` : '';
			const originsPart = origins?.length ? `-o:${origins.sort().join(',')}` : '';
			return baseKey + userPart + originsPart;
		},
		[ERedisKeys.SUBSCRIPTION_FEED]: (network: string, page: number, limit: number, userId: number): string => {
			return `${ERedisKeys.SUBSCRIPTION_FEED}-${network}-${userId}-${page}-${limit}`;
		},
		[ERedisKeys.QR_SESSION]: (sessionId: string): string => `${ERedisKeys.QR_SESSION}-${sessionId}`,
		[ERedisKeys.CONTENT_SUMMARY]: ({ network, indexOrHash, proposalType }: { network: string; indexOrHash: string; proposalType: EProposalType }): string =>
			`${ERedisKeys.CONTENT_SUMMARY}-${network}-${proposalType}-${indexOrHash}`,
		[ERedisKeys.DELEGATION_STATS]: (network: string): string => `${ERedisKeys.DELEGATION_STATS}-${network}`,
		[ERedisKeys.DELEGATE_DETAILS]: (network: string): string => `${ERedisKeys.DELEGATE_DETAILS}-${network}`,
		[ERedisKeys.TRACK_ANALYTICS_DELEGATION]: (network: string, origin: EPostOrigin | 'all'): string => `${ERedisKeys.TRACK_ANALYTICS_DELEGATION}-${network}-${origin}`,
		[ERedisKeys.TRACK_ANALYTICS_STATS]: (network: string, origin: EPostOrigin | 'all'): string => `${ERedisKeys.TRACK_ANALYTICS_STATS}-${network}-${origin}`,
		[ERedisKeys.TREASURY_STATS]: ({ network, from, to }: { network: string; from: string; to: string }): string => `${ERedisKeys.TREASURY_STATS}-${network}-${from}-${to}`,
		[ERedisKeys.OVERVIEW_PAGE_DATA]: (network: string): string => `${ERedisKeys.OVERVIEW_PAGE_DATA}-${network}`,
		[ERedisKeys.REMARK_LOGIN_MESSAGE]: (address: string): string => `${ERedisKeys.REMARK_LOGIN_MESSAGE}-${address}`,
		[ERedisKeys.POST_ANALYTICS_DATA]: (network: ENetwork, proposalType: EProposalType, index: number): string =>
			`${ERedisKeys.POST_ANALYTICS_DATA}-${network}-${proposalType}-${index}`,
		[ERedisKeys.POST_BUBBLE_VOTES_DATA]: (network: ENetwork, proposalType: EProposalType, index: number, votesType: EVotesDisplayType, analyticsType: EAnalyticsType): string =>
			`${ERedisKeys.POST_BUBBLE_VOTES_DATA}-${network}-${proposalType}-${index}-${votesType}-${analyticsType}`
	} as const;

	// helper methods

	private static async Get({ key, forceCache = false }: { key: string; forceCache?: boolean }): Promise<string | null> {
		if (!IS_CACHE_ENABLED && !forceCache) return null;

		try {
			return this.client.get(key);
		} catch (error) {
			console.error('Error getting key:', error);
			return null;
		}
	}

	private static async Set({ key, value, ttlSeconds, forceCache = false }: { key: string; value: string; ttlSeconds?: number; forceCache?: boolean }): Promise<string | null> {
		if (!IS_CACHE_ENABLED && !forceCache) return null;

		try {
			if (ttlSeconds) {
				return this.client.set(key, value, 'EX', ttlSeconds);
			}

			return this.client.set(key, value);
		} catch (error) {
			console.error('Error setting key:', error);
			return null;
		}
	}

	private static async Delete({ key, forceCache = false }: { key: string; forceCache?: boolean }): Promise<number> {
		if (!IS_CACHE_ENABLED && !forceCache) return 0;

		try {
			return this.client.del(key);
		} catch (error) {
			console.error('Error deleting key:', error);
			return 0;
		}
	}

	private static async DeleteKeys({ pattern, forceCache = false }: { pattern: string; forceCache?: boolean }): Promise<void> {
		if (!IS_CACHE_ENABLED && !forceCache) return Promise.resolve();

		try {
			return new Promise((resolve, reject) => {
				const stream = this.client.scanStream({
					count: 200,
					match: pattern
				});

				let hasError = false;

				stream.on('data', async (keys) => {
					if (keys.length && !hasError) {
						try {
							const pipeline = this.client.pipeline();
							// eslint-disable-next-line @typescript-eslint/no-explicit-any
							keys.forEach((key: any) => {
								pipeline.del(key);
							});
							await pipeline.exec();
						} catch (error) {
							hasError = true;
							console.error('Error deleting keys:', error);
							reject(error);
						}
					}
				});

				stream.on('end', () => {
					if (!hasError) {
						console.log(`All keys matching pattern ${pattern} deleted.`);
						resolve();
					}
				});

				stream.on('error', (error) => {
					hasError = true;
					console.error('Stream error:', error);
					reject(error);
				});
			});
		} catch (error) {
			console.error('Error deleting keys:', error);
			return Promise.reject(error);
		}
	}

	private static async AddToSet({ key, value, forceCache = false }: { key: string; value: string; forceCache?: boolean }): Promise<number> {
		if (!IS_CACHE_ENABLED && !forceCache) return 0;

		try {
			return this.client.sadd(key, value);
		} catch (error) {
			console.error('Error adding to set:', error);
			return 0;
		}
	}

	private static async RemoveFromSet({ key, value, forceCache = false }: { key: string; value: string; forceCache?: boolean }): Promise<number> {
		if (!IS_CACHE_ENABLED && !forceCache) return 0;

		try {
			return this.client.srem(key, value);
		} catch (error) {
			console.error('Error removing from set:', error);
			return 0;
		}
	}

	private static async GetSetMembers({ key, forceCache = false }: { key: string; forceCache?: boolean }): Promise<string[]> {
		if (!IS_CACHE_ENABLED && !forceCache) return [];

		try {
			return this.client.smembers(key);
		} catch (error) {
			console.error('Error getting set members:', error);
			return [];
		}
	}

	static async DeleteAllCacheForNetwork(network: ENetwork): Promise<void> {
		await Promise.all([
			this.DeleteKeys({ pattern: `${ERedisKeys.SUBSCAN_DATA}-${network}-*` }),
			this.DeleteKeys({ pattern: `${ERedisKeys.POST_DATA}-${network}-*` }),
			this.DeleteKeys({ pattern: `${ERedisKeys.POSTS_LISTING}-${network}-*` }),
			this.DeleteKeys({ pattern: `${ERedisKeys.ACTIVITY_FEED}-${network}-*` }),
			this.DeleteKeys({ pattern: `${ERedisKeys.SUBSCRIPTION_FEED}-${network}-*` }),
			this.DeleteKeys({ pattern: `${ERedisKeys.CONTENT_SUMMARY}-${network}-*` }),
			this.DeleteKeys({ pattern: `${ERedisKeys.DELEGATION_STATS}-${network}-*` }),
			this.DeleteKeys({ pattern: `${ERedisKeys.DELEGATE_DETAILS}-${network}-*` }),
			this.DeleteKeys({ pattern: `${ERedisKeys.TRACK_ANALYTICS_DELEGATION}-${network}-*` }),
			this.DeleteKeys({ pattern: `${ERedisKeys.TRACK_ANALYTICS_STATS}-${network}-*` }),
			this.DeleteKeys({ pattern: `${ERedisKeys.TREASURY_STATS}-${network}-*` }),
			this.DeleteKeys({ pattern: `${ERedisKeys.OVERVIEW_PAGE_DATA}-${network}` }),
			this.DeleteKeys({ pattern: `${ERedisKeys.POST_ANALYTICS_DATA}-${network}-*` }),
			this.DeleteKeys({ pattern: `${ERedisKeys.POST_BUBBLE_VOTES_DATA}-${network}-*` })
		]);
	}

	// auth and third party methods
	static async SetEmailVerificationToken({ token, email }: { token: string; email: string }): Promise<void> {
		await this.Set({ key: this.redisKeysMap[ERedisKeys.EMAIL_VERIFICATION_TOKEN](token), value: email, ttlSeconds: ONE_DAY_IN_SECONDS, forceCache: true });
	}

	static async SetRefreshToken({ userId, refreshToken }: { userId: number; refreshToken: string }): Promise<void> {
		const tokenId = createCuid();

		// Store the token with its unique ID
		await this.Set({
			key: this.redisKeysMap[ERedisKeys.REFRESH_TOKEN_ITEM](userId, tokenId),
			value: refreshToken,
			ttlSeconds: REFRESH_TOKEN_LIFE_IN_SECONDS,
			forceCache: true
		});

		// Add the token ID to the user's set of tokens
		await this.AddToSet({
			key: this.redisKeysMap[ERedisKeys.REFRESH_TOKEN_SET](userId),
			value: tokenId,
			forceCache: true
		});
	}

	static async GetRefreshToken(userId: number, tokenId: string): Promise<string | null> {
		// Get a specific token by ID
		return this.Get({
			key: this.redisKeysMap[ERedisKeys.REFRESH_TOKEN_ITEM](userId, tokenId),
			forceCache: true
		});
	}

	static async GetAllRefreshTokenIds(userId: number): Promise<string[]> {
		return this.GetSetMembers({
			key: this.redisKeysMap[ERedisKeys.REFRESH_TOKEN_SET](userId),
			forceCache: true
		});
	}

	static async DeleteRefreshToken(userId: number, tokenId: string): Promise<void> {
		// Delete the specific token
		await this.Delete({
			key: this.redisKeysMap[ERedisKeys.REFRESH_TOKEN_ITEM](userId, tokenId),
			forceCache: true
		});

		// Remove the token ID from the user's set
		await this.RemoveFromSet({
			key: this.redisKeysMap[ERedisKeys.REFRESH_TOKEN_SET](userId),
			value: tokenId,
			forceCache: true
		});
	}

	static async DeleteAllRefreshTokens(userId: number): Promise<void> {
		// Get all token IDs for this user
		const tokenIds = await this.GetAllRefreshTokenIds(userId);

		// Delete each token
		await Promise.all(
			tokenIds.map((tokenId) =>
				this.Delete({
					key: this.redisKeysMap[ERedisKeys.REFRESH_TOKEN_ITEM](userId, tokenId),
					forceCache: true
				})
			)
		);

		// Delete the set itself
		await this.Delete({ key: this.redisKeysMap[ERedisKeys.REFRESH_TOKEN_SET](userId), forceCache: true });
	}

	static async SetTfaToken({ tfaToken, userId }: { tfaToken: string; userId: number }): Promise<void> {
		await this.Set({ key: this.redisKeysMap[ERedisKeys.TWO_FACTOR_AUTH_TOKEN](tfaToken), value: userId.toString(), ttlSeconds: FIVE_MIN, forceCache: true });
	}

	static async GetTfaToken(tfaToken: string): Promise<string | null> {
		return this.Get({ key: this.redisKeysMap[ERedisKeys.TWO_FACTOR_AUTH_TOKEN](tfaToken), forceCache: true });
	}

	static async GetSubscanData({ network, url, body }: { network: string; url: string; body?: Record<string, unknown> }): Promise<string | null> {
		return this.Get({ key: this.redisKeysMap[ERedisKeys.SUBSCAN_DATA](network, url, body) });
	}

	static async SetSubscanData({ network, url, body, data }: { network: string; url: string; body?: Record<string, unknown>; data: string }): Promise<void> {
		await this.Set({ key: this.redisKeysMap[ERedisKeys.SUBSCAN_DATA](network, url, body), value: data, ttlSeconds: SIX_HOURS_IN_SECONDS });
	}

	static async SetResetPasswordToken({ token, userId }: { token: string; userId: number }): Promise<void> {
		await this.Set({ key: this.redisKeysMap[ERedisKeys.PASSWORD_RESET_TOKEN](token), value: userId.toString(), ttlSeconds: ONE_DAY_IN_SECONDS, forceCache: true });
	}

	static async GetUserIdFromResetPasswordToken(token: string): Promise<number | null> {
		const userId = await this.Get({ key: this.redisKeysMap[ERedisKeys.PASSWORD_RESET_TOKEN](token), forceCache: true });
		return userId ? Number(userId) : null;
	}

	static async DeleteResetPasswordToken(token: string): Promise<void> {
		await this.Delete({ key: this.redisKeysMap[ERedisKeys.PASSWORD_RESET_TOKEN](token), forceCache: true });
	}

	// Posts caching methods
	static async GetPostData({ network, proposalType, indexOrHash }: { network: string; proposalType: EProposalType; indexOrHash: string }): Promise<IPost | null> {
		const data = await this.Get({ key: this.redisKeysMap[ERedisKeys.POST_DATA](network, proposalType, indexOrHash) });
		return data ? (deepParseJson(data) as IPost) : null;
	}

	static async SetPostData({ network, proposalType, indexOrHash, data }: { network: string; proposalType: EProposalType; indexOrHash: string; data: IPost }): Promise<void> {
		const isActivePost = data.onChainInfo?.status && ACTIVE_PROPOSAL_STATUSES.includes(data.onChainInfo?.status);

		await this.Set({
			key: this.redisKeysMap[ERedisKeys.POST_DATA](network, proposalType, indexOrHash),
			value: JSON.stringify(data),
			ttlSeconds: isActivePost ? ONE_DAY_IN_SECONDS : THIRTY_DAYS_IN_SECONDS
		});
	}

	static async DeletePostData({ network, proposalType, indexOrHash }: { network: string; proposalType: EProposalType; indexOrHash: string }): Promise<void> {
		await this.Delete({ key: this.redisKeysMap[ERedisKeys.POST_DATA](network, proposalType, indexOrHash) });
	}

	static async GetPostsListing({
		network,
		proposalType,
		page,
		limit,
		statuses,
		origins,
		tags
	}: {
		network: string;
		proposalType: EProposalType;
		page: number;
		limit: number;
		statuses?: string[];
		origins?: EPostOrigin[];
		tags?: string[];
	}): Promise<IGenericListingResponse<IPostListing> | null> {
		const data = await this.Get({ key: this.redisKeysMap[ERedisKeys.POSTS_LISTING](network, proposalType, page, limit, statuses, origins, tags) });
		return data ? (deepParseJson(data) as IGenericListingResponse<IPostListing>) : null;
	}

	static async SetPostsListing({
		network,
		proposalType,
		page,
		limit,
		data,
		statuses,
		origins,
		tags
	}: {
		network: string;
		proposalType: EProposalType;
		page: number;
		limit: number;
		data: IGenericListingResponse<IPostListing>;
		statuses?: string[];
		origins?: EPostOrigin[];
		tags?: string[];
	}): Promise<void> {
		await this.Set({
			key: this.redisKeysMap[ERedisKeys.POSTS_LISTING](network, proposalType, page, limit, statuses, origins, tags),
			value: JSON.stringify(data),
			ttlSeconds: THREE_DAYS_IN_SECONDS
		});
	}

	static async DeletePostsListing({ network, proposalType }: { network: string; proposalType: EProposalType }): Promise<void> {
		await this.DeleteKeys({ pattern: `${ERedisKeys.POSTS_LISTING}-${network}-${proposalType}-*` });
	}

	static async GetContentSummary({ network, indexOrHash, proposalType }: { network: string; indexOrHash: string; proposalType: EProposalType }): Promise<IContentSummary | null> {
		const data = await this.Get({ key: this.redisKeysMap[ERedisKeys.CONTENT_SUMMARY]({ network, indexOrHash, proposalType }) });
		return data ? (deepParseJson(data) as IContentSummary) : null;
	}

	static async SetContentSummary({
		network,
		indexOrHash,
		proposalType,
		data
	}: {
		network: string;
		indexOrHash: string;
		proposalType: EProposalType;
		data: IContentSummary;
	}): Promise<void> {
		await this.Set({ key: this.redisKeysMap[ERedisKeys.CONTENT_SUMMARY]({ network, indexOrHash, proposalType }), value: JSON.stringify(data), ttlSeconds: ONE_DAY_IN_SECONDS });
	}

	static async DeleteContentSummary({ network, indexOrHash, proposalType }: { network: string; indexOrHash: string; proposalType: EProposalType }): Promise<void> {
		await this.DeleteKeys({ pattern: this.redisKeysMap[ERedisKeys.CONTENT_SUMMARY]({ network, indexOrHash, proposalType }) });
	}

	// Activity feed caching methods
	static async GetActivityFeed({
		network,
		page,
		limit,
		userId,
		origins
	}: {
		network: string;
		page: number;
		limit: number;
		userId?: number;
		origins?: EPostOrigin[];
	}): Promise<IGenericListingResponse<IPostListing> | null> {
		const data = await this.Get({ key: this.redisKeysMap[ERedisKeys.ACTIVITY_FEED](network, page, limit, userId, origins) });
		return data ? (deepParseJson(data) as IGenericListingResponse<IPostListing>) : null;
	}

	static async SetActivityFeed({
		network,
		page,
		limit,
		data,
		userId,
		origins
	}: {
		network: string;
		page: number;
		limit: number;
		data: IGenericListingResponse<IPostListing>;
		userId?: number;
		origins?: EPostOrigin[];
	}): Promise<void> {
		await this.Set({ key: this.redisKeysMap[ERedisKeys.ACTIVITY_FEED](network, page, limit, userId, origins), value: JSON.stringify(data), ttlSeconds: ONE_DAY_IN_SECONDS });
	}

	static async DeleteActivityFeed({ network }: { network: string }): Promise<void> {
		await this.DeleteKeys({ pattern: `${ERedisKeys.ACTIVITY_FEED}-${network}-*` });
	}

	// Subscription feed caching methods
	static async GetSubscriptionFeed({
		network,
		page,
		limit,
		userId
	}: {
		network: string;
		page: number;
		limit: number;
		userId: number;
	}): Promise<IGenericListingResponse<IPostListing> | null> {
		const data = await this.Get({ key: this.redisKeysMap[ERedisKeys.SUBSCRIPTION_FEED](network, page, limit, userId) });
		return data ? (deepParseJson(data) as IGenericListingResponse<IPostListing>) : null;
	}

	static async SetSubscriptionFeed({
		network,
		page,
		limit,
		data,
		userId
	}: {
		network: string;
		page: number;
		limit: number;
		data: IGenericListingResponse<IPostListing>;
		userId: number;
	}): Promise<void> {
		await this.Set({ key: this.redisKeysMap[ERedisKeys.SUBSCRIPTION_FEED](network, page, limit, userId), value: JSON.stringify(data), ttlSeconds: ONE_DAY_IN_SECONDS });
	}

	static async DeleteSubscriptionFeed({ network, userId }: { network: string; userId: number }): Promise<void> {
		await this.DeleteKeys({ pattern: `${ERedisKeys.SUBSCRIPTION_FEED}-${network}-${userId}-*` });
	}

	static async DeleteAllSubscriptionFeedsForNetwork(network: ENetwork): Promise<void> {
		await this.DeleteKeys({ pattern: `${ERedisKeys.SUBSCRIPTION_FEED}-${network}-*` });
	}

	// toolkit methods

	static async ClearCacheForAllPostsForNetwork(network: ENetwork): Promise<void> {
		await Promise.all([
			// clear everything posts related
			this.DeleteKeys({ pattern: `${ERedisKeys.POSTS_LISTING}-${network}-*` }),
			this.DeleteKeys({ pattern: `${ERedisKeys.POST_DATA}-${network}-*` }),
			this.DeleteKeys({ pattern: `${ERedisKeys.ACTIVITY_FEED}-${network}-*` }),
			this.DeleteKeys({ pattern: `${ERedisKeys.CONTENT_SUMMARY}-${network}-*` }),
			this.DeleteKeys({ pattern: `${ERedisKeys.SUBSCRIPTION_FEED}-${network}-*` }),

			// clear post analytics data
			this.DeleteKeys({ pattern: `${ERedisKeys.POST_ANALYTICS_DATA}-${network}-*` }),
			this.DeleteKeys({ pattern: `${ERedisKeys.POST_BUBBLE_VOTES_DATA}-${network}-*` }),

			// clear overview page data
			this.DeleteOverviewPageData({ network }),

			// clear treasury stats
			this.DeleteKeys({ pattern: `${ERedisKeys.TREASURY_STATS}-${network}-*` })
		]);
	}

	// QR session caching methods

	static async SetQRSession(sessionId: string, data: { userId: number; timestamp: number; expiresIn: number }): Promise<void> {
		await this.Set({ key: this.redisKeysMap[ERedisKeys.QR_SESSION](sessionId), value: JSON.stringify(data), ttlSeconds: data.expiresIn, forceCache: true });
	}

	static async GetQRSession(sessionId: string): Promise<{ userId: number; timestamp: number; expiresIn: number } | null> {
		const data = await this.Get({ key: this.redisKeysMap[ERedisKeys.QR_SESSION](sessionId), forceCache: true });
		return data ? JSON.parse(data) : null;
	}

	static async DeleteQRSession(sessionId: string): Promise<void> {
		await this.Delete({ key: this.redisKeysMap[ERedisKeys.QR_SESSION](sessionId), forceCache: true });
	}

	// Delegation stats caching methods
	static async GetDelegationStats(network: ENetwork): Promise<IDelegationStats | null> {
		const data = await this.Get({ key: this.redisKeysMap[ERedisKeys.DELEGATION_STATS](network) });
		return data ? (deepParseJson(data) as IDelegationStats) : null;
	}

	static async SetDelegationStats(network: ENetwork, data: IDelegationStats): Promise<void> {
		await this.Set({ key: this.redisKeysMap[ERedisKeys.DELEGATION_STATS](network), value: JSON.stringify(data), ttlSeconds: ONE_DAY_IN_SECONDS });
	}

	static async DeleteDelegationStats(network: ENetwork): Promise<void> {
		await this.DeleteKeys({ pattern: `${ERedisKeys.DELEGATION_STATS}-${network}` });
	}

	// Delegates caching methods
	static async GetDelegateDetails(network: ENetwork): Promise<IDelegateDetails[] | null> {
		const data = await this.Get({ key: this.redisKeysMap[ERedisKeys.DELEGATE_DETAILS](network) });
		return data ? (deepParseJson(data) as IDelegateDetails[]) : null;
	}

	static async SetDelegateDetails(network: ENetwork, data: IDelegateDetails[]): Promise<void> {
		await this.Set({ key: this.redisKeysMap[ERedisKeys.DELEGATE_DETAILS](network), value: JSON.stringify(data), ttlSeconds: ONE_DAY_IN_SECONDS });
	}

	static async DeleteDelegateDetails(network: ENetwork): Promise<void> {
		await this.DeleteKeys({ pattern: `${ERedisKeys.DELEGATE_DETAILS}-${network}` });
	}

	// Track analytics delegation caching methods
	static async GetTrackAnalyticsDelegation({ network, origin }: { network: string; origin: EPostOrigin | 'all' }): Promise<ITrackAnalyticsDelegations | null> {
		const data = await this.Get({ key: this.redisKeysMap[ERedisKeys.TRACK_ANALYTICS_DELEGATION](network, origin) });
		return data ? (deepParseJson(data) as ITrackAnalyticsDelegations) : null;
	}

	static async SetTrackAnalyticsDelegation({ network, origin, data }: { network: string; origin: EPostOrigin | 'all'; data: ITrackAnalyticsDelegations }): Promise<void> {
		await this.Set({
			key: this.redisKeysMap[ERedisKeys.TRACK_ANALYTICS_DELEGATION](network, origin),
			value: JSON.stringify(data),
			ttlSeconds: ONE_DAY_IN_SECONDS
		});
	}

	static async DeleteTrackAnalyticsDelegation({ network, origin }: { network: string; origin: EPostOrigin | 'all' }): Promise<void> {
		await this.Delete({ key: this.redisKeysMap[ERedisKeys.TRACK_ANALYTICS_DELEGATION](network, origin) });
	}

	// Track analytics stats caching methods
	static async GetTrackAnalyticsStats({ network, origin }: { network: string; origin: EPostOrigin | 'all' }): Promise<ITrackAnalyticsStats | null> {
		const data = await this.Get({ key: this.redisKeysMap[ERedisKeys.TRACK_ANALYTICS_STATS](network, origin) });
		return data ? (deepParseJson(data) as ITrackAnalyticsStats) : null;
	}

	static async SetTrackAnalyticsStats({ network, origin, data }: { network: string; origin: EPostOrigin | 'all'; data: ITrackAnalyticsStats }): Promise<void> {
		await this.Set({ key: this.redisKeysMap[ERedisKeys.TRACK_ANALYTICS_STATS](network, origin), value: JSON.stringify(data), ttlSeconds: ONE_DAY_IN_SECONDS });
	}

	static async DeleteTrackAnalyticsStats({ network, origin }: { network: string; origin: EPostOrigin | 'all' }): Promise<void> {
		await this.Delete({ key: this.redisKeysMap[ERedisKeys.TRACK_ANALYTICS_STATS](network, origin) });
	}

	// Treasury stats caching methods
	static async GetTreasuryStats({ network, from, to }: { network: ENetwork; from: string; to: string }): Promise<ITreasuryStats[] | null> {
		const data = await this.Get({ key: this.redisKeysMap[ERedisKeys.TREASURY_STATS]({ network, from, to }) });
		return data ? (deepParseJson(data) as ITreasuryStats[]) : null;
	}

	static async SetTreasuryStats({ network, from, to, data }: { network: ENetwork; from: string; to: string; data?: ITreasuryStats[] }): Promise<void> {
		await this.Set({ key: this.redisKeysMap[ERedisKeys.TREASURY_STATS]({ network, from, to }), value: JSON.stringify(data), ttlSeconds: HALF_HOUR_IN_SECONDS });
	}

	static async DeleteTreasuryStats({ network, from, to }: { network: ENetwork; from: string; to: string }): Promise<void> {
		await this.Delete({ key: this.redisKeysMap[ERedisKeys.TREASURY_STATS]({ network, from, to }) });
	}

	// Overview page caching methods
	static async GetOverviewPageData({ network }: { network: ENetwork }): Promise<{ allTracks: IGenericListingResponse<IPostListing>; treasuryStats: ITreasuryStats[] } | null> {
		const data = await this.Get({ key: this.redisKeysMap[ERedisKeys.OVERVIEW_PAGE_DATA](network) });
		return data ? (deepParseJson(data) as { allTracks: IGenericListingResponse<IPostListing>; treasuryStats: ITreasuryStats[] }) : null;
	}

	static async SetOverviewPageData({
		network,
		data
	}: {
		network: ENetwork;
		data: { allTracks: IGenericListingResponse<IPostListing>; treasuryStats: ITreasuryStats[] };
	}): Promise<void> {
		await this.Set({ key: this.redisKeysMap[ERedisKeys.OVERVIEW_PAGE_DATA](network), value: JSON.stringify(data), ttlSeconds: HALF_HOUR_IN_SECONDS });
	}

	static async DeleteOverviewPageData({ network }: { network: ENetwork }): Promise<void> {
		await this.Delete({ key: this.redisKeysMap[ERedisKeys.OVERVIEW_PAGE_DATA](network) });
	}

	// Remark login message caching methods
	static async SetRemarkLoginMessage({ address, message }: { address: string; message: string }): Promise<void> {
		await this.Set({ key: this.redisKeysMap[ERedisKeys.REMARK_LOGIN_MESSAGE](address), value: message, ttlSeconds: FIVE_MIN, forceCache: true });
	}

	static async GetRemarkLoginMessage(address: string): Promise<string | null> {
		return this.Get({ key: this.redisKeysMap[ERedisKeys.REMARK_LOGIN_MESSAGE](address), forceCache: true });
	}

	static async DeleteRemarkLoginMessage(address: string): Promise<void> {
		await this.Delete({ key: this.redisKeysMap[ERedisKeys.REMARK_LOGIN_MESSAGE](address), forceCache: true });
	}

	static async SetPostAnalyticsData({
		network,
		proposalType,
		index,
		data,
		proposalStatus
	}: {
		network: ENetwork;
		proposalType: EProposalType;
		index: number;
		data: IPostAnalytics;
		proposalStatus: EProposalStatus;
	}): Promise<void> {
		const isActivePost = ACTIVE_PROPOSAL_STATUSES.includes(proposalStatus);

		await this.Set({
			key: this.redisKeysMap[ERedisKeys.POST_ANALYTICS_DATA](network, proposalType, index),
			value: JSON.stringify(data),
			ttlSeconds: isActivePost ? ONE_DAY_IN_SECONDS : THIRTY_DAYS_IN_SECONDS
		});
	}

	static async GetPostAnalyticsData({ network, proposalType, index }: { network: ENetwork; proposalType: EProposalType; index: number }): Promise<IPostAnalytics | null> {
		const data = await this.Get({ key: this.redisKeysMap[ERedisKeys.POST_ANALYTICS_DATA](network, proposalType, index) });
		return data ? (deepParseJson(data) as IPostAnalytics) : null;
	}

	static async DeletePostAnalyticsData({ network, proposalType, index }: { network: ENetwork; proposalType: EProposalType; index: number }): Promise<void> {
		await this.Delete({ key: this.redisKeysMap[ERedisKeys.POST_ANALYTICS_DATA](network, proposalType, index) });
	}

	static async SetPostBubbleVotesData({
		network,
		proposalType,
		index,
		data,
		votesType,
		analyticsType,
		proposalStatus
	}: {
		network: ENetwork;
		proposalType: EProposalType;
		index: number;
		data: IPostBubbleVotes;
		votesType: EVotesDisplayType;
		analyticsType: EAnalyticsType;
		proposalStatus: EProposalStatus;
	}): Promise<void> {
		const isActivePost = ACTIVE_PROPOSAL_STATUSES.includes(proposalStatus);
		await this.Set({
			key: this.redisKeysMap[ERedisKeys.POST_BUBBLE_VOTES_DATA](network, proposalType, index, votesType, analyticsType),
			value: JSON.stringify(data),
			ttlSeconds: isActivePost ? ONE_DAY_IN_SECONDS : THIRTY_DAYS_IN_SECONDS
		});
	}

	static async GetPostBubbleVotesData({
		network,
		proposalType,
		index,
		votesType,
		analyticsType
	}: {
		network: ENetwork;
		proposalType: EProposalType;
		index: number;
		votesType: EVotesDisplayType;
		analyticsType: EAnalyticsType;
	}): Promise<IPostBubbleVotes | null> {
		const data = await this.Get({ key: this.redisKeysMap[ERedisKeys.POST_BUBBLE_VOTES_DATA](network, proposalType, index, votesType, analyticsType) });
		return data ? (deepParseJson(data) as IPostBubbleVotes) : null;
	}

	static async DeletePostBubbleVotesData({
		network,
		proposalType,
		index,
		votesType,
		analyticsType
	}: {
		network: ENetwork;
		proposalType: EProposalType;
		index: number;
		votesType: EVotesDisplayType;
		analyticsType: EAnalyticsType;
	}): Promise<void> {
		await this.Delete({ key: this.redisKeysMap[ERedisKeys.POST_BUBBLE_VOTES_DATA](network, proposalType, index, votesType, analyticsType) });
	}
}
