// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextResponse } from 'next/server';
import { getNetworkFromHeaders } from '@/app/api/_api-utils/getNetworkFromHeaders';
import { withErrorHandling } from '@/app/api/_api-utils/withErrorHandling';
import { ICoretimeAnalytics } from '@/_shared/types';

/**
 * GET /api/v2/treasury-analytics/coretime
 *
 * Returns coretime analytics data including:
 * - Coretime revenue burned
 * - Bulk and instantaneous prices over time
 * - Active cores count and total cores
 * - Core utilization metrics
 */
export const GET = withErrorHandling(async (): Promise<NextResponse<ICoretimeAnalytics>> => {
	// Get network from headers for future implementation
	await getNetworkFromHeaders();

	// TODO: Implement actual data fetching from OnChainDbService/RedisService
	// For now, return empty/placeholder data structure

	const response: ICoretimeAnalytics = {
		revenueBurned: {
			total: '0',
			totalUsd: '0',
			percentageChange: 0
		},
		prices: [],
		activeCores: 0,
		totalCores: 0,
		averageUtilization: 0,
		coreUtilization: []
	};

	return NextResponse.json(response);
});
