// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { NextRequest, NextResponse } from 'next/server';
import { OGTrackerService } from '@/app/api/_api-services/external_api_service/ogtracker_service';
import { withErrorHandling } from '@/app/api/_api-utils/withErrorHandling';
import { APIError } from '@/app/api/_api-utils/apiError';
import { ERROR_CODES } from '@/_shared/_constants/errorLiterals';
import { StatusCodes } from 'http-status-codes';

export const GET = withErrorHandling(async (req: NextRequest) => {
	const { searchParams } = req.nextUrl;
	const refNum = searchParams.get('refNum');

	if (!refNum) {
		throw new APIError(ERROR_CODES.INVALID_PARAMS_ERROR, StatusCodes.BAD_REQUEST, 'Missing refNum parameter');
	}

	const data = await OGTrackerService.getOGTrackerData({ refNum });
	return NextResponse.json(data);
});
