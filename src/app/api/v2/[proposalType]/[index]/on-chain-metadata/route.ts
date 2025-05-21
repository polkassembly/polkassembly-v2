// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ERROR_CODES } from '@/_shared/_constants/errorLiterals';
import { EProposalType, IOnChainMetadata } from '@/_shared/types';
import { OnChainDbService } from '@/app/api/_api-services/onchain_db_service';
import { APIError } from '@/app/api/_api-utils/apiError';
import { getNetworkFromHeaders } from '@/app/api/_api-utils/getNetworkFromHeaders';
import { withErrorHandling } from '@/app/api/_api-utils/withErrorHandling';
import { StatusCodes } from 'http-status-codes';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const zodParamsSchema = z.object({
	proposalType: z.nativeEnum(EProposalType),
	index: z.string()
});

export const GET = withErrorHandling(
	async (req: NextRequest, { params }: { params: Promise<{ proposalType: string; index: string }> }): Promise<NextResponse<IOnChainMetadata>> => {
		const { proposalType, index } = zodParamsSchema.parse(await params);

		const network = await getNetworkFromHeaders();

		const onChainMetadata = await OnChainDbService.GetPostOnChainMetadata({ network, indexOrHash: index, proposalType });

		if (!onChainMetadata) {
			throw new APIError(ERROR_CODES.NOT_FOUND, StatusCodes.NOT_FOUND, 'On-chain metadata not found');
		}

		return NextResponse.json(onChainMetadata);
	}
);
