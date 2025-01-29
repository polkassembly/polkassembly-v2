// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { AuthService } from '@/app/api/_api-services/auth_service';
import { getReqBody } from '@/app/api/_api-utils/getReqBody';
import { convertContentForFirestoreServer } from '@/app/api/_api-utils/convertContentForFirestoreServer';
import { OffChainDbService } from '@api/_api-services/offchain_db_service';
import { OnChainDbService } from '@api/_api-services/onchain_db_service';
import { APIError } from '@api/_api-utils/apiError';
import { getNetworkFromHeaders } from '@api/_api-utils/getNetworkFromHeaders';
import { withErrorHandling } from '@api/_api-utils/withErrorHandling';
import { ERROR_CODES } from '@shared/_constants/errorLiterals';
import { ValidatorService } from '@shared/_services/validator_service';
import { EAllowedCommentor, EDataSource, ENetwork, EProposalType, IPost } from '@shared/types';
import { StatusCodes } from 'http-status-codes';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { isValidRichContent } from '@/_shared/_utils/isValidRichContent';
import { RedisService } from '@/app/api/_api-services/redis_service';
import { deepParseJson } from 'deep-parse-json';

const zodParamsSchema = z.object({
	proposalType: z.nativeEnum(EProposalType),
	index: z.string()
});

export const GET = withErrorHandling(async (req: NextRequest, { params }: { params: Promise<{ proposalType: string; index: string }> }): Promise<NextResponse> => {
	const { proposalType, index } = zodParamsSchema.parse(await params);

	const network = await getNetworkFromHeaders();

	// Try to get from cache first
	const cachedData = await RedisService.GetPostData({ network, proposalType, indexOrHash: index });
	if (cachedData) {
		return NextResponse.json(deepParseJson(cachedData));
	}

	const offChainPostData = await OffChainDbService.GetOffChainPostData({ network, indexOrHash: index, proposalType: proposalType as EProposalType });

	// if is off-chain post just return the offchain post data
	if (ValidatorService.isValidOffChainProposalType(proposalType)) {
		if (!offChainPostData) {
			throw new APIError(ERROR_CODES.POST_NOT_FOUND_ERROR, StatusCodes.NOT_FOUND);
		}

		// Cache the response
		await RedisService.SetPostData({ network, proposalType, indexOrHash: index, data: JSON.stringify(offChainPostData) });

		return NextResponse.json(offChainPostData);
	}

	// is on-chain post
	const onChainPostInfo = await OnChainDbService.GetOnChainPostInfo({ network, indexOrHash: index, proposalType: proposalType as EProposalType });

	if (!onChainPostInfo) {
		throw new APIError(ERROR_CODES.POST_NOT_FOUND_ERROR, StatusCodes.NOT_FOUND);
	}

	const post: IPost = {
		...offChainPostData,
		dataSource: offChainPostData?.dataSource || EDataSource.POLKASSEMBLY,
		proposalType: proposalType as EProposalType,
		network: network as ENetwork,
		onChainInfo: onChainPostInfo
	};

	// Cache the response
	await RedisService.SetPostData({ network, proposalType, indexOrHash: index, data: JSON.stringify(post) });

	return NextResponse.json(post);
});

// update post
export const PATCH = withErrorHandling(async (req: NextRequest, { params }: { params: Promise<{ proposalType: string; index: string }> }): Promise<NextResponse> => {
	const { proposalType, index } = zodParamsSchema.parse(await params);

	const network = await getNetworkFromHeaders();

	const { newAccessToken, newRefreshToken } = await AuthService.ValidateAuthAndRefreshTokens();

	const zodBodySchema = z.object({
		title: z.string().min(1, 'Title is required'),
		content: z.union([z.custom<Record<string, unknown>>(), z.string()]).refine(isValidRichContent, 'Invalid content'),
		allowedCommentor: z.nativeEnum(EAllowedCommentor).optional().default(EAllowedCommentor.ALL)
	});

	const { content, title, allowedCommentor } = zodBodySchema.parse(await getReqBody(req));

	const formattedContent = convertContentForFirestoreServer(content);

	if (ValidatorService.isValidOffChainProposalType(proposalType)) {
		await OffChainDbService.UpdateOffChainPost({
			network,
			indexOrHash: index,
			proposalType: proposalType as EProposalType,
			userId: AuthService.GetUserIdFromAccessToken(newAccessToken),
			content: formattedContent,
			title,
			allowedCommentor
		});
	} else {
		await OffChainDbService.UpdateOnChainPost({
			network,
			indexOrHash: index,
			proposalType: proposalType as EProposalType,
			userId: AuthService.GetUserIdFromAccessToken(newAccessToken),
			content: formattedContent,
			title,
			allowedCommentor
		});
	}

	// Invalidate caches
	await RedisService.DeletePostData({ network, proposalType, indexOrHash: index });
	await RedisService.DeletePostsListing({ network, proposalType });

	const response = NextResponse.json({ message: 'Post updated successfully' });
	response.headers.append('Set-Cookie', await AuthService.GetAccessTokenCookie(newAccessToken));
	response.headers.append('Set-Cookie', await AuthService.GetRefreshTokenCookie(newRefreshToken));

	return response;
});
