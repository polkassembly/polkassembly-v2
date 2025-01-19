// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ValidatorService } from '@/_shared/_services/validator_service';
import { EProposalType } from '@/_shared/types';
import { AuthService } from '@/app/api/_api-services/auth_service';
import { OffChainDbService } from '@/app/api/_api-services/offchain_db_service';
import { getNetworkFromHeaders } from '@/app/api/_api-utils/getNetworkFromHeaders';
import { getReqBody } from '@/app/api/_api-utils/getReqBody';
import { convertContentForFirestoreServer } from '@/app/api/_api-utils/convertContentForFirestoreServer';
import { withErrorHandling } from '@api/_api-utils/withErrorHandling';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { isValidRichContent } from '@/_shared/_utils/isValidRichContent';
import { RedisService } from '@/app/api/_api-services/redis_service';

const zodParamsSchema = z.object({
	proposalType: z.nativeEnum(EProposalType),
	index: z.string()
});

export const GET = withErrorHandling(async (req: NextRequest, { params }: { params: Promise<{ proposalType: string; index: string }> }): Promise<NextResponse> => {
	const { proposalType, index } = zodParamsSchema.parse(await params);

	const network = await getNetworkFromHeaders();

	const comments = await OffChainDbService.GetPostComments({ network, indexOrHash: index, proposalType: proposalType as EProposalType });

	return NextResponse.json(comments);
});

export const POST = withErrorHandling(async (req: NextRequest, { params }: { params: Promise<{ proposalType: string; index: string }> }): Promise<NextResponse> => {
	const { proposalType, index } = zodParamsSchema.parse(await params);

	const network = await getNetworkFromHeaders();

	// 1. check if user is authenticated
	const { newAccessToken, newRefreshToken } = await AuthService.ValidateAuthAndRefreshTokens();

	// 2. read and validate the request body
	const zodBodySchema = z.object({
		content: z.union([z.custom<Record<string, unknown>>(), z.string()]).refine(isValidRichContent, 'Invalid content'),
		parentCommentId: z.string().optional(),
		address: z
			.string()
			.refine((addr) => ValidatorService.isValidWeb3Address(addr), 'Not a valid web3 address')
			.optional()
	});

	const { content, parentCommentId, address } = zodBodySchema.parse(await getReqBody(req));

	const formattedContent = convertContentForFirestoreServer(content);

	const newComment = await OffChainDbService.AddNewComment({
		network,
		indexOrHash: index,
		proposalType: proposalType as EProposalType,
		userId: AuthService.GetUserIdFromAccessToken(newAccessToken),
		content: formattedContent,
		parentCommentId,
		address
	});

	// Invalidate caches since comment count changed
	await RedisService.DeletePostData({ network, proposalType, indexOrHash: index });
	await RedisService.DeletePostsListing({ network, proposalType });

	const response = NextResponse.json(newComment);
	response.headers.append('Set-Cookie', await AuthService.GetAccessTokenCookie(newAccessToken));
	response.headers.append('Set-Cookie', await AuthService.GetRefreshTokenCookie(newRefreshToken));

	return response;
});
