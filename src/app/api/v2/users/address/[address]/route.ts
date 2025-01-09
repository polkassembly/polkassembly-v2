// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ERROR_CODES, ERROR_MESSAGES } from '@/_shared/_constants/errorLiterals';
import { ValidatorService } from '@/_shared/_services/validator_service';
import { OffChainDbService } from '@/app/api/_api-services/offchain_db_service';
import { APIError } from '@/app/api/_api-utils/apiError';
import { withErrorHandling } from '@/app/api/_api-utils/withErrorHandling';
import { StatusCodes } from 'http-status-codes';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const zodParamsSchema = z.object({
	address: z.string().refine((address) => ValidatorService.isValidWeb3Address(address), { message: 'Address must be a valid web3 address' })
});

export const GET = withErrorHandling(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> => {
	const { address } = zodParamsSchema.parse(await params);

	const user = await OffChainDbService.GetPublicUserByAddress(address);

	if (!user) {
		throw new APIError(ERROR_CODES.NOT_FOUND, StatusCodes.NOT_FOUND, ERROR_MESSAGES.NOT_FOUND);
	}

	return NextResponse.json(user);
});
