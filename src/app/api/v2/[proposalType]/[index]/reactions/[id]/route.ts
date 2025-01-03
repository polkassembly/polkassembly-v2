// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ERROR_CODES } from '@/_shared/_constants/errorLiterals';
import { EProposalType } from '@/_shared/types';
import { OffChainDbService } from '@/app/api/_api-services/offchain_db_service';
import { StatusCodes } from 'http-status-codes';
import { APIError } from '@/app/api/_api-utils/apiError';
import { withErrorHandling } from '@/app/api/_api-utils/withErrorHandling';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { AuthService } from '@/app/api/_api-services/auth_service';

const zodParamsSchema = z.object({
	proposalType: z.nativeEnum(EProposalType),
	index: z.string(),
	id: z.string()
});

export const GET = withErrorHandling(async (req: NextRequest, { params }: { params: Promise<{ proposalType: string; index: string; id: string }> }): Promise<NextResponse> => {
	const { id } = zodParamsSchema.parse(await params);

	const reaction = await OffChainDbService.GetPostReactionById(id);

	if (!reaction) {
		throw new APIError(ERROR_CODES.NOT_FOUND, StatusCodes.NOT_FOUND, 'Reaction not found');
	}

	return NextResponse.json(reaction);
});

export const DELETE = withErrorHandling(async (req: NextRequest, { params }: { params: Promise<{ proposalType: string; index: string; id: string }> }): Promise<NextResponse> => {
	const { id } = zodParamsSchema.parse(await params);

	// 1. check if user is authenticated
	const { newAccessToken, newRefreshToken } = await AuthService.ValidateAuthAndRefreshTokens();

	// 2. delete the reaction from the database
	await OffChainDbService.DeletePostReaction(id);

	const response = NextResponse.json({ message: 'Reaction deleted successfully' });
	response.headers.append('Set-Cookie', await AuthService.GetAccessTokenCookie(newAccessToken));
	response.headers.append('Set-Cookie', await AuthService.GetRefreshTokenCookie(newRefreshToken));

	return response;
});
