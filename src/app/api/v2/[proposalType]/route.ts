// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { OffChainDbService } from '@api/_api-services/offchain_db_service';
import { OnChainDbService } from '@api/_api-services/onchain_db_service';
import { getNetworkFromHeaders } from '@api/_api-utils/getNetworkFromHeaders';
import { withErrorHandling } from '@api/_api-utils/withErrorHandling';
import { DEFAULT_LISTING_LIMIT, MAX_LISTING_LIMIT } from '@shared/_constants/listingLimit';
import { ValidatorService } from '@shared/_services/validator_service';
import { EDataSource, EPostOrigin, EProposalStatus, EProposalType, IOffChainPost, IOnChainPostListing, IOnChainPostListingResponse, IPostListing } from '@shared/types';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { ERROR_CODES } from '@/_shared/_constants/errorLiterals';
import { StatusCodes } from 'http-status-codes';
import { APIError } from '../../_api-utils/apiError';
import { AuthService } from '../../_api-services/auth_service';
import { getReqBody } from '../../_api-utils/getReqBody';

const zodParamsSchema = z.object({
	proposalType: z.nativeEnum(EProposalType)
});

export const GET = withErrorHandling(async (req: NextRequest, { params }) => {
	const { proposalType } = zodParamsSchema.parse(await params);

	const zodQuerySchema = z.object({
		page: z.coerce.number().optional().default(1),
		limit: z.coerce.number().max(MAX_LISTING_LIMIT).optional().default(DEFAULT_LISTING_LIMIT),
		status: z.preprocess((val) => (Array.isArray(val) ? val : typeof val === 'string' ? [val] : undefined), z.array(z.nativeEnum(EProposalStatus))).optional(),
		origin: z.preprocess((val) => (Array.isArray(val) ? val : typeof val === 'string' ? [val] : undefined), z.array(z.nativeEnum(EPostOrigin))).optional(),
		tags: z.preprocess((val) => (Array.isArray(val) ? val : typeof val === 'string' ? [val] : undefined), z.array(z.string()).max(30)).optional() // max 30 tags because of firestore query limit
	});

	const searchParamsObject = Object.fromEntries(Array.from(req.nextUrl.searchParams.entries()).map(([key]) => [key, req.nextUrl.searchParams.getAll(key)]));

	const { page, limit, status: statuses, origin: origins, tags } = zodQuerySchema.parse(searchParamsObject);

	const network = await getNetworkFromHeaders();

	let posts: IPostListing[] = [];
	let totalCount = 0;

	// 1. if proposal type is on-chain, get on-chain posts from onchain_db_service, then get the corresponding off-chain data from offchain_db_service for each on-chain post
	if (ValidatorService.isValidOnChainProposalType(proposalType) && !tags?.length) {
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
	} else if (ValidatorService.isValidOnChainProposalType(proposalType) && tags?.length) {
		// 2. if proposal type is on-chain and tags are provided, get on-chain posts from offchain_db_service, then get the corresponding on-chain data from onchain_db_service for each on-chain post
		const postsOffchainData = await OffChainDbService.GetOffChainPostsListing({
			network,
			proposalType,
			limit,
			page,
			tags
		});

		totalCount = await OffChainDbService.GetTotalOffChainPostsCount({ network, proposalType, tags });

		const postIdentifier: keyof IOffChainPost = proposalType === EProposalType.TIP ? 'hash' : 'index';

		// get onchain data for each post
		const onChainDataPromises = postsOffchainData.map((post) => {
			if (!post[postIdentifier as keyof IOffChainPost]) {
				throw new APIError(ERROR_CODES.INVALID_PARAMS_ERROR, StatusCodes.BAD_REQUEST, `${postIdentifier} not found for the ${proposalType} proposal type and post id ${post.id}`);
			}

			return OnChainDbService.GetOnChainPostInfo({ network, proposalType, indexOrHash: post[postIdentifier as keyof IOffChainPost]?.toString() || '' });
		});

		const onChainData = await Promise.all(onChainDataPromises);

		posts = postsOffchainData.map((post, index) => {
			const onChainPostInfo = onChainData[Number(index)] || undefined;
			const onChainListingInfo: IOnChainPostListing | undefined = onChainPostInfo
				? {
						createdAt: onChainPostInfo.createdAt || post.createdAt || new Date(),
						proposer: onChainPostInfo.proposer,
						status: onChainPostInfo.status,
						description: onChainPostInfo.description || '',
						index: onChainPostInfo.index || post.index || 0,
						origin: onChainPostInfo.origin || '',
						type: proposalType,
						hash: onChainPostInfo.hash || post.hash || ''
					}
				: undefined;
			return {
				...post,
				onChainInfo: onChainListingInfo
			};
		});
	} else {
		// 3. if proposal type is off-chain, get off-chain posts from offchain_db_service
		posts = await OffChainDbService.GetOffChainPostsListing({
			network,
			proposalType,
			limit,
			page,
			tags
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

export const POST = withErrorHandling(async (req: NextRequest, { params }: { params: Promise<{ proposalType: string }> }): Promise<NextResponse> => {
	const { proposalType } = zodParamsSchema.parse(await params);

	const network = await getNetworkFromHeaders();

	const { newAccessToken, newRefreshToken } = await AuthService.ValidateAuthAndRefreshTokens();

	const zodBodySchema = z.object({
		content: z.string().min(1, 'Content is required')
	});

	const { content } = zodBodySchema.parse(await getReqBody(req));

	if (ValidatorService.isValidOnChainProposalType(proposalType) || !ValidatorService.isValidOffChainProposalType(proposalType)) {
		throw new APIError(ERROR_CODES.INVALID_PARAMS_ERROR, StatusCodes.BAD_REQUEST, 'Invalid proposal type, cannot create on-chain posts, you can only edit them.');
	}

	const { id, indexOrHash } = await OffChainDbService.CreateOffChainPost({ network, proposalType, userId: AuthService.GetUserIdFromAccessToken(newAccessToken), content });

	const response = NextResponse.json({ message: 'Post created successfully', data: { id, index: Number(indexOrHash) } });
	response.headers.append('Set-Cookie', await AuthService.GetAccessTokenCookie(newAccessToken));
	response.headers.append('Set-Cookie', await AuthService.GetRefreshTokenCookie(newRefreshToken));

	return response;
});
