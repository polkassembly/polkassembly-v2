// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { DEFAULT_LISTING_LIMIT } from '@/_shared/_constants/listingLimit';
import { OnChainDbService } from '@/app/api/_api-services/onchain_db_service';
import { withErrorHandling } from '@/app/api/_api-utils/withErrorHandling';
import { getNetworkFromHeaders } from '@/app/api/_api-utils/getNetworkFromHeaders';
import { EDataSource, ENetwork, EProposalType, IPost, IPublicUser } from '@/_shared/types';
import { ValidatorService } from '@/_shared/_services/validator_service';
import { OffChainDbService } from '@/app/api/_api-services/offchain_db_service';
import { APIError } from '@/app/api/_api-utils/apiError';
import { ERROR_CODES } from '@/_shared/_constants/errorLiterals';
import { StatusCodes } from 'http-status-codes';

async function getPublicUser({ proposer, userId }: { proposer?: string; userId?: number }) {
	let publicUser: IPublicUser | null = null;

	if (proposer && ValidatorService.isValidWeb3Address(proposer)) {
		publicUser = await OffChainDbService.GetPublicUserByAddress(proposer);
	}

	if (!publicUser && userId && ValidatorService.isValidUserId(Number(userId || -1))) {
		publicUser = await OffChainDbService.GetPublicUserById(userId);
	}

	return publicUser;
}

async function fetchPostData({ network, proposalType, indexOrHash }: { network: ENetwork; proposalType: EProposalType; indexOrHash: string }): Promise<IPost> {
	const offChainPostData = await OffChainDbService.GetOffChainPostData({ network, indexOrHash, proposalType: proposalType as EProposalType });

	let post: IPost;

	// if is off-chain post just return the offchain post data
	if (ValidatorService.isValidOffChainProposalType(proposalType)) {
		if (!offChainPostData) {
			throw new APIError(ERROR_CODES.POST_NOT_FOUND_ERROR, StatusCodes.NOT_FOUND);
		}
		post = offChainPostData;
	} else {
		const onChainPostInfo = await OnChainDbService.GetOnChainPostInfo({ network, indexOrHash, proposalType: proposalType as EProposalType });

		if (!onChainPostInfo) {
			throw new APIError(ERROR_CODES.POST_NOT_FOUND_ERROR, StatusCodes.NOT_FOUND);
		}

		post = {
			content: offChainPostData?.content,
			id: offChainPostData?.id,
			index: offChainPostData?.index,
			metrics: offChainPostData?.metrics,
			network: offChainPostData?.network,
			proposalType: offChainPostData?.proposalType,
			title: offChainPostData?.title,
			userId: offChainPostData?.userId,
			dataSource: offChainPostData?.dataSource || EDataSource.OTHER,
			onChainInfo: {
				proposer: onChainPostInfo.proposer
			}
		} as IPost;
	}

	const publicUser = await getPublicUser({ userId: post.userId, proposer: post.onChainInfo?.proposer });

	if (publicUser) {
		post = { ...post, publicUser };
	}

	return post;
}

export const GET = withErrorHandling(async (req: NextRequest) => {
	const network = await getNetworkFromHeaders();
	const queryParamsSchema = z.object({
		page: z.coerce.number().optional().default(1),
		limit: z.coerce.number().max(10000).optional().default(DEFAULT_LISTING_LIMIT)
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
