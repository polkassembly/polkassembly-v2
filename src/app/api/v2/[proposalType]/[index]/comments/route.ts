// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ECommentSentiment, EProposalType, IComment } from '@/_shared/types';
import { AuthService } from '@/app/api/_api-services/auth_service';
import { OffChainDbService } from '@/app/api/_api-services/offchain_db_service';
import { getNetworkFromHeaders } from '@/app/api/_api-utils/getNetworkFromHeaders';
import { getReqBody } from '@/app/api/_api-utils/getReqBody';
import { withErrorHandling } from '@api/_api-utils/withErrorHandling';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { RedisService } from '@/app/api/_api-services/redis_service';
import { AIService } from '@/app/api/_api-services/ai_service';
import { fetchCommentsVoteData } from '@/app/api/_api-utils/fetchCommentsVoteData.server';

const zodParamsSchema = z.object({
	proposalType: z.nativeEnum(EProposalType),
	index: z.string()
});

export const GET = withErrorHandling(async (req: NextRequest, { params }: { params: Promise<{ proposalType: string; index: string }> }): Promise<NextResponse> => {
	const { proposalType, index } = zodParamsSchema.parse(await params);

	const network = await getNetworkFromHeaders();

	const comments = await OffChainDbService.GetPostComments({ network, indexOrHash: index, proposalType: proposalType as EProposalType });

	const commentsWithVoteData = await fetchCommentsVoteData({ comments, network, proposalType, index });

	return NextResponse.json(commentsWithVoteData);
});

// add comment
export const POST = withErrorHandling(async (req: NextRequest, { params }: { params: Promise<{ proposalType: string; index: string }> }): Promise<NextResponse> => {
	const { proposalType, index } = zodParamsSchema.parse(await params);

	const network = await getNetworkFromHeaders();

	// 1. check if user is authenticated
	const { newAccessToken, newRefreshToken } = await AuthService.ValidateAuthAndRefreshTokens();

	// 2. read and validate the request body
	const zodBodySchema = z.object({
		content: z.string().min(1, 'Content is required'),
		parentCommentId: z.string().optional(),
		sentiment: z.nativeEnum(ECommentSentiment).optional()
	});

	const { content, parentCommentId, sentiment } = zodBodySchema.parse(await getReqBody(req));

	const newComment = await OffChainDbService.AddNewComment({
		network,
		indexOrHash: index,
		proposalType: proposalType as EProposalType,
		userId: AuthService.GetUserIdFromAccessToken(newAccessToken),
		content,
		parentCommentId,
		sentiment
	});

	await AIService.UpdatePostCommentsSummary({ network, proposalType, indexOrHash: index, newCommentId: newComment.id });

	// if sentiment is not provided, update the sentiment using AI
	let updatedComment: IComment | null = null;
	if (!sentiment) {
		updatedComment = await AIService.UpdateCommentSentiment(newComment.id);
	}

	// Invalidate caches since comment count changed
	await RedisService.DeletePostData({ network, proposalType, indexOrHash: index });
	await RedisService.DeletePostsListing({ network, proposalType });
	await RedisService.DeleteActivityFeed({ network });
	await RedisService.DeleteContentSummary({ network, indexOrHash: index, proposalType });

	const response = NextResponse.json(updatedComment ?? newComment);
	response.headers.append('Set-Cookie', await AuthService.GetAccessTokenCookie(newAccessToken));
	response.headers.append('Set-Cookie', await AuthService.GetRefreshTokenCookie(newRefreshToken));

	return response;
});
