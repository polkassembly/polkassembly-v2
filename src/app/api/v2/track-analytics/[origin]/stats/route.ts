// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { EPostOrigin } from '@/_shared/types';
import { OnChainDbService } from '@/app/api/_api-services/onchain_db_service';
import { RedisService } from '@/app/api/_api-services/redis_service';
import { getNetworkFromHeaders } from '@/app/api/_api-utils/getNetworkFromHeaders';
import { withErrorHandling } from '@/app/api/_api-utils/withErrorHandling';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const zodParamsSchema = z.object({
	origin: z.nativeEnum(EPostOrigin).or(z.literal('all'))
});

export const GET = withErrorHandling(async (req: NextRequest, { params }) => {
	const { origin } = zodParamsSchema.parse(await params);

	const network = await getNetworkFromHeaders();

	const cachedTrackAnalyticsStats = await RedisService.GetTrackAnalyticsStats({ network, origin });
	if (cachedTrackAnalyticsStats) {
		return NextResponse.json(cachedTrackAnalyticsStats);
	}

	const trackId = origin === 'all' ? undefined : NETWORKS_DETAILS[`${network}`].trackDetails[`${origin}`]?.trackId;

	const stats = await OnChainDbService.GetTrackAnalyticsStats({ network, trackId });

	await RedisService.SetTrackAnalyticsStats({ network, origin, data: stats });

	return NextResponse.json(stats);
});
