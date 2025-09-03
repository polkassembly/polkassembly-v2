// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextRequest, NextResponse } from 'next/server';
import { RedisService } from '@/app/api/_api-services/redis_service';
import { OnChainDbService } from '@/app/api/_api-services/onchain_db_service';
import { getNetworkFromHeaders } from '@/app/api/_api-utils/getNetworkFromHeaders';
import { withErrorHandling } from '@/app/api/_api-utils/withErrorHandling';
import { EHttpHeaderKey } from '@/_shared/types';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';

export const GET = withErrorHandling(async (req: NextRequest): Promise<NextResponse> => {
	const network = await getNetworkFromHeaders();
	const skipCache = req.headers.get(EHttpHeaderKey.SKIP_CACHE) === 'true';

	// Try to get from cache first
	if (!skipCache) {
		const cachedData = await RedisService.GetTrackLevelProposalsAnalytics(network);
		if (cachedData) {
			return NextResponse.json(cachedData);
		}
	}

	// Get all track IDs from network details
	const trackIds = Object.values(NETWORKS_DETAILS[network].trackDetails).map((track) => track.trackId);

	// Fetch counts for each track
	const trackProposals: Record<number, number> = {};
	let totalProposals = 0;

	const promises = trackIds.map(async (trackId) => {
		const stats = await OnChainDbService.GetTrackLevelAnalyticsStats({
			network,
			trackId
		});

		trackProposals[trackId] = stats.totalProposalCount;
		totalProposals += stats.totalProposalCount;
	});

	await Promise.all(promises);

	const data = {
		data: trackProposals,
		totalProposals
	};

	// Cache the data
	if (data) {
		await RedisService.SetTrackLevelProposalsAnalytics({ network, data });
	}

	return NextResponse.json(data);
});
