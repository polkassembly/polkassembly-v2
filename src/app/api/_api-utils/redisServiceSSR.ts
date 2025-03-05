// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use server';

import { ClientError } from '@/app/_client-utils/clientError';
import { ERROR_CODES } from '@/_shared/_constants/errorLiterals';
import { RedisService } from '../_api-services/redis_service';

type StaticRedisMethod = {
	[K in keyof typeof RedisService]: (typeof RedisService)[K] extends (params: infer P) => infer R ? (params: P) => R : never;
};

/**
 * @description Type-safe wrapper function for RedisService for SSR
 *
 * Example usage:
 * const cachedData = await redisServiceSSR('GetPostsListing', { network: currentNetwork, proposalType, page, limit, statuses, origins, tags });
 *
 * @export
 * @template K - Method name from RedisService
 * @param {K} methodName - The name of the method to call
 * @param {Parameters<StaticRedisMethod[K]>[0]} params - The parameters to pass to the method
 */
export async function redisServiceSSR<K extends keyof StaticRedisMethod>(methodName: K, params: Parameters<StaticRedisMethod[K]>[0]): Promise<ReturnType<StaticRedisMethod[K]>> {
	const method = RedisService[methodName as keyof typeof RedisService];
	if (typeof method !== 'function') {
		throw new ClientError(ERROR_CODES.CLIENT_ERROR, 'Invalid Redis Service method name');
	}

	return Reflect.apply(method, RedisService, [params]);
}
