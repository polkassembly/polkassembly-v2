// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextResponse } from 'next/server';
import { getNetworkFromHeaders } from '@/app/api/_api-utils/getNetworkFromHeaders';
import { withErrorHandling } from '@/app/api/_api-utils/withErrorHandling';
import { IEcosystemContext } from '@/_shared/types';

/**
 * GET /api/v2/treasury-analytics/ecosystem-context
 *
 * Returns ecosystem context data including:
 * - Network activity backdrop (transactions, accounts)
 * - TVL and stablecoin supply trends
 * - XCM transfers and messages
 * - Ecosystem projects overview
 */
export const GET = withErrorHandling(async (): Promise<NextResponse<IEcosystemContext>> => {
	// Get network from headers for future implementation
	await getNetworkFromHeaders();

	// TODO: Implement actual data fetching from OnChainDbService/RedisService
	// For now, return empty/placeholder data structure

	const response: IEcosystemContext = {
		networkActivity: [],
		tvlAndStablecoin: [],
		xcmData: [],
		projects: [],
		projectCount: 0
	};

	return NextResponse.json(response);
});
