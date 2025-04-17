// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getNetworkFromHeaders } from '../../_api-utils/getNetworkFromHeaders';
import { withErrorHandling } from '../../_api-utils/withErrorHandling';
import { SubscanAddressService } from '../../_api-services/onchain_db_service/subscan_address_service';
import { getReqBody } from '../../_api-utils/getReqBody';

export const POST = withErrorHandling(async (req: NextRequest) => {
	const zodBodySchema = z.object({
		address: z.string()
	});

	const bodyRaw = await getReqBody(req);

	const { address } = zodBodySchema.parse(bodyRaw);
	const network = await getNetworkFromHeaders();

	const multisigAccounts = await SubscanAddressService.GetAccountsFromAddress({ address, network });

	return NextResponse.json(multisigAccounts);
});
