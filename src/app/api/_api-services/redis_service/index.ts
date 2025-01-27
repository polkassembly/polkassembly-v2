// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { IS_CACHE_ENABLED, REDIS_URL } from '@api/_api-constants/apiEnvVars';
import { APIError } from '@api/_api-utils/apiError';
import { ERROR_CODES } from '@shared/_constants/errorLiterals';
import { StatusCodes } from 'http-status-codes';
import Redis from 'ioredis';
import { ENetwork } from '@/_shared/types';
import { FIVE_MIN, ONE_DAY, REFRESH_TOKEN_LIFE_IN_SECONDS, TWELVE_HOURS_IN_SECONDS } from '../../_api-constants/timeConstants';

if (!REDIS_URL) {
	throw new APIError(ERROR_CODES.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR, 'REDIS_URL is not set');
}

export enum ERedisKeys {
	PASSWORD_RESET_TOKEN = 'PRT',
	EMAIL_VERIFICATION_TOKEN = 'EVT',
	TWO_FACTOR_AUTH_TOKEN = 'TFA',
	SUBSCAN_DATA = 'SDT',
	REFRESH_TOKEN = 'RFT',
	POST_DATA = 'PDT',
	POSTS_LISTING = 'PLT',
	ACTIVITY_FEED = 'AFD',
	QR_SESSION = 'QRS'
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
		[ERedisKeys.QR_SESSION]: (sessionId: string): string => `${ERedisKeys.QR_SESSION}-${sessionId}`
	} as const;

	// helper methods

	private static async Get(key: string, forceCache?: boolean): Promise<string | null> {
		if (!IS_CACHE_ENABLED && !forceCache) return null;
		return this.client.get(key);
	}

	private static async Set(key: string, value: string, ttlSeconds?: number, forceCache?: boolean): Promise<string | null> {
		if (!IS_CACHE_ENABLED && !forceCache) return null;

		if (ttlSeconds) {
			return this.client.set(key, value, 'EX', ttlSeconds);
		}

		return this.client.set(key, value);
	}

	private static async Delete(key: string, forceCache?: boolean): Promise<number> {
		if (!IS_CACHE_ENABLED && !forceCache) return 0;

		return this.client.del(key);
	}

	private static async DeleteKeys(pattern: string, forceCache?: boolean): Promise<void> {
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

	// static methods
	static async SetEmailVerificationToken(token: string, email: string): Promise<void> {
		await this.Set(this.redisKeysMap[ERedisKeys.EMAIL_VERIFICATION_TOKEN](token), email, ONE_DAY, true);
	}

	static async SetRefreshToken(userId: number, refreshToken: string): Promise<void> {
		await this.Set(this.redisKeysMap[ERedisKeys.REFRESH_TOKEN](userId), refreshToken, REFRESH_TOKEN_LIFE_IN_SECONDS, true);
	}

	static async GetRefreshToken(userId: number): Promise<string | null> {
		return this.Get(this.redisKeysMap[ERedisKeys.REFRESH_TOKEN](userId), true);
	}

	static async DeleteRefreshToken(userId: number): Promise<void> {
		await this.Delete(this.redisKeysMap[ERedisKeys.REFRESH_TOKEN](userId), true);
	}

	static async SetTfaToken(tfaToken: string, userId: number): Promise<void> {
		await this.Set(this.redisKeysMap[ERedisKeys.TWO_FACTOR_AUTH_TOKEN](tfaToken), userId.toString(), FIVE_MIN, true);
	}

	static async GetTfaToken(tfaToken: string): Promise<string | null> {
		return this.Get(this.redisKeysMap[ERedisKeys.TWO_FACTOR_AUTH_TOKEN](tfaToken), true);
	}

	static async GetSubscanData(network: string, url: string): Promise<string | null> {
		return this.Get(this.redisKeysMap[ERedisKeys.SUBSCAN_DATA](network, url));
	}

	static async SetSubscanData(network: string, url: string, data: string): Promise<void> {
		await this.Set(this.redisKeysMap[ERedisKeys.SUBSCAN_DATA](network, url), data, TWELVE_HOURS_IN_SECONDS);
	}

	static async SetResetPasswordToken(token: string, userId: number): Promise<void> {
		await this.Set(this.redisKeysMap[ERedisKeys.PASSWORD_RESET_TOKEN](token), userId.toString(), ONE_DAY, true);
	}

	static async GetUserIdFromResetPasswordToken(token: string): Promise<number | null> {
		const userId = await this.Get(this.redisKeysMap[ERedisKeys.PASSWORD_RESET_TOKEN](token), true);
		return userId ? Number(userId) : null;
	}

	static async DeleteResetPasswordToken(token: string): Promise<void> {
		await this.Delete(this.redisKeysMap[ERedisKeys.PASSWORD_RESET_TOKEN](token), true);
	}

	// Posts caching methods
	static async GetPostData({ network, proposalType, indexOrHash }: { network: string; proposalType: string; indexOrHash: string }): Promise<string | null> {
		return this.Get(this.redisKeysMap[ERedisKeys.POST_DATA](network, proposalType, indexOrHash));
	}

	static async SetPostData({ network, proposalType, indexOrHash, data }: { network: string; proposalType: string; indexOrHash: string; data: string }): Promise<void> {
		await this.Set(this.redisKeysMap[ERedisKeys.POST_DATA](network, proposalType, indexOrHash), data, ONE_DAY);
	}

	static async DeletePostData({ network, proposalType, indexOrHash }: { network: string; proposalType: string; indexOrHash: string }): Promise<void> {
		await this.Delete(this.redisKeysMap[ERedisKeys.POST_DATA](network, proposalType, indexOrHash));
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
	}): Promise<string | null> {
		return this.Get(this.redisKeysMap[ERedisKeys.POSTS_LISTING](network, proposalType, page, limit, statuses, origins, tags));
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
		data: string;
		statuses?: string[];
		origins?: string[];
		tags?: string[];
	}): Promise<void> {
		await this.Set(this.redisKeysMap[ERedisKeys.POSTS_LISTING](network, proposalType, page, limit, statuses, origins, tags), data, ONE_DAY);
	}

	static async DeletePostsListing({ network, proposalType }: { network: string; proposalType: string }): Promise<void> {
		await this.DeleteKeys(`${ERedisKeys.POSTS_LISTING}-${network}-${proposalType}-*`);
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
	}): Promise<string | null> {
		return this.Get(this.redisKeysMap[ERedisKeys.ACTIVITY_FEED](network, page, limit, userId, origins));
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
		data: string;
		userId?: number;
		origins?: string[];
	}): Promise<void> {
		await this.Set(this.redisKeysMap[ERedisKeys.ACTIVITY_FEED](network, page, limit, userId, origins), data, ONE_DAY);
	}

	static async DeleteActivityFeed({ network }: { network: string }): Promise<void> {
		await this.DeleteKeys(`${ERedisKeys.ACTIVITY_FEED}-${network}-*`);
	}

	static async ClearCacheForAllPostsForNetwork(network: ENetwork): Promise<void> {
		// clear everything posts related
		await this.DeleteKeys(`${ERedisKeys.POSTS_LISTING}-${network}-*`);
		await this.DeleteKeys(`${ERedisKeys.POST_DATA}-${network}-*`);
		await this.DeleteKeys(`${ERedisKeys.ACTIVITY_FEED}-${network}-*`);
	}

	// QR session caching methods

	static async SetQRSession(sessionId: string, data: { userId: number; timestamp: number; expiresIn: number }): Promise<void> {
		await this.Set(this.redisKeysMap[ERedisKeys.QR_SESSION](sessionId), JSON.stringify(data), data.expiresIn, true);
	}

	static async GetQRSession(sessionId: string): Promise<{ userId: number; timestamp: number; expiresIn: number } | null> {
		const data = await this.Get(this.redisKeysMap[ERedisKeys.QR_SESSION](sessionId), true);
		return data ? JSON.parse(data) : null;
	}

	static async DeleteQRSession(sessionId: string): Promise<void> {
		await this.Delete(this.redisKeysMap[ERedisKeys.QR_SESSION](sessionId), true);
	}
}
