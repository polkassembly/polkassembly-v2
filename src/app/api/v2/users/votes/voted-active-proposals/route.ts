// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandling } from '@/app/api/_api-utils/withErrorHandling';
import { z } from 'zod';
import { ValidatorService } from '@/_shared/_services/validator_service';
import { OnChainDbService } from '@/app/api/_api-services/onchain_db_service';
import { getNetworkFromHeaders } from '@/app/api/_api-utils/getNetworkFromHeaders';
import { getEncodedAddress } from '@/_shared/_utils/getEncodedAddress';

export const GET = withErrorHandling(async (req: NextRequest): Promise<NextResponse> => {
	const zodQuerySchema = z.object({
		address: z.preprocess(
			(val) => (Array.isArray(val) ? val : typeof val === 'string' ? [val] : undefined),
			z.array(z.string().refine(ValidatorService.isValidSubstrateAddress, { message: 'Invalid address' }))
		),
		last15days: z.coerce.boolean().optional().default(false)
	});
	const searchParamsObject = Object.fromEntries(Array.from(req.nextUrl.searchParams.entries()).map(([key]) => [key, req.nextUrl.searchParams.getAll(key)]));

	const { address: addresses, last15days } = zodQuerySchema.parse(searchParamsObject);

	const network = await getNetworkFromHeaders();

	const encodedAddresses = addresses.map((address) => getEncodedAddress(address, network) || '').filter(Boolean);

	const { activeProposalsCount, votedProposalsCount } = await OnChainDbService.GetActiveVotedProposalsCount({
		addresses: encodedAddresses,
		network,
		last15days
	});

	return NextResponse.json({ activeProposalsCount, votedProposalsCount });
});
