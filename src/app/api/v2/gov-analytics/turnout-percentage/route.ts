// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextRequest } from 'next/server';
import { RedisService } from '@/app/api/_api-services/redis_service';
import { OnChainDbService } from '@/app/api/_api-services/onchain_db_service';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { EHttpHeaderKey, ENetwork } from '@/_shared/types';

export async function GET(req: NextRequest) {
	try {
		const networkHeader = req.headers.get(EHttpHeaderKey.NETWORK);
		const network = (networkHeader as ENetwork) || (await getCurrentNetwork());
		const skipCache = req.headers.get(EHttpHeaderKey.SKIP_CACHE) === 'true';

		// Try to get from cache first
		if (!skipCache) {
			const cachedData = await RedisService.GetTurnoutPercentageAnalytics(network);
			if (cachedData) {
				console.log('Returning cached turnout percentage analytics data');
				return Response.json(cachedData);
			}
		}

		// If not in cache or skipCache is true, fetch from OnChainDbService
		const data = await OnChainDbService.GetTurnoutPercentageData({ network });

		// Cache the data
		await RedisService.SetTurnoutPercentageAnalytics({ network, data });

		return Response.json(data);
	} catch (error) {
		if (error instanceof Error) {
			console.error('Error details:', {
				message: error.message,
				stack: error.stack,
				name: error.name
			});
		}
		return Response.json({ error: 'Failed to fetch turnout percentage analytics data' }, { status: 500 });
	}
}
