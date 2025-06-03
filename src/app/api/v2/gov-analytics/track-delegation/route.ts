// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextRequest } from 'next/server';
import { RedisService } from '@/app/api/_api-services/redis_service';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { EHttpHeaderKey, ENetwork } from '@/_shared/types';
import { SubsquidService } from '@/app/api/_api-services/onchain_db_service/subsquid_service';

export async function GET(req: NextRequest) {
	try {
		const networkHeader = req.headers.get(EHttpHeaderKey.NETWORK);
		const network = (networkHeader as ENetwork) || (await getCurrentNetwork());
		const skipCache = req.headers.get(EHttpHeaderKey.SKIP_CACHE) === 'true';

		// Try to get from cache first
		if (!skipCache) {
			const cachedData = await RedisService.GetTrackDelegationAnalytics({ network });
			if (cachedData) {
				console.log('Returning cached track delegation analytics data');
				return Response.json(cachedData);
			}
		}

		const data = await SubsquidService.GetTrackDelegationAnalyticsStats({ network });

		// Cache the data
		await RedisService.SetTrackDelegationAnalytics({ network, data });

		return Response.json(data);
	} catch (error) {
		console.error('Error in track delegation analytics:', error);
		return Response.json({ error: 'Error fetching track delegation analytics' }, { status: 500 });
	}
}
