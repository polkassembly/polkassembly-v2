// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withErrorHandling } from '../../_api-utils/withErrorHandling';
import { PriceService } from '../../_api-services/price_service';

const zodQuerySchema = z.object({
	symbol: z.string().min(1).max(10)
});

export const GET = withErrorHandling(async (req: NextRequest) => {
	const { symbol } = zodQuerySchema.parse(Object.fromEntries(req.nextUrl.searchParams));

	const priceData = await PriceService.GetTokenPrice(symbol.toUpperCase());

	return NextResponse.json(priceData);
});
