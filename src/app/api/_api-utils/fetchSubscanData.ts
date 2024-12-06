// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { fetchPF } from '@/_shared/_utils/fetchPF';
import { SUBSCAN_API_KEY, SUBSCAN_CACHE_ENABLED } from '@/app/api/_api-constants/apiEnvVars';
import { redisGet, redisSetex } from '@/app/api/_api-services/redis_service';
import { getSubscanDataKey } from '@/app/api/_api-services/redis_service/redisKeys';

if (!SUBSCAN_API_KEY) {
	throw new Error('SUBSCAN_API_KEY env variable is not set');
}

const SUBSCAN_API_HEADERS = {
	Accept: 'application/json',
	'Content-Type': 'application/json',
	'X-API-Key': SUBSCAN_API_KEY
};

const TWELWE_HOURS_IN_SECONDS = 43200;

export const fetchSubscanData = async (url: string | URL, network: string, body?: Record<string, unknown>, method?: 'POST' | 'GET') => {
	try {
		const redisKey = getSubscanDataKey(network, url.toString());

		const redisData = await redisGet(redisKey);

		if (redisData && SUBSCAN_CACHE_ENABLED) {
			return JSON.parse(redisData);
		}

		const filteredUrl = url.toString().charAt(0) === '/' ? url.toString().substring(1) : url;
		const validURL = new URL(`https://${network}.api.subscan.io/${filteredUrl}`);

		const data = await (
			await fetchPF(validURL, {
				body: JSON.stringify(body),
				headers: SUBSCAN_API_HEADERS,
				method: body ? 'POST' : method || 'GET'
			})
		).json();

		if (data?.message === 'Success' && SUBSCAN_CACHE_ENABLED) {
			await redisSetex(redisKey, TWELWE_HOURS_IN_SECONDS, data);
		}

		return data;
	} catch (error) {
		return error;
	}
};
