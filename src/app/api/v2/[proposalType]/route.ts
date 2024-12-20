// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { OffChainDbService } from '@api/_api-services/offchain_db_service';
import { OnChainDbService } from '@api/_api-services/onchain_db_service';
import { getNetworkFromHeaders } from '@api/_api-utils/getNetworkFromHeaders';
import { withErrorHandling } from '@api/_api-utils/withErrorHandling';
import { DEFAULT_LISTING_LIMIT, MAX_LISTING_LIMIT } from '@shared/_constants/listingLimit';
import { ValidatorService } from '@shared/_services/validator_service';
import { EDataSource, EPostOrigin, EProposalStatus, EProposalType, IOnChainPostListingResponse, IPostListing } from '@shared/types';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

export const GET = withErrorHandling(async (req: NextRequest, { params }) => {
	const zodParamsSchema = z.object({
		proposalType: z.nativeEnum(EProposalType)
	});

	const { proposalType } = zodParamsSchema.parse(await params);

	const zodQuerySchema = z.object({
		page: z.coerce.number().optional().default(1),
		limit: z.coerce.number().max(MAX_LISTING_LIMIT).optional().default(DEFAULT_LISTING_LIMIT),
		statuses: z.array(z.nativeEnum(EProposalStatus)).optional(),
		origins: z.array(z.nativeEnum(EPostOrigin)).optional()
	});

	const searchParamsObject = Object.fromEntries(req.nextUrl.searchParams.entries());

	const { page, limit, statuses, origins } = zodQuerySchema.parse(searchParamsObject);

	const network = await getNetworkFromHeaders();

	let posts: IPostListing[] = [];
	let totalCount = 0;

	// 1. if proposal type is on-chain, get on-chain posts from onchain_db_service, then get the corresponding off-chain data from offchain_db_service for each on-chain post
	if (ValidatorService.isValidOnChainProposalType(proposalType)) {
		const onChainPostsListingResponse = await OnChainDbService.GetOnChainPostsListing({ network, proposalType, limit, page, statuses, origins });

		// Fetch off-chain data
		const offChainDataPromises = onChainPostsListingResponse.posts.map((postInfo) => {
			return OffChainDbService.GetOffChainPostData({
				network,
				indexOrHash: proposalType !== EProposalType.TIP ? postInfo.index.toString() : postInfo.hash,
				proposalType,
				proposer: postInfo.proposer || ''
			});
		});

		const offChainData = await Promise.all(offChainDataPromises);

		// Merge on-chain and off-chain data
		posts = onChainPostsListingResponse.posts.map((postInfo, index) => ({
			...offChainData[Number(index)],
			dataSource: offChainData[Number(index)]?.dataSource || EDataSource.POLKASSEMBLY,
			network,
			proposalType,
			onChainInfo: postInfo
		}));

		totalCount = onChainPostsListingResponse.totalCount;
	} else {
		// 2. if proposal type is off-chain, get off-chain posts from offchain_db_service
		posts = await OffChainDbService.GetOffChainPostsListing({
			network,
			proposalType,
			limit,
			page
		});

		totalCount = await OffChainDbService.GetTotalOffChainPostsCount({ network, proposalType });
	}

	const response: IOnChainPostListingResponse = {
		posts,
		totalCount
	};

	// 3. return the data
	return NextResponse.json(response);
});
