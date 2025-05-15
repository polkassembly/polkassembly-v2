// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { SUBSCAN_API_KEY } from '@/app/api/_api-constants/apiEnvVars';
import { RedisService } from '@/app/api/_api-services/redis_service';
import { deepParseJson } from 'deep-parse-json';

// TODO: add a feature flag

if (!SUBSCAN_API_KEY) {
	throw new Error('SUBSCAN_API_KEY env variable is not set');
}

const SUBSCAN_API_HEADERS = {
	Accept: 'application/json',
	'Content-Type': 'application/json',
	'X-API-Key': SUBSCAN_API_KEY
};

export const fetchSubscanData = async ({ url, network, body, method }: { url: string | URL; network: string; body?: Record<string, unknown>; method?: 'POST' | 'GET' }) => {
	try {
		const redisData = await RedisService.GetSubscanData({ network, url: url.toString(), body });

		if (redisData) {
			return deepParseJson(redisData);
		}

		const data = await (
			await fetch(url, {
				body: body ? JSON.stringify(body) : undefined,
				headers: SUBSCAN_API_HEADERS,
				method: body ? 'POST' : method || 'GET'
			})
		).json();

		if (data?.message === 'Success') {
			await RedisService.SetSubscanData({ network, url: url.toString(), data: JSON.stringify(data) });
		}

		return data;
	} catch (error) {
		return error;
	}
};
