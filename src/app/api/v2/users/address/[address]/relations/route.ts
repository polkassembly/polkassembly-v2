// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { ValidatorService } from '@/_shared/_services/validator_service';
import { SubscanOnChainService } from '@/app/api/_api-services/onchain_db_service/subscan_onchain_service';
import { getNetworkFromHeaders } from '../../../../../_api-utils/getNetworkFromHeaders';
import { withErrorHandling } from '../../../../../_api-utils/withErrorHandling';

const zodParamsSchema = z.object({
	address: z.string().refine((addr) => ValidatorService.isValidWeb3Address(addr), 'Not a valid web3 address')
});

export const GET = withErrorHandling(async (req: NextRequest, { params }: { params: Promise<{ address: string }> }) => {
	const [{ address }, network] = await Promise.all([zodParamsSchema.parse(await params), getNetworkFromHeaders()]);

	const addressRelations = await SubscanOnChainService.GetAccountRelations({ address, network });

	return NextResponse.json(addressRelations);
});
