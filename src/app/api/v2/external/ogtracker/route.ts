// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { NextRequest, NextResponse } from 'next/server';
import { OGTrackerService } from '@/app/api/_api-services/external_api_service/ogtracker_service';
import { withErrorHandling } from '@/app/api/_api-utils/withErrorHandling';
import { APIError } from '@/app/api/_api-utils/apiError';
import { ERROR_CODES } from '@/_shared/_constants/errorLiterals';
import { StatusCodes } from 'http-status-codes';
import { OG_TRACKER_API_KEY } from '@/app/api/_api-constants/apiEnvVars';

export const GET = withErrorHandling(async (req: NextRequest) => {
	const { searchParams } = req.nextUrl;
	const refNum = searchParams.get('refNum');

	if (!refNum) {
		throw new APIError(ERROR_CODES.INVALID_PARAMS_ERROR, StatusCodes.BAD_REQUEST, 'Missing refNum parameter');
	}

	if (!OG_TRACKER_API_KEY) {
		throw new APIError(ERROR_CODES.API_FETCH_ERROR, StatusCodes.NOT_FOUND, 'OGTracker service is not configured');
	}

	const data = await OGTrackerService.getOGTrackerData({ refNum });
	return NextResponse.json(data);
});
