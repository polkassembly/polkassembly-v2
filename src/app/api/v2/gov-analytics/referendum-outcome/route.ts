// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextRequest } from 'next/server';
import { RedisService } from '@/app/api/_api-services/redis_service';
import { SubsquidService } from '@/app/api/_api-services/onchain_db_service/subsquid_service';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { EHttpHeaderKey, ENetwork } from '@/_shared/types';

export async function GET(req: NextRequest) {
	try {
		const networkHeader = req.headers.get(EHttpHeaderKey.NETWORK);
		const network = (networkHeader as ENetwork) || (await getCurrentNetwork());
		const skipCache = req.headers.get(EHttpHeaderKey.SKIP_CACHE) === 'true';
		const trackNo = req.nextUrl.searchParams.get('trackNo');

		// Try to get from cache first
		if (!skipCache && !trackNo) {
			const cachedData = await RedisService.GetGovAnalyticsReferendumOutcome(network);
			if (cachedData) {
				console.log('Returning cached referendum outcome data');
				return Response.json(cachedData);
			}
		}

		// If not in cache or skipCache is true, fetch from Subsquid
		const data = await SubsquidService.GetGovAnalyticsReferendumOutcome({
			network,
			trackNo: trackNo ? Number(trackNo) : undefined
		});

		// Cache the data only if it's not track-specific
		if (!trackNo) {
			await RedisService.SetGovAnalyticsReferendumOutcome({ network, data });
		}

		return Response.json(data);
	} catch (error) {
		if (error instanceof Error) {
			console.error('Error details:', {
				message: error.message,
				stack: error.stack,
				name: error.name
			});
		}
		return Response.json({ error: 'Failed to fetch referendum outcome data' }, { status: 500 });
	}
}
