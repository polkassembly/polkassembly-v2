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
import { APIError } from '@/app/api/_api-utils/apiError';
import { ERROR_CODES } from '@/_shared/_constants/errorLiterals';
import { StatusCodes } from 'http-status-codes';

const querySchema = z.object({
	cohortId: z.coerce.number().optional(),
	trackFilter: z.nativeEnum(EDVTrackFilter).optional().default(EDVTrackFilter.DV_TRACKS)
});

export const GET = withErrorHandling(async (req: NextRequest) => {
	const network = await getNetworkFromHeaders();
	const { searchParams } = new URL(req.url);
	const queryParams = Object.fromEntries(searchParams.entries());
	const { cohortId, trackFilter } = querySchema.parse(queryParams);

	let cohort;
	if (cohortId !== undefined) {
		cohort = getDVCohortByIndex(network, cohortId);
	} else {
		cohort = getCurrentDVCohort(network);
	}

	if (!cohort) {
		throw new APIError(ERROR_CODES.NOT_FOUND, StatusCodes.NOT_FOUND, 'No DV cohort found for this network');
	}

	const delegatesWithStats = await DVDelegateService.GetDelegatesWithStats(network, cohort, trackFilter);
	return NextResponse.json({ cohort, delegatesWithStats });
});
