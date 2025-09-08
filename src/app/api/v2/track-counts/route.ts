// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { OnChainDbService } from '@/app/api/_api-services/onchain_db_service';
import { RedisService } from '@/app/api/_api-services/redis_service';
import { getNetworkFromHeaders } from '@/app/api/_api-utils/getNetworkFromHeaders';
import { withErrorHandling } from '@/app/api/_api-utils/withErrorHandling';
import { NextResponse } from 'next/server';

export const GET = withErrorHandling(async () => {
	const network = await getNetworkFromHeaders();

	// Check if we have cached track counts
	const cachedTrackCounts = await RedisService.GetTrackCounts({ network });
	if (cachedTrackCounts) {
		return NextResponse.json(cachedTrackCounts);
	}

	// Get all track IDs from the network
	const trackDetails = NETWORKS_DETAILS[network]?.trackDetails;
	if (!trackDetails) {
		return NextResponse.json({});
	}

	const allTrackIds = Object.values(trackDetails).map((track) => track.trackId);

	// Fetch active proposal counts for all tracks and bounty stats
	const [trackCounts, bountyStats] = await Promise.all([
		OnChainDbService.GetActiveProposalsCountByTrackIds({
			network,
			trackIds: allTrackIds
		}),
		OnChainDbService.GetBountyStats(network)
	]);

	// Transform the data to match the expected format
	const result: Record<string, number> = {};
	Object.entries(trackDetails).forEach(([trackName, track]) => {
		result[trackName] = trackCounts[track.trackId] || 0;
	});

	// Add bounty dashboard count
	if (bountyStats) {
		result.bounty_dashboard = bountyStats.activeBounties || 0;
	}

	// Cache the result
	await RedisService.SetTrackCounts({ network, data: result });

	return NextResponse.json(result);
});
