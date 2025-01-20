// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { getNetworkFromHeaders } from '@/app/api/_api-utils/getNetworkFromHeaders';
import { EReaction, EProposalType } from '@/_shared/types';
import { withErrorHandling } from '@/app/api/_api-utils/withErrorHandling';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { OffChainDbService } from '@/app/api/_api-services/offchain_db_service';
import { AuthService } from '@/app/api/_api-services/auth_service';
import { getReqBody } from '@/app/api/_api-utils/getReqBody';
import { RedisService } from '@/app/api/_api-services/redis_service';

const zodParamsSchema = z.object({
	proposalType: z.nativeEnum(EProposalType),
	index: z.string()
});

export const GET = withErrorHandling(async (req: NextRequest, { params }: { params: Promise<{ proposalType: string; index: string }> }): Promise<NextResponse> => {
	const { proposalType, index } = zodParamsSchema.parse(await params);

	const network = await getNetworkFromHeaders();

	const reactions = await OffChainDbService.GetPostReactions({ network, indexOrHash: index, proposalType: proposalType as EProposalType });

	return NextResponse.json(reactions);
});

export const POST = withErrorHandling(async (req: NextRequest, { params }: { params: Promise<{ proposalType: string; index: string }> }): Promise<NextResponse> => {
	const { proposalType, index } = zodParamsSchema.parse(await params);

	const network = await getNetworkFromHeaders();

	// 1. check if user is authenticated
	const { newAccessToken, newRefreshToken } = await AuthService.ValidateAuthAndRefreshTokens();

	// 2. read and validate the request body
	const zodBodySchema = z.object({
		reaction: z.nativeEnum(EReaction)
	});

	const { reaction } = zodBodySchema.parse(await getReqBody(req));

	// 3. add the reaction to the database
	const reactionId = await OffChainDbService.AddPostReaction({
		network,
		indexOrHash: index,
		proposalType: proposalType as EProposalType,
		userId: AuthService.GetUserIdFromAccessToken(newAccessToken),
		reaction
	});

	// Invalidate caches since reaction metrics changed
	await RedisService.DeletePostData({ network, proposalType, indexOrHash: index });
	await RedisService.DeletePostsListing({ network, proposalType });
	await RedisService.DeleteActivityFeed({ network });

	const response = NextResponse.json({ message: 'Reaction added successfully', reactionId });
	response.headers.append('Set-Cookie', await AuthService.GetAccessTokenCookie(newAccessToken));
	response.headers.append('Set-Cookie', await AuthService.GetRefreshTokenCookie(newRefreshToken));

	return response;
});
