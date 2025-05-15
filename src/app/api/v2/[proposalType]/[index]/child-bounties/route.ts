// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { EProposalType, IGenericListingResponse, IOnChainPostInfo, IPost } from '@/_shared/types';
import { OnChainDbService } from '@/app/api/_api-services/onchain_db_service';
import { getNetworkFromHeaders } from '@/app/api/_api-utils/getNetworkFromHeaders';
import { withErrorHandling } from '@api/_api-utils/withErrorHandling';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { OffChainDbService } from '@/app/api/_api-services/offchain_db_service';
import { DEFAULT_LISTING_LIMIT, MAX_LISTING_LIMIT } from '@/_shared/_constants/listingLimit';

export const GET = withErrorHandling(async (req: NextRequest, { params }: { params: Promise<{ proposalType: string; index: string }> }): Promise<NextResponse> => {
	const zodParamsSchema = z.object({
		proposalType: z.literal(EProposalType.BOUNTY),
		index: z.coerce.number()
	});

	const zodQuerySchema = z.object({
		page: z.coerce.number().optional().default(1),
		limit: z.coerce.number().max(MAX_LISTING_LIMIT).optional().default(DEFAULT_LISTING_LIMIT)
	});

	const { index } = zodParamsSchema.parse(await params);
	const { page, limit } = zodQuerySchema.parse(Object.fromEntries(req.nextUrl.searchParams));

	const network = await getNetworkFromHeaders();

	const onchainChildBountiesInfo: IGenericListingResponse<IOnChainPostInfo> = await OnChainDbService.GetChildBountiesByParentBountyIndex({
		network,
		index,
		page,
		limit
	});

	if (!onchainChildBountiesInfo?.totalCount) {
		return NextResponse.json<IGenericListingResponse<IPost>>({
			totalCount: 0,
			items: []
		});
	}

	const offChainDataPromises = onchainChildBountiesInfo.items.map(async (onChainInfo: IOnChainPostInfo) => {
		// get offchain child bounties;
		const offchainPost = await OffChainDbService.GetOffChainPostData({
			network,
			indexOrHash: onChainInfo.index?.toString() ?? '',
			proposalType: EProposalType.CHILD_BOUNTY
		});

		return {
			...offchainPost,
			onChainInfo
		};
	});

	const resolvedPostData = await Promise.allSettled(offChainDataPromises);
	const childBounties: IPost[] = [];

	resolvedPostData.forEach((result) => {
		if (result.status === 'fulfilled') {
			childBounties.push(result.value);
		}
	});

	return NextResponse.json<IGenericListingResponse<IPost>>({
		totalCount: onchainChildBountiesInfo.totalCount,
		items: childBounties
	});
});
