// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextResponse, NextRequest } from 'next/server';
import { withErrorHandling } from '@/app/api/_api-utils/withErrorHandling';
import { getNetworkFromHeaders } from '@/app/api/_api-utils/getNetworkFromHeaders';
import { IdentityService } from '@/app/_client-services/identity_service';
import { getRegistrarsWithStats } from '@/app/_client-utils/identityUtils';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { ENetwork } from '@/_shared/types';
import { z } from 'zod';

export const GET = withErrorHandling(async (req: NextRequest) => {
	const zodQuerySchema = z.object({
		search: z.string().optional().default('')
	});
	const { search } = zodQuerySchema.parse(Object.fromEntries(req.nextUrl.searchParams));
	const network = await getNetworkFromHeaders();

	// Check if network supports People Chain
	if (!NETWORKS_DETAILS[network as ENetwork]?.peopleChainDetails) {
		return NextResponse.json({
			items: [],
			totalCount: 0
		});
	}

	const identityService = await IdentityService.Init(network as ENetwork);
	const registrarsData = await identityService.getRegistrars();
	const judgements = await identityService.getAllIdentityJudgements();
	const registrars = getRegistrarsWithStats({ registrars: registrarsData, judgements, search });

	return NextResponse.json({
		items: registrars,
		totalCount: registrars.length
	});
});
