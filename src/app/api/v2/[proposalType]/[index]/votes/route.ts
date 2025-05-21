// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { DEFAULT_LISTING_LIMIT, MAX_LISTING_LIMIT } from '@/_shared/_constants/listingLimit';
import { ON_CHAIN_PROPOSAL_TYPES } from '@/_shared/_constants/onChainProposalTypes';
import { EProposalType, EVoteDecision, EVoteSortOptions } from '@/_shared/types';
import { OnChainDbService } from '@/app/api/_api-services/onchain_db_service';
import { getNetworkFromHeaders } from '@/app/api/_api-utils/getNetworkFromHeaders';
import { withErrorHandling } from '@/app/api/_api-utils/withErrorHandling';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const zodParamsSchema = z.object({
	proposalType: z.nativeEnum(EProposalType).refine((val) => ON_CHAIN_PROPOSAL_TYPES.includes(val), {
		message: `Invalid proposal type. Must be one of: ${ON_CHAIN_PROPOSAL_TYPES.join(', ')}`
	}),
	index: z.string()
});

export const GET = withErrorHandling(async (req: NextRequest, { params }: { params: Promise<{ proposalType: string; index: string }> }): Promise<NextResponse> => {
	const { proposalType, index } = zodParamsSchema.parse(await params);

	const zodQuerySchema = z.object({
		page: z.coerce.number().optional().default(1),
		limit: z.coerce.number().max(MAX_LISTING_LIMIT).optional().default(DEFAULT_LISTING_LIMIT),
		decision: z
			.string()
			.transform((val) => {
				return !val || !Object.values(EVoteDecision).includes(val as EVoteDecision) ? undefined : (val as EVoteDecision);
			})
			.optional(),
		orderBy: z.nativeEnum(EVoteSortOptions).optional()
	});

	const { page, limit, decision, orderBy } = zodQuerySchema.parse(Object.fromEntries(req.nextUrl.searchParams));

	const network = await getNetworkFromHeaders();

	const voteData = await OnChainDbService.GetPostVoteData({ network, proposalType, indexOrHash: index, page, limit, decision, orderBy });

	return NextResponse.json(voteData);
});
