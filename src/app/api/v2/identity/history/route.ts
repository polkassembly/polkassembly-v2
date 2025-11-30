// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { fetchIdentityTimelineFromStatescan } from '@/app/_client-utils/identityUtils';
import { withErrorHandling } from '@/app/api/_api-utils/withErrorHandling';
import { getNetworkFromHeaders } from '@/app/api/_api-utils/getNetworkFromHeaders';
import { getEncodedAddress } from '@/_shared/_utils/getEncodedAddress';

const zodQuerySchema = z.object({
	address: z.string()
});

export const GET = withErrorHandling(async (req: NextRequest) => {
	const network = await getNetworkFromHeaders();
	const { searchParams } = req.nextUrl;
	const params = Object.fromEntries(searchParams.entries());

	const { address } = zodQuerySchema.parse(params);
	const encodedAddress = getEncodedAddress(address, network);
	if (!encodedAddress) return NextResponse.json({ error: 'Invalid address' }, { status: 400 });
	const history = await fetchIdentityTimelineFromStatescan(network, encodedAddress);

	return NextResponse.json({
		address: encodedAddress,
		history,
		totalFound: history.length,
		source: 'statescan'
	});
});
