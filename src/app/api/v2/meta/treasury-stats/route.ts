// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextRequest, NextResponse } from 'next/server';
import { OffChainDbService } from '@/app/api/_api-services/offchain_db_service';
import { getNetworkFromHeaders } from '@/app/api/_api-utils/getNetworkFromHeaders';
import { withErrorHandling } from '@/app/api/_api-utils/withErrorHandling';
import { z } from 'zod';
import { ITreasuryStats } from '@/_shared/types';

const zodQuerySchema = z.object({
	from: z.date().optional(),
	to: z.date().optional()
});

export const GET = withErrorHandling(async (req: NextRequest): Promise<NextResponse<ITreasuryStats[]>> => {
	const network = await getNetworkFromHeaders();
	const { from, to } = zodQuerySchema.parse(Object.fromEntries(req.nextUrl.searchParams));
	const treasuryStats = await OffChainDbService.GetTreasuryStats({ network, from, to });
	return NextResponse.json(treasuryStats);
});
