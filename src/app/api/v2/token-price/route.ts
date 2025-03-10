// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { ERROR_CODES } from '@/_shared/_constants/errorLiterals';
import { StatusCodes } from 'http-status-codes';
import { withErrorHandling } from '../../_api-utils/withErrorHandling';
import { PriceService } from '../../_api-services/price_service';
import { getNetworkFromHeaders } from '../../_api-utils/getNetworkFromHeaders';
import { APIError } from '../../_api-utils/apiError';

const zodQuerySchema = z.object({
	symbol: z.string().min(1).max(10)
});

export const GET = withErrorHandling(async (req: NextRequest): Promise<NextResponse> => {
	const network = await getNetworkFromHeaders();
	if (!network) {
		throw new APIError(ERROR_CODES.INVALID_NETWORK, StatusCodes.BAD_REQUEST);
	}
	const { symbol } = zodQuerySchema.parse(Object.fromEntries(req.nextUrl.searchParams));
	const priceData = await PriceService.GetTokenPrice(symbol.toUpperCase());

	return NextResponse.json(priceData);
});
