// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ON_CHAIN_PROPOSAL_TYPES } from '@/_shared/_constants/onChainProposalTypes';
import { EProposalType } from '@/_shared/types';
import { OnChainDbService } from '@/app/api/_api-services/onchain_db_service';
import { getNetworkFromHeaders } from '@/app/api/_api-utils/getNetworkFromHeaders';
import { withErrorHandling } from '@/app/api/_api-utils/withErrorHandling';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const zodParamsSchema = z.object({
	proposalType: z.nativeEnum(EProposalType).refine((val) => ON_CHAIN_PROPOSAL_TYPES.includes(val), {
		message: `Invalid proposal type. Must be one of: ${ON_CHAIN_PROPOSAL_TYPES.join(', ')}`
	}),
	index: z.coerce.number()
});

export const GET = withErrorHandling(async (req: NextRequest, { params }: { params: Promise<{ proposalType: string; index: string }> }): Promise<NextResponse> => {
	const { index } = zodParamsSchema.parse(await params);

	const network = await getNetworkFromHeaders();

	const voteData = await OnChainDbService.GetPostVoteCurves({ network, index });

	return NextResponse.json(voteData);
});
