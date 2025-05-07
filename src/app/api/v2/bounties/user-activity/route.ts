// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextResponse } from 'next/server';
import { OnChainDbService } from '@/app/api/_api-services/onchain_db_service';
import { getNetworkFromHeaders } from '@/app/api/_api-utils/getNetworkFromHeaders';
import { withErrorHandling } from '@/app/api/_api-utils/withErrorHandling';

export const GET = withErrorHandling(async (): Promise<NextResponse> => {
	const network = await getNetworkFromHeaders();

	const activity = await OnChainDbService.GetBountyUserActivity(network, 20);
	return NextResponse.json(activity);
});
