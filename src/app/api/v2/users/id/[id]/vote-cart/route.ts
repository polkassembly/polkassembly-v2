// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandling } from '@/app/api/_api-utils/withErrorHandling';
import { z } from 'zod';
import { ValidatorService } from '@/_shared/_services/validator_service';
import { APIError } from '@/app/api/_api-utils/apiError';
import { ERROR_CODES } from '@/_shared/_constants/errorLiterals';
import { StatusCodes } from 'http-status-codes';
import { AuthService } from '@/app/api/_api-services/auth_service';
import { OffChainDbService } from '@/app/api/_api-services/offchain_db_service';
import { EVoteDecision, EProposalType, EConvictionAmount } from '@/_shared/types';
import { getReqBody } from '@/app/api/_api-utils/getReqBody';
import { getNetworkFromHeaders } from '@/app/api/_api-utils/getNetworkFromHeaders';

const SET_COOKIE = 'Set-Cookie';

const zodParamsSchema = z.object({
	id: z.coerce.number().refine((val) => ValidatorService.isValidUserId(val), 'Invalid user ID')
});

// get the vote cart with titles
export const GET = withErrorHandling(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> => {
	const { id } = zodParamsSchema.parse(await params);

	const network = await getNetworkFromHeaders();

	const { newAccessToken, newRefreshToken } = await AuthService.ValidateAuthAndRefreshTokens();

	const userId = AuthService.GetUserIdFromAccessToken(newAccessToken);

	if (userId !== id) {
		throw new APIError(ERROR_CODES.UNAUTHORIZED, StatusCodes.UNAUTHORIZED);
	}

	const voteCart = await OffChainDbService.GetVoteCart({ userId, network });

	const response = NextResponse.json({ voteCart });
	response.headers.append(SET_COOKIE, await AuthService.GetAccessTokenCookie(newAccessToken));
	response.headers.append(SET_COOKIE, await AuthService.GetRefreshTokenCookie(newRefreshToken));

	return response;
});

// add a proposal to the vote cart
export const POST = withErrorHandling(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> => {
	const { id } = zodParamsSchema.parse(await params);

	const zodBodySchema = z.object({
		postIndexOrHash: z.string().min(1, 'Post index or hash is required'),
		proposalType: z.nativeEnum(EProposalType),
		decision: z.nativeEnum(EVoteDecision),
		amount: z.object({
			abstain: z.string().refine(ValidatorService.isValidAmount).optional(),
			aye: z.string().refine(ValidatorService.isValidAmount).optional(),
			nay: z.string().refine(ValidatorService.isValidAmount).optional()
		}),
		conviction: z.nativeEnum(EConvictionAmount)
	});

	const { postIndexOrHash, proposalType, decision, amount, conviction } = zodBodySchema.parse(await getReqBody(req));

	const { newAccessToken, newRefreshToken } = await AuthService.ValidateAuthAndRefreshTokens();

	const userId = AuthService.GetUserIdFromAccessToken(newAccessToken);

	if (userId !== id) {
		throw new APIError(ERROR_CODES.UNAUTHORIZED, StatusCodes.UNAUTHORIZED);
	}

	if (!ValidatorService.isValidVoteAmountsForDecision(amount, decision)) {
		throw new APIError(ERROR_CODES.INVALID_PARAMS_ERROR, StatusCodes.BAD_REQUEST);
	}

	const network = await getNetworkFromHeaders();

	const voteCartItem = await OffChainDbService.AddVoteCartItem({
		userId,
		postIndexOrHash,
		proposalType,
		decision,
		amount,
		conviction,
		network
	});

	const response = NextResponse.json({ voteCartItem });
	response.headers.append(SET_COOKIE, await AuthService.GetAccessTokenCookie(newAccessToken));
	response.headers.append(SET_COOKIE, await AuthService.GetRefreshTokenCookie(newRefreshToken));

	return response;
});

// edit a vote cart item
export const PATCH = withErrorHandling(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> => {
	const { id } = zodParamsSchema.parse(await params);

	const zodBodySchema = z.object({
		id: z.string().min(1, 'Vote cart item id is required'),
		decision: z.nativeEnum(EVoteDecision),
		amount: z.object({
			abstain: z.string().refine(ValidatorService.isValidAmount).optional(),
			aye: z.string().refine(ValidatorService.isValidAmount).optional(),
			nay: z.string().refine(ValidatorService.isValidAmount).optional()
		}),
		conviction: z.nativeEnum(EConvictionAmount)
	});

	const { id: voteCartItemId, decision, amount, conviction } = zodBodySchema.parse(await getReqBody(req));

	const { newAccessToken, newRefreshToken } = await AuthService.ValidateAuthAndRefreshTokens();

	const userId = AuthService.GetUserIdFromAccessToken(newAccessToken);

	if (userId !== id) {
		throw new APIError(ERROR_CODES.UNAUTHORIZED, StatusCodes.UNAUTHORIZED);
	}

	if (!ValidatorService.isValidVoteAmountsForDecision(amount, decision)) {
		throw new APIError(ERROR_CODES.INVALID_PARAMS_ERROR, StatusCodes.BAD_REQUEST);
	}

	await OffChainDbService.UpdateVoteCartItem({ userId, voteCartItemId, decision, amount, conviction });

	const response = NextResponse.json({ message: 'Vote cart item updated' });
	response.headers.append(SET_COOKIE, await AuthService.GetAccessTokenCookie(newAccessToken));
	response.headers.append(SET_COOKIE, await AuthService.GetRefreshTokenCookie(newRefreshToken));

	return response;
});

// delete a vote cart item
export const DELETE = withErrorHandling(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> => {
	const { id } = zodParamsSchema.parse(await params);

	const zodBodySchema = z.object({
		id: z.string().min(1, 'Vote cart item id is required')
	});

	const { id: voteCartItemId } = zodBodySchema.parse(await getReqBody(req));

	const { newAccessToken, newRefreshToken } = await AuthService.ValidateAuthAndRefreshTokens();

	const userId = AuthService.GetUserIdFromAccessToken(newAccessToken);

	if (userId !== id) {
		throw new APIError(ERROR_CODES.UNAUTHORIZED, StatusCodes.UNAUTHORIZED);
	}

	await OffChainDbService.DeleteVoteCartItem({ userId, voteCartItemId });

	const response = NextResponse.json({ message: 'Vote cart item deleted' });
	response.headers.append(SET_COOKIE, await AuthService.GetAccessTokenCookie(newAccessToken));
	response.headers.append(SET_COOKIE, await AuthService.GetRefreshTokenCookie(newRefreshToken));

	return response;
});
