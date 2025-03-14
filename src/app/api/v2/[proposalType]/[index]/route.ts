// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { AuthService } from '@/app/api/_api-services/auth_service';
import { getReqBody } from '@/app/api/_api-utils/getReqBody';
import { convertContentForFirestoreServer } from '@/app/api/_api-utils/convertContentForFirestoreServer';
import { OffChainDbService } from '@api/_api-services/offchain_db_service';
import { getNetworkFromHeaders } from '@api/_api-utils/getNetworkFromHeaders';
import { withErrorHandling } from '@api/_api-utils/withErrorHandling';
import { ValidatorService } from '@shared/_services/validator_service';
import { EAllowedCommentor, EProposalType } from '@shared/types';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { isValidRichContent } from '@/_shared/_utils/isValidRichContent';
import { RedisService } from '@/app/api/_api-services/redis_service';
import { AIService } from '@/app/api/_api-services/ai_service';
import { fetchPostData } from '@/app/api/_api-utils/fetchPostData';

const SET_COOKIE = 'Set-Cookie';

const zodParamsSchema = z.object({
	proposalType: z.nativeEnum(EProposalType),
	index: z.string()
});

export const GET = withErrorHandling(async (req: NextRequest, { params }: { params: Promise<{ proposalType: string; index: string }> }): Promise<NextResponse> => {
	const { proposalType, index } = zodParamsSchema.parse(await params);
	const network = await getNetworkFromHeaders();

	// Get post data from cache
	let post = await RedisService.GetPostData({ network, proposalType, indexOrHash: index });

	if (post) {
		return NextResponse.json(post);
	}

	post = await fetchPostData({ network, proposalType, indexOrHash: index });

	// fetch and add reactions to post
	const reactions = await OffChainDbService.GetPostReactions({ network, proposalType, indexOrHash: index });
	post = { ...post, reactions };

	// Cache the post data
	await RedisService.SetPostData({ network, proposalType, indexOrHash: index, data: post });

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

	await AIService.UpdatePostSummary({ network, proposalType, indexOrHash: index });

	// Invalidate caches
	await RedisService.DeletePostData({ network, proposalType, indexOrHash: index });
	await RedisService.DeletePostsListing({ network, proposalType });
	await RedisService.DeleteContentSummary({ network, indexOrHash: index, proposalType });

	const response = NextResponse.json({ message: 'Post updated successfully' });
	response.headers.append(SET_COOKIE, await AuthService.GetAccessTokenCookie(newAccessToken));
	response.headers.append(SET_COOKIE, await AuthService.GetRefreshTokenCookie(newRefreshToken));

	return response;
});
