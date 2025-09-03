// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { OnChainDbService } from '@/app/api/_api-services/onchain_db_service';
import { RedisService } from '@/app/api/_api-services/redis_service';
import { getNetworkFromHeaders } from '@/app/api/_api-utils/getNetworkFromHeaders';
import { withErrorHandling } from '@/app/api/_api-utils/withErrorHandling';
import { ValidatorService } from '@/_shared/_services/validator_service';
import { EHttpHeaderKey } from '@/_shared/types';

export const GET = withErrorHandling(async (req: NextRequest, { params }: { params: Promise<{ trackNo: string }> }) => {
	const network = await getNetworkFromHeaders();
	const skipCache = req.headers.get(EHttpHeaderKey.SKIP_CACHE) === 'true';

	const zodParamsSchema = z.object({
		trackNo: z.coerce.number().refine((num) => ValidatorService.isValidTrackNumber({ trackNum: num, network }), 'Not a valid track number for the network')
	});

	const { trackNo } = zodParamsSchema.parse(await params);

	// Try to get from cache first
	if (!skipCache) {
		const cachedData = await RedisService.GetGovAnalyticsReferendumOutcomeByTrack(network, trackNo);
		if (cachedData) {
			return NextResponse.json(cachedData);
		}
	}

	// If not in cache or skipCache is true, fetch from Subsquid
	const data = await OnChainDbService.GetGovAnalyticsReferendumOutcome({
		network,
		trackNo
	});

	// Only cache if data is valid
	if (data) {
		await RedisService.SetGovAnalyticsReferendumOutcomeByTrack({ network, data, trackNo });
	}

	return NextResponse.json(data);
});
