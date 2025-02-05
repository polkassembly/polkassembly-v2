// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { MAX_LISTING_LIMIT, DEFAULT_LISTING_LIMIT } from '@/_shared/_constants/listingLimit';
import { IGenericListingResponse, IPublicUser } from '@/_shared/types';
import { OffChainDbService } from '@/app/api/_api-services/offchain_db_service';
import { withErrorHandling } from '@/app/api/_api-utils/withErrorHandling';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

export const GET = withErrorHandling(async (req: NextRequest): Promise<NextResponse> => {
	const zodQuerySchema = z.object({
		page: z.coerce.number().optional().default(1),
		limit: z.coerce.number().max(MAX_LISTING_LIMIT).optional().default(DEFAULT_LISTING_LIMIT)
	});

	const { page, limit } = zodQuerySchema.parse(Object.fromEntries(req.nextUrl.searchParams));

	const usersListing: IGenericListingResponse<IPublicUser> = await OffChainDbService.GetPublicUsers(page, limit);

	return NextResponse.json(usersListing);
});
