// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ValidatorService } from '@/_shared/_services/validator_service';
import { EProposalType, IGenericListingResponse, IOnChainPostListing, IPostListing, IUserPosts } from '@/_shared/types';
import { getNetworkFromHeaders } from '@/app/api/_api-utils/getNetworkFromHeaders';
import { withErrorHandling } from '@/app/api/_api-utils/withErrorHandling';
import { OnChainDbService } from '@/app/api/_api-services/onchain_db_service';
import { OffChainDbService } from '@/app/api/_api-services/offchain_db_service';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { MAX_LISTING_LIMIT, DEFAULT_LISTING_LIMIT } from '@/_shared/_constants/listingLimit';

const addressParamsSchema = z.object({
	address: z.string().refine((walletAddress) => ValidatorService.isValidWeb3Address(walletAddress), 'Not a valid web3 address')
});

// get posts created by a user's address
export const GET = withErrorHandling(async (request: NextRequest, { params }: { params: Promise<{ address: string }> }) => {
	const [{ address: walletAddress }, networkName] = await Promise.all([addressParamsSchema.parse(await params), getNetworkFromHeaders()]);

	const paginationParamsSchema = z.object({
		page: z.coerce.number().optional().default(1),
		limit: z.coerce.number().max(MAX_LISTING_LIMIT).optional().default(DEFAULT_LISTING_LIMIT),
		proposalType: z.literal(EProposalType.DISCUSSION).or(z.literal(EProposalType.REFERENDUM_V2)).optional()
	});

	const requestQueryParams = Object.fromEntries(request.nextUrl.searchParams.entries());
	const { page: pageNumber, limit: pageSize, proposalType: selectedProposalType } = paginationParamsSchema.parse(requestQueryParams);

	const userProfile = await OffChainDbService.GetPublicUserByAddress(walletAddress);

	let offChainListingResponse: IGenericListingResponse<IPostListing> = {
		items: [],
		totalCount: 0
	};

	if (userProfile) {
		// Fetch off-chain posts
		offChainListingResponse = await OffChainDbService.GetPostsByUserId({
			network: networkName,
			userId: userProfile.id,
			page: pageNumber,
			limit: pageSize,
			proposalType: EProposalType.DISCUSSION
		});
	}

	// Fetch on-chain posts
	const onChainListingResponse: IGenericListingResponse<IOnChainPostListing> = await OnChainDbService.GetOnChainPostsByProposer({
		network: networkName,
		proposer: walletAddress,
		page: pageNumber,
		limit: pageSize,
		proposalType: (selectedProposalType as EProposalType) ?? EProposalType.REFERENDUM_V2
	});

	const onChainPostsWithOffChainData = onChainListingResponse.items.map(async (onChainPost) => {
		const offChainPostData = await OffChainDbService.GetOffChainPostData({
			network: networkName,
			indexOrHash: onChainPost.index?.toString() ?? '',
			proposalType: (selectedProposalType as EProposalType) ?? EProposalType.REFERENDUM_V2
		});
		return {
			...offChainPostData,
			onChainInfo: {
				...onChainPost,
				type: selectedProposalType ?? EProposalType.REFERENDUM_V2
			}
		};
	});

	const resolvedOnChainPosts = await Promise.allSettled(onChainPostsWithOffChainData);

	const onChainResponse: IGenericListingResponse<IPostListing> = {
		items: resolvedOnChainPosts.map((postResult) => (postResult.status === 'fulfilled' ? postResult.value : null))?.filter((post) => post !== null) as IPostListing[],
		totalCount: onChainListingResponse.totalCount
	};

	return NextResponse.json({
		offchainPostsResponse: offChainListingResponse,
		onchainPostsResponse: onChainResponse
	} as IUserPosts);
});
