// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextRequest, NextResponse } from 'next/server';
import { OffChainDbService } from '@/app/api/_api-services/offchain_db_service';
import { getNetworkFromHeaders } from '@/app/api/_api-utils/getNetworkFromHeaders';
import { withErrorHandling } from '@/app/api/_api-utils/withErrorHandling';
import { z } from 'zod';
import { IMessageResponse, ITreasuryStats } from '@/_shared/types';
import { fetchLatestTreasuryStats } from '@/app/api/_api-utils/fetchLatestTreasuryStats';
import { ERROR_CODES } from '@/_shared/_constants/errorLiterals';
import { APIError } from '@/app/api/_api-utils/apiError';
import { StatusCodes } from 'http-status-codes';
import { TOOLS_PASSPHRASE } from '@/app/api/_api-constants/apiEnvVars';
import { headers } from 'next/headers';
import { DEFAULT_LISTING_LIMIT, MAX_LISTING_LIMIT } from '@/_shared/_constants/listingLimit';

export const maxDuration = 300;

const zodQuerySchema = z.object({
	from: z.date().optional(),
	to: z.date().optional(),
	limit: z.coerce.number().max(MAX_LISTING_LIMIT).optional().default(DEFAULT_LISTING_LIMIT),
	page: z.coerce.number().optional().default(1)
});

export const GET = withErrorHandling(async (req: NextRequest): Promise<NextResponse<ITreasuryStats[]>> => {
	const network = await getNetworkFromHeaders();
	const { from, to, limit, page } = zodQuerySchema.parse(Object.fromEntries(req.nextUrl.searchParams));
	const treasuryStats = await OffChainDbService.GetTreasuryStats({ network, from, to, limit, page });
	return NextResponse.json(treasuryStats);
});

export const POST = withErrorHandling(async (): Promise<NextResponse<IMessageResponse>> => {
	const readonlyHeaders = await headers();
	const passphrase = readonlyHeaders.get('x-tools-passphrase');

	if (!passphrase?.trim() || passphrase !== TOOLS_PASSPHRASE) {
		throw new APIError(ERROR_CODES.UNAUTHORIZED, StatusCodes.UNAUTHORIZED, 'Unauthorized');
	}

	const network = await getNetworkFromHeaders();

	const treasuryStats = await fetchLatestTreasuryStats(network);

	if (!treasuryStats) {
		throw new APIError(ERROR_CODES.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR, 'Error in fetching treasury stats.');
	}

	await OffChainDbService.SaveTreasuryStats({ treasuryStats });

	return NextResponse.json({ message: 'Treasury stats fetched successfully' });
});
