// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { IS_CACHE_ENABLED, REDIS_URL } from '@api/_api-constants/apiEnvVars';
import { APIError } from '@api/_api-utils/apiError';
import { ERROR_CODES } from '@shared/_constants/errorLiterals';
import { StatusCodes } from 'http-status-codes';
import Redis from 'ioredis';
import { ENetwork, IGenericListingResponse, IPost, IPostListing } from '@/_shared/types';
import { deepParseJson } from 'deep-parse-json';
import { ACTIVE_PROPOSAL_STATUSES } from '@/_shared/_constants/activeProposalStatuses';
import { FIVE_MIN, ONE_DAY, ONE_HOUR_IN_SECONDS, REFRESH_TOKEN_LIFE_IN_SECONDS, SIX_HOURS_IN_SECONDS } from '../../_api-constants/timeConstants';

if (!REDIS_URL) {
	throw new APIError(ERROR_CODES.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR, 'REDIS_URL is not set');
}

enum ERedisKeys {
	PASSWORD_RESET_TOKEN = 'PRT',
	EMAIL_VERIFICATION_TOKEN = 'EVT',
	TWO_FACTOR_AUTH_TOKEN = 'TFA',
	SUBSCAN_DATA = 'SDT',
	REFRESH_TOKEN = 'RFT',
	POST_DATA = 'PDT',
	POSTS_LISTING = 'PLT',
	ACTIVITY_FEED = 'AFD',
	QR_SESSION = 'QRS',
	CONTENT_SUMMARY = 'CSM'
}

export class RedisService {
	private static readonly client: Redis = new Redis(REDIS_URL);

	private static readonly redisKeysMap = {
		[ERedisKeys.PASSWORD_RESET_TOKEN]: (token: string): string => `${ERedisKeys.PASSWORD_RESET_TOKEN}-${token}`,
		[ERedisKeys.EMAIL_VERIFICATION_TOKEN]: (token: string): string => `${ERedisKeys.EMAIL_VERIFICATION_TOKEN}-${token}`,
		[ERedisKeys.TWO_FACTOR_AUTH_TOKEN]: (tfaToken: string): string => `${ERedisKeys.TWO_FACTOR_AUTH_TOKEN}-${tfaToken}`,
		[ERedisKeys.SUBSCAN_DATA]: (network: string, url: string): string => `${ERedisKeys.SUBSCAN_DATA}-${network}-${url}`,
		[ERedisKeys.REFRESH_TOKEN]: (userId: number): string => `${ERedisKeys.REFRESH_TOKEN}-${userId}`,
		[ERedisKeys.POST_DATA]: (network: string, proposalType: string, indexOrHash: string): string => `${ERedisKeys.POST_DATA}-${network}-${proposalType}-${indexOrHash}`,
		[ERedisKeys.POSTS_LISTING]: (network: string, proposalType: string, page: number, limit: number, statuses?: string[], origins?: string[], tags?: string[]): string => {
			const baseKey = `${ERedisKeys.POSTS_LISTING}-${network}-${proposalType}-${page}-${limit}`;
			const statusesPart = statuses?.length ? `-s:${statuses.sort().join(',')}` : '';
			const originsPart = origins?.length ? `-o:${origins.sort().join(',')}` : '';
			const tagsPart = tags?.length ? `-t:${tags.sort().join(',')}` : '';
			return baseKey + statusesPart + originsPart + tagsPart;
		},
		[ERedisKeys.ACTIVITY_FEED]: (network: string, page: number, limit: number, userId?: number, origins?: string[]): string => {
			const baseKey = `${ERedisKeys.ACTIVITY_FEED}-${network}-${page}-${limit}`;
			const userPart = userId ? `-u:${userId}` : '';
			const originsPart = origins?.length ? `-o:${origins.sort().join(',')}` : '';
			return baseKey + userPart + originsPart;
		},
		[ERedisKeys.QR_SESSION]: (sessionId: string): string => `${ERedisKeys.QR_SESSION}-${sessionId}`,
		[ERedisKeys.CONTENT_SUMMARY]: (network: string, indexOrHash: string, proposalType: string): string => `${ERedisKeys.CONTENT_SUMMARY}-${network}-${indexOrHash}-${proposalType}`
	} as const;

	// helper methods

	private static async Get({ key, forceCache = false }: { key: string; forceCache?: boolean }): Promise<string | null> {
		if (!IS_CACHE_ENABLED && !forceCache) return null;
		return this.client.get(key);
	}

	private static async Set({ key, value, ttlSeconds, forceCache = false }: { key: string; value: string; ttlSeconds?: number; forceCache?: boolean }): Promise<string | null> {
		if (!IS_CACHE_ENABLED && !forceCache) return null;

		if (ttlSeconds) {
			return this.client.set(key, value, 'EX', ttlSeconds);
		}

		return this.client.set(key, value);
	}

	private static async Delete({ key, forceCache = false }: { key: string; forceCache?: boolean }): Promise<number> {
		if (!IS_CACHE_ENABLED && !forceCache) return 0;

		return this.client.del(key);
	}

	private static async DeleteKeys({ pattern, forceCache = false }: { pattern: string; forceCache?: boolean }): Promise<void> {
		if (!IS_CACHE_ENABLED && !forceCache) return;

		const stream = this.client.scanStream({
			count: 200,
			match: pattern
		});

		stream.on('data', async (keys) => {
			if (keys.length) {
				const pipeline = this.client.pipeline();
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				keys.forEach((key: any) => {
					pipeline.del(key);
				});
				await pipeline.exec();
			}
		});

		stream.on('end', () => {
			console.log('All keys matching pattern deleted.');
		});
	}

	// auth and third party methods
	static async SetEmailVerificationToken({ token, email }: { token: string; email: string }): Promise<void> {
		await this.Set({ key: this.redisKeysMap[ERedisKeys.EMAIL_VERIFICATION_TOKEN](token), value: email, ttlSeconds: ONE_DAY, forceCache: true });
	}

	static async SetRefreshToken({ userId, refreshToken }: { userId: number; refreshToken: string }): Promise<void> {
		await this.Set({ key: this.redisKeysMap[ERedisKeys.REFRESH_TOKEN](userId), value: refreshToken, ttlSeconds: REFRESH_TOKEN_LIFE_IN_SECONDS, forceCache: true });
	}

	static async GetRefreshToken(userId: number): Promise<string | null> {
		return this.Get({ key: this.redisKeysMap[ERedisKeys.REFRESH_TOKEN](userId), forceCache: true });
	}

	static async DeleteRefreshToken(userId: number): Promise<void> {
		await this.Delete({ key: this.redisKeysMap[ERedisKeys.REFRESH_TOKEN](userId), forceCache: true });
	}

	static async SetTfaToken({ tfaToken, userId }: { tfaToken: string; userId: number }): Promise<void> {
		await this.Set({ key: this.redisKeysMap[ERedisKeys.TWO_FACTOR_AUTH_TOKEN](tfaToken), value: userId.toString(), ttlSeconds: FIVE_MIN, forceCache: true });
	}

	static async GetTfaToken(tfaToken: string): Promise<string | null> {
		return this.Get({ key: this.redisKeysMap[ERedisKeys.TWO_FACTOR_AUTH_TOKEN](tfaToken), forceCache: true });
	}

	static async GetSubscanData({ network, url }: { network: string; url: string }): Promise<string | null> {
		return this.Get({ key: this.redisKeysMap[ERedisKeys.SUBSCAN_DATA](network, url) });
	}

	static async SetSubscanData({ network, url, data }: { network: string; url: string; data: string }): Promise<void> {
		await this.Set({ key: this.redisKeysMap[ERedisKeys.SUBSCAN_DATA](network, url), value: data, ttlSeconds: SIX_HOURS_IN_SECONDS });
	}

	static async SetResetPasswordToken({ token, userId }: { token: string; userId: number }): Promise<void> {
		await this.Set({ key: this.redisKeysMap[ERedisKeys.PASSWORD_RESET_TOKEN](token), value: userId.toString(), ttlSeconds: ONE_DAY, forceCache: true });
	}

	static async GetUserIdFromResetPasswordToken(token: string): Promise<number | null> {
		const userId = await this.Get({ key: this.redisKeysMap[ERedisKeys.PASSWORD_RESET_TOKEN](token), forceCache: true });
		return userId ? Number(userId) : null;
	}

	static async DeleteResetPasswordToken(token: string): Promise<void> {
		await this.Delete({ key: this.redisKeysMap[ERedisKeys.PASSWORD_RESET_TOKEN](token), forceCache: true });
	}

	// Posts caching methods
	static async GetPostData({ network, proposalType, indexOrHash }: { network: string; proposalType: string; indexOrHash: string }): Promise<IPost | null> {
		const data = await this.Get({ key: this.redisKeysMap[ERedisKeys.POST_DATA](network, proposalType, indexOrHash) });
		return data ? (deepParseJson(data) as IPost) : null;
	}

	static async SetPostData({ network, proposalType, indexOrHash, data }: { network: string; proposalType: string; indexOrHash: string; data: IPost }): Promise<void> {
		await this.Set({
			key: this.redisKeysMap[ERedisKeys.POST_DATA](network, proposalType, indexOrHash),
			value: JSON.stringify(data),
			ttlSeconds: data.onChainInfo?.status && ACTIVE_PROPOSAL_STATUSES.includes(data.onChainInfo?.status) ? ONE_HOUR_IN_SECONDS : ONE_DAY
		});
	}

	static async DeletePostData({ network, proposalType, indexOrHash }: { network: string; proposalType: string; indexOrHash: string }): Promise<void> {
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
		proposalType: string;
		page: number;
		limit: number;
		statuses?: string[];
		origins?: string[];
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
		proposalType: string;
		page: number;
		limit: number;
		data: IGenericListingResponse<IPostListing>;
		statuses?: string[];
		origins?: string[];
		tags?: string[];
	}): Promise<void> {
		await this.Set({
			key: this.redisKeysMap[ERedisKeys.POSTS_LISTING](network, proposalType, page, limit, statuses, origins, tags),
			value: JSON.stringify(data),
			ttlSeconds: SIX_HOURS_IN_SECONDS
		});
	}

	static async DeletePostsListing({ network, proposalType }: { network: string; proposalType: string }): Promise<void> {
		await this.DeleteKeys({ pattern: `${ERedisKeys.POSTS_LISTING}-${network}-${proposalType}-*` });
	}

	static async GetContentSummary({ network, indexOrHash, proposalType }: { network: string; indexOrHash: string; proposalType: string }): Promise<string | null> {
		return this.Get({ key: this.redisKeysMap[ERedisKeys.CONTENT_SUMMARY](network, indexOrHash, proposalType) });
	}

	static async SetContentSummary({ network, indexOrHash, proposalType, data }: { network: string; indexOrHash: string; proposalType: string; data: string }): Promise<void> {
		await this.Set({ key: this.redisKeysMap[ERedisKeys.CONTENT_SUMMARY](network, indexOrHash, proposalType), value: data, ttlSeconds: ONE_DAY });
	}

	static async DeleteContentSummary({ network, indexOrHash, proposalType }: { network: string; indexOrHash: string; proposalType: string }): Promise<void> {
		await this.DeleteKeys({ pattern: `${ERedisKeys.CONTENT_SUMMARY}-${network}-${indexOrHash}-${proposalType}` });
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
		origins?: string[];
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
		origins?: string[];
	}): Promise<void> {
		await this.Set({ key: this.redisKeysMap[ERedisKeys.ACTIVITY_FEED](network, page, limit, userId, origins), value: JSON.stringify(data), ttlSeconds: SIX_HOURS_IN_SECONDS });
	}

	static async DeleteActivityFeed({ network }: { network: string }): Promise<void> {
		await this.DeleteKeys({ pattern: `${ERedisKeys.ACTIVITY_FEED}-${network}-*` });
	}

	// toolkit methods

	static async ClearCacheForAllPostsForNetwork(network: ENetwork): Promise<void> {
		// clear everything posts related
		await this.DeleteKeys({ pattern: `${ERedisKeys.POSTS_LISTING}-${network}-*` });
		await this.DeleteKeys({ pattern: `${ERedisKeys.POST_DATA}-${network}-*` });
		await this.DeleteKeys({ pattern: `${ERedisKeys.ACTIVITY_FEED}-${network}-*` });
		await this.DeleteKeys({ pattern: `${ERedisKeys.CONTENT_SUMMARY}-${network}-*` });
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
}
