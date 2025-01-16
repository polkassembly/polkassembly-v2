// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { fetchPF } from '@/_shared/_utils/fetchPF';
import { SUBSCAN_API_KEY, SUBSCAN_CACHE_ENABLED } from '@/app/api/_api-constants/apiEnvVars';
import { RedisService } from '@/app/api/_api-services/redis_service';
import { deepParseJson } from 'deep-parse-json';

if (!SUBSCAN_API_KEY) {
	throw new Error('SUBSCAN_API_KEY env variable is not set');
}

const SUBSCAN_API_HEADERS = {
	Accept: 'application/json',
	'Content-Type': 'application/json',
	'X-API-Key': SUBSCAN_API_KEY
};

export const fetchSubscanData = async (url: string | URL, network: string, body?: Record<string, unknown>, method?: 'POST' | 'GET') => {
	try {
		const redisData = await RedisService.GetSubscanData(network, url.toString());

		if (redisData && SUBSCAN_CACHE_ENABLED) {
			return deepParseJson(redisData);
		}

		const data = await (
			await fetchPF(url, {
				body: body ? JSON.stringify(body) : undefined,
				headers: SUBSCAN_API_HEADERS,
				method: body ? 'POST' : method || 'GET'
			})
		).json();

		if (data?.message === 'Success' && SUBSCAN_CACHE_ENABLED) {
			await RedisService.SetSubscanData(network, url.toString(), JSON.stringify(data));
		}

		return data;
	} catch (error) {
		return error;
	}
};
