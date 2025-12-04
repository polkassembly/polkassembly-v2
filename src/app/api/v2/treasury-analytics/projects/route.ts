// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextResponse } from 'next/server';
import { getNetworkFromHeaders } from '@/app/api/_api-utils/getNetworkFromHeaders';
import { withErrorHandling } from '@/app/api/_api-utils/withErrorHandling';
import { IProjects } from '@/_shared/types';

/**
 * GET /api/v2/analytics/projects
 *
 * Returns a summary of projects and historical funds awarded from treasury including:
 * - Project details (name, description, category, links)
 * - Total funds received per project
 * - Funding history with proposal details
 * - Project status and success rates
 * - Category distribution of projects
 */
export const GET = withErrorHandling(async (): Promise<NextResponse<IProjects>> => {
	// Get network from headers for future implementation
	await getNetworkFromHeaders();

	// TODO: Implement actual data fetching from OnChainDbService/RedisService
	// For now, return empty/placeholder data structure

	const response: IProjects = {
		items: [],
		totalProjects: 0,
		totalFundsAwarded: '0',
		totalFundsAwardedUsd: '0',
		categoryCounts: {}
	};

	return NextResponse.json(response);
});
