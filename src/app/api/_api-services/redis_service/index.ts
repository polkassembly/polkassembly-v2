// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { REDIS_URL } from '@api/_api-constants/apiEnvVars';
import { APIError } from '@api/_api-utils/apiError';
import { ERROR_CODES } from '@shared/_constants/errorLiterals';
import { StatusCodes } from 'http-status-codes';
import Redis from 'ioredis';
import { FIVE_MIN, ONE_DAY, REFRESH_TOKEN_LIFE_IN_SECONDS, TWELVE_HOURS_IN_SECONDS } from '../../_api-constants/timeConstants';

if (!REDIS_URL) {
	throw new APIError(ERROR_CODES.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR, 'REDIS_URL is not set');
}

enum ERedisKeys {
	PASSWORD_RESET_TOKEN = 'PRT',
	EMAIL_VERIFICATION_TOKEN = 'EVT',
	TWO_FACTOR_AUTH_TOKEN = 'TFA',
	SUBSCAN_DATA = 'SDT',
	REFRESH_TOKEN = 'RFT'
}

export class RedisService {
	private static readonly client: Redis = new Redis(REDIS_URL);

	private static readonly redisKeysMap = {
		[ERedisKeys.PASSWORD_RESET_TOKEN]: (token: string): string => `${ERedisKeys.PASSWORD_RESET_TOKEN}-${token}`,
		[ERedisKeys.EMAIL_VERIFICATION_TOKEN]: (token: string): string => `${ERedisKeys.EMAIL_VERIFICATION_TOKEN}-${token}`,
		[ERedisKeys.TWO_FACTOR_AUTH_TOKEN]: (tfaToken: string): string => `${ERedisKeys.TWO_FACTOR_AUTH_TOKEN}-${tfaToken}`,
		[ERedisKeys.SUBSCAN_DATA]: (network: string, url: string): string => `${ERedisKeys.SUBSCAN_DATA}-${network}-${url}`,
		[ERedisKeys.REFRESH_TOKEN]: (userId: number): string => `${ERedisKeys.REFRESH_TOKEN}-${userId}`
	};

	// helper methods

	private static async Get(key: string): Promise<string | null> {
		return this.client.get(key);
	}

	private static async Set(key: string, value: string, ttlSeconds?: number): Promise<string | null> {
		if (ttlSeconds) {
			return this.client.set(key, value, 'EX', ttlSeconds);
		}

		return this.client.set(key, value);
	}

	private static async Delete(key: string): Promise<number> {
		return this.client.del(key);
	}

	private static async DeleteKeys(pattern: string): Promise<void> {
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
		await this.Set(this.redisKeysMap[ERedisKeys.EMAIL_VERIFICATION_TOKEN](token), email, ONE_DAY);
	}

	static async SetRefreshToken(userId: number, refreshToken: string): Promise<void> {
		await this.Set(this.redisKeysMap[ERedisKeys.REFRESH_TOKEN](userId), refreshToken, REFRESH_TOKEN_LIFE_IN_SECONDS);
	}

	static async GetRefreshToken(userId: number): Promise<string | null> {
		return this.Get(this.redisKeysMap[ERedisKeys.REFRESH_TOKEN](userId));
	}

	static async DeleteRefreshToken(userId: number): Promise<void> {
		await this.Delete(this.redisKeysMap[ERedisKeys.REFRESH_TOKEN](userId));
	}

	static async SetTfaToken(tfaToken: string, userId: number): Promise<void> {
		await this.Set(this.redisKeysMap[ERedisKeys.TWO_FACTOR_AUTH_TOKEN](tfaToken), userId.toString(), FIVE_MIN);
	}

	static async GetTfaToken(tfaToken: string): Promise<string | null> {
		return this.Get(this.redisKeysMap[ERedisKeys.TWO_FACTOR_AUTH_TOKEN](tfaToken));
	}

	static async GetSubscanData(network: string, url: string): Promise<string | null> {
		return this.Get(this.redisKeysMap[ERedisKeys.SUBSCAN_DATA](network, url));
	}

	static async SetSubscanData(network: string, url: string, data: string): Promise<void> {
		await this.Set(this.redisKeysMap[ERedisKeys.SUBSCAN_DATA](network, url), data, TWELVE_HOURS_IN_SECONDS);
	}

	static async SetResetPasswordToken(token: string, userId: number): Promise<void> {
		await this.Set(this.redisKeysMap[ERedisKeys.PASSWORD_RESET_TOKEN](token), userId.toString(), ONE_DAY);
	}

	static async GetUserIdFromResetPasswordToken(token: string): Promise<number | null> {
		const userId = await this.Get(this.redisKeysMap[ERedisKeys.PASSWORD_RESET_TOKEN](token));
		return userId ? Number(userId) : null;
	}

	static async DeleteResetPasswordToken(token: string): Promise<void> {
		await this.Delete(this.redisKeysMap[ERedisKeys.PASSWORD_RESET_TOKEN](token));
	}
}
