// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextResponse } from 'next/server';
import { withErrorHandling } from '../../_api-utils/withErrorHandling';
import { getNetworkFromHeaders } from '../../_api-utils/getNetworkFromHeaders';
import { OnChainDbService } from '../../_api-services/onchain_db_service';

export const GET = withErrorHandling(async () => {
	const network = await getNetworkFromHeaders();
	const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
	const stats = await OnChainDbService.GetActivityStats({ network, oneWeekAgo });

	return NextResponse.json({
		activeProposalsCount: stats.activeProposalsCount,
		weeklyVotesCount: stats.weeklyVotesCount,
		weeklySpends: stats.weeklySpends
	});
});
