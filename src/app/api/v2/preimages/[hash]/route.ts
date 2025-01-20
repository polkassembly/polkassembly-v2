// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ERROR_CODES } from '@/_shared/_constants/errorLiterals';
import { OnChainDbService } from '@/app/api/_api-services/onchain_db_service';
import { APIError } from '@/app/api/_api-utils/apiError';
import { getNetworkFromHeaders } from '@/app/api/_api-utils/getNetworkFromHeaders';
import { withErrorHandling } from '@/app/api/_api-utils/withErrorHandling';
import { StatusCodes } from 'http-status-codes';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const zodParamsSchema = z.object({
	hash: z.string()
});

export const GET = withErrorHandling(async (req: NextRequest, { params }) => {
	const { hash } = zodParamsSchema.parse(await params);

	const network = await getNetworkFromHeaders();

	const preimage = await OnChainDbService.GetPreimageByHash({ network, hash });

	if (!preimage) {
		throw new APIError(ERROR_CODES.NOT_FOUND, StatusCodes.NOT_FOUND);
	}

	// 3. return the data
	return NextResponse.json(preimage);
});
