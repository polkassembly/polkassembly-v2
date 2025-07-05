// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { MAX_LISTING_LIMIT, DEFAULT_LISTING_LIMIT } from '@/_shared/_constants/listingLimit';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { OnChainDbService } from '@/app/api/_api-services/onchain_db_service';
import { getNetworkFromHeaders } from '@/app/api/_api-utils/getNetworkFromHeaders';
import { withErrorHandling } from '@/app/api/_api-utils/withErrorHandling';

export const GET = withErrorHandling(async (req: NextRequest) => {
	const zodQuerySchema = z.object({
		page: z.coerce.number().optional().default(1),
		limit: z.coerce.number().max(MAX_LISTING_LIMIT).optional().default(DEFAULT_LISTING_LIMIT),
		addresses: z.string().min(1, 'At least one address is required')
	});

	const { page, limit, addresses } = zodQuerySchema.parse(Object.fromEntries(req.nextUrl.searchParams));

	const network = await getNetworkFromHeaders();

	// Parse comma-separated addresses
	const addressList = addresses
		.split(',')
		.map((addr) => addr.trim())
		.filter(Boolean);

	const userPreimageListing = await OnChainDbService.GetUserPreimageListing({
		network,
		page,
		limit,
		addresses: addressList
	});

	return NextResponse.json(userPreimageListing);
});
