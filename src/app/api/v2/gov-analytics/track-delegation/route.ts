// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextRequest, NextResponse } from 'next/server';
import { RedisService } from '@/app/api/_api-services/redis_service';
import { getNetworkFromHeaders } from '@/app/api/_api-utils/getNetworkFromHeaders';
import { withErrorHandling } from '@/app/api/_api-utils/withErrorHandling';
import { EHttpHeaderKey } from '@/_shared/types';
import { OnChainDbService } from '@/app/api/_api-services/onchain_db_service';

export const GET = withErrorHandling(async (req: NextRequest): Promise<NextResponse> => {
	const network = await getNetworkFromHeaders();
	const skipCache = req.headers.get(EHttpHeaderKey.SKIP_CACHE) === 'true';

	// Try to get from cache first
	if (!skipCache) {
		const cachedData = await RedisService.GetTrackDelegationAnalytics({ network });
		if (cachedData) {
			return NextResponse.json(cachedData);
		}
	}

	const data = await OnChainDbService.GetTrackDelegationAnalyticsStats({ network });

	// Cache the data
	await RedisService.SetTrackDelegationAnalytics({ network, data });

	return NextResponse.json(data);
});
