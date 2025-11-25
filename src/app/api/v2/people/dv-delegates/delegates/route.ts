// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { getCurrentDVCohort, getDVCohortByIndex } from '@/_shared/_utils/dvDelegateUtils';
import { EDVTrackFilter } from '@/_shared/types';
import { getNetworkFromHeaders } from '@/app/api/_api-utils/getNetworkFromHeaders';
import { withErrorHandling } from '@/app/api/_api-utils/withErrorHandling';
import { NextRequest, NextResponse } from 'next/server';
import { DVDelegateService } from '@/app/api/_api-services/dv_delegate_service';
import { z } from 'zod';

const querySchema = z.object({
	cohortIndex: z.coerce.number().optional(),
	cohortId: z.coerce.number().optional(),
	trackFilter: z.nativeEnum(EDVTrackFilter).optional().default(EDVTrackFilter.DV_TRACKS)
});

export const GET = withErrorHandling(async (req: NextRequest) => {
	const network = await getNetworkFromHeaders();

	const { searchParams } = new URL(req.url);
	const queryParams = Object.fromEntries(searchParams.entries());
	const { cohortIndex: cohortIndexParam, cohortId, trackFilter } = querySchema.parse(queryParams);

	const cohortParam = cohortId ?? cohortIndexParam;

	let cohort;
	if (cohortParam !== undefined) {
		cohort = getDVCohortByIndex(network, cohortParam);
	} else {
		cohort = getCurrentDVCohort(network);
	}

	if (!cohort) {
		return NextResponse.json({ error: 'No DV cohort found for this network' }, { status: 404 });
	}

	const delegatesWithStats = await DVDelegateService.getDelegatesWithStats(network, cohort, trackFilter);
	return NextResponse.json({ cohort, delegatesWithStats });
});
