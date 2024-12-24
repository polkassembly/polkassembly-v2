// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ECookieNames, EProposalType } from '@/_shared/types';
import { AuthService } from '@/app/api/_api-services/auth_service';
import { OffChainDbService } from '@/app/api/_api-services/offchain_db_service';
import { getNetworkFromHeaders } from '@/app/api/_api-utils/getNetworkFromHeaders';
import { getReqBody } from '@/app/api/_api-utils/getReqBody';
import { withErrorHandling } from '@api/_api-utils/withErrorHandling';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

export const GET = withErrorHandling(async (req: NextRequest, { params }: { params: Promise<{ proposalType: string; index: string }> }): Promise<NextResponse> => {
	const zodParamsSchema = z.object({
		proposalType: z.nativeEnum(EProposalType),
		index: z.string()
	});

	const { proposalType, index } = zodParamsSchema.parse(await params);

	const network = await getNetworkFromHeaders();

	const comments = await OffChainDbService.GetPostComments({ network, indexOrHash: index, proposalType: proposalType as EProposalType });

	return NextResponse.json(comments);
});

export const POST = withErrorHandling(async (req: NextRequest, { params }: { params: Promise<{ proposalType: string; index: string }> }): Promise<NextResponse> => {
	const zodParamsSchema = z.object({
		proposalType: z.nativeEnum(EProposalType),
		index: z.string()
	});

	const { proposalType, index } = zodParamsSchema.parse(await params);

	const network = await getNetworkFromHeaders();

	// 1. check if user is logged in
	const cookiesStore = await cookies();
	const accessToken = cookiesStore.get(ECookieNames.ACCESS_TOKEN)?.value;
	const refreshToken = cookiesStore.get(ECookieNames.REFRESH_TOKEN)?.value;

	const { newAccessToken, newRefreshToken } = await AuthService.ValidateAuthAndRefreshTokens(accessToken, refreshToken);

	// 2. read and validate the request body
	const zodBodySchema = z.object({
		content: z.string(),
		parentCommentId: z.string().optional()
	});

	const { content, parentCommentId } = zodBodySchema.parse(await getReqBody(req));

	await OffChainDbService.AddNewComment({
		network,
		indexOrHash: index,
		proposalType: proposalType as EProposalType,
		userId: await AuthService.GetUserIdFromAccessToken(newAccessToken),
		content,
		parentCommentId
	});

	const response = NextResponse.json({ message: 'Comment added successfully' });
	response.headers.append('Set-Cookie', await AuthService.GetAccessTokenCookie(newAccessToken));
	response.headers.append('Set-Cookie', await AuthService.GetRefreshTokenCookie(newRefreshToken));

	return response;
});
