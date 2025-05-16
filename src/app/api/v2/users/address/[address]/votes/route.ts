// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { ValidatorService } from '@/_shared/_services/validator_service';
import { MAX_LISTING_LIMIT, DEFAULT_LISTING_LIMIT } from '@/_shared/_constants/listingLimit';
import { EGovType, EProposalType } from '@/_shared/types';
import { OnChainDbService } from '@/app/api/_api-services/onchain_db_service';
import { OffChainDbService } from '@/app/api/_api-services/offchain_db_service';
import { getNetworkFromHeaders } from '../../../../../_api-utils/getNetworkFromHeaders';
import { withErrorHandling } from '../../../../../_api-utils/withErrorHandling';

const addressParamsSchema = z.object({
	address: z.string().refine((addr) => ValidatorService.isValidWeb3Address(addr), 'Not a valid web3 address')
});

export const GET = withErrorHandling(async (req: NextRequest, { params }: { params: Promise<{ address: string }> }) => {
	const [{ address }, network] = await Promise.all([addressParamsSchema.parse(await params), getNetworkFromHeaders()]);

	const queryParamsSchema = z.object({
		page: z.coerce.number().optional().default(1),
		limit: z.coerce.number().max(MAX_LISTING_LIMIT).optional().default(DEFAULT_LISTING_LIMIT),
		govType: z.nativeEnum(EGovType)
	});

	const queryParams = Object.fromEntries(req.nextUrl.searchParams.entries());
	const { page, limit, govType } = queryParamsSchema.parse(queryParams);

	const userVotesResult = await OnChainDbService.GetUserVotes({ network, address, page, limit, govType });

	const enrichedVotesPromises = userVotesResult.items.map(async (voteItem) => {
		const offChainPostData = await OffChainDbService.GetOffChainPostData({
			network,
			indexOrHash: voteItem.proposalIndex.toString(),
			proposalType: govType === EGovType.GOV_1 ? EProposalType.REFERENDUM : EProposalType.REFERENDUM_V2
		});

		return {
			...voteItem,
			postDetails: {
				...voteItem.postDetails,
				...offChainPostData
			}
		};
	});

	const enrichedVotesResponses = await Promise.allSettled(enrichedVotesPromises);
	const validVotes = enrichedVotesResponses.map((response) => (response.status === 'fulfilled' ? response.value : null)).filter((vote) => !!vote);

	return NextResponse.json({
		items: validVotes,
		totalCount: userVotesResult.totalCount
	});
});
