// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandling } from '@/app/api/_api-utils/withErrorHandling';
import { getNetworkFromHeaders } from '@/app/api/_api-utils/getNetworkFromHeaders';
import { IdentityService } from '@/app/_client-services/identity_service';
import { getJudgementRequests } from '@/app/_client-utils/identityUtils';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { ENetwork } from '@/_shared/types';
import { z } from 'zod';
import { DEFAULT_LISTING_LIMIT, MAX_LISTING_LIMIT } from '@/_shared/_constants/listingLimit';

const zodQuerySchema = z.object({
	page: z.coerce.number().optional().default(1),
	limit: z.coerce.number().max(MAX_LISTING_LIMIT).optional().default(DEFAULT_LISTING_LIMIT),
	search: z.string().optional().default('')
});

export const GET = withErrorHandling(async (req: NextRequest) => {
	const { page, limit, search } = zodQuerySchema.parse(Object.fromEntries(req.nextUrl.searchParams));
	const network = await getNetworkFromHeaders();

	// Check if network supports People Chain
	if (!NETWORKS_DETAILS[network as ENetwork]?.peopleChainDetails) {
		return NextResponse.json({
			items: [],
			totalCount: 0
		});
	}

	const identityService = await IdentityService.Init(network as ENetwork);
	const allJudgements = await identityService.getAllIdentityJudgements();
	const requests = getJudgementRequests({ allJudgements, page, limit, search });

	return NextResponse.json(requests);
});
