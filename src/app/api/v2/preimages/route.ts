// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { MAX_LISTING_LIMIT, DEFAULT_LISTING_LIMIT } from '@/_shared/_constants/listingLimit';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { OnChainDbService } from '../../_api-services/onchain_db_service';
import { getNetworkFromHeaders } from '../../_api-utils/getNetworkFromHeaders';
import { withErrorHandling } from '../../_api-utils/withErrorHandling';

export const GET = withErrorHandling(async (req: NextRequest) => {
	const zodQuerySchema = z.object({
		page: z.coerce.number().optional().default(1),
		limit: z.coerce.number().max(MAX_LISTING_LIMIT).optional().default(DEFAULT_LISTING_LIMIT)
	});

	const { page, limit } = zodQuerySchema.parse(Object.fromEntries(req.nextUrl.searchParams));

	const network = await getNetworkFromHeaders();

	const preimageListing = await OnChainDbService.GetPreimageListing({ network, page, limit });

	return NextResponse.json(preimageListing);
});
