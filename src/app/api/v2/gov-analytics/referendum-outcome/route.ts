// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextRequest, NextResponse } from 'next/server';
import { RedisService } from '@/app/api/_api-services/redis_service';
import { OnChainDbService } from '@/app/api/_api-services/onchain_db_service';
import { getNetworkFromHeaders } from '@/app/api/_api-utils/getNetworkFromHeaders';
import { withErrorHandling } from '@/app/api/_api-utils/withErrorHandling';
import { EHttpHeaderKey } from '@/_shared/types';

export const GET = withErrorHandling(async (req: NextRequest): Promise<NextResponse> => {
	const network = await getNetworkFromHeaders();
	const skipCache = req.headers.get(EHttpHeaderKey.SKIP_CACHE) === 'true';

	// Try to get from cache first
	if (!skipCache) {
		const cachedData = await RedisService.GetGovAnalyticsReferendumOutcome(network);
		if (cachedData) {
			return NextResponse.json(cachedData);
		}
	}

	// If not in cache or skipCache is true, fetch from Subsquid
	const data = await OnChainDbService.GetGovAnalyticsReferendumOutcome({
		network,
		trackNo: undefined
	});

	// Only cache if data is valid
	if (
		data &&
		typeof data.approved === 'number' &&
		typeof data.rejected === 'number' &&
		typeof data.timeout === 'number' &&
		typeof data.ongoing === 'number' &&
		typeof data.cancelled === 'number'
	) {
		await RedisService.SetGovAnalyticsReferendumOutcome({ network, data });
	}

	return NextResponse.json(data);
});
