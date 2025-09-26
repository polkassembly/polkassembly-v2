// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { DEFAULT_LISTING_LIMIT, MAX_LISTING_LIMIT } from '@/_shared/_constants/listingLimit';
import { OnChainDbService } from '@/app/api/_api-services/onchain_db_service';
import { withErrorHandling } from '@/app/api/_api-utils/withErrorHandling';
import { getNetworkFromHeaders } from '@/app/api/_api-utils/getNetworkFromHeaders';
import { EProposalType } from '@/_shared/types';
import { fetchPostData } from '@/app/api/_api-utils/fetchPostData';

export const GET = withErrorHandling(async (req: NextRequest) => {
	const network = await getNetworkFromHeaders();
	const queryParamsSchema = z.object({
		page: z.coerce.number().optional().default(1),
		limit: z.coerce.number().max(MAX_LISTING_LIMIT).optional().default(DEFAULT_LISTING_LIMIT)
	});

	const { page, limit } = queryParamsSchema.parse(Object.fromEntries(req.nextUrl.searchParams));

	const allVotesResult = await OnChainDbService.GetAllFlattenedVotesWithoutFilters({ network, page, limit });

	const votesPromises = allVotesResult.items.map(async (vote) => {
		const postData = await fetchPostData({ network, indexOrHash: vote.proposalIndex.toString(), proposalType: vote.proposalType as EProposalType });
		return {
			...vote,
			postDetails: postData
		};
	});
	const votes = await Promise.all(votesPromises);

	return NextResponse.json({
		items: votes,
		totalCount: allVotesResult.totalCount
	});
});
