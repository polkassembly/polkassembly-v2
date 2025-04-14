// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ERROR_CODES } from '@/_shared/_constants/errorLiterals';
import { ValidatorService } from '@/_shared/_services/validator_service';
import { ESocial, ESocialVerificationStatus } from '@/_shared/types';
import { AuthService } from '@/app/api/_api-services/auth_service';
import { OffChainDbService } from '@/app/api/_api-services/offchain_db_service';
import { APIError } from '@/app/api/_api-utils/apiError';
import { getReqBody } from '@/app/api/_api-utils/getReqBody';
import { withErrorHandling } from '@/app/api/_api-utils/withErrorHandling';
import { StatusCodes } from 'http-status-codes';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const SET_COOKIE = 'Set-Cookie';

const zodParamsSchema = z.object({
	id: z.coerce.number().refine((val) => ValidatorService.isValidUserId(val), 'Invalid user ID')
});

export const GET = withErrorHandling(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> => {
	const { id } = zodParamsSchema.parse(await params);

	const zodQuerySchema = z.object({
		address: z.coerce.string().refine((val) => ValidatorService.isValidSubstrateAddress(val), 'Invalid address')
	});

	const searchParamsObject = Object.fromEntries(Array.from(req.nextUrl.searchParams.entries()).map(([key]) => [key, req.nextUrl.searchParams.getAll(key)]));
	const { address } = zodQuerySchema.parse(searchParamsObject);

	if (!address) {
		throw new APIError(ERROR_CODES.INVALID_PARAMS_ERROR, StatusCodes.BAD_REQUEST, 'Address is required');
	}

	const { newAccessToken, newRefreshToken } = await AuthService.ValidateAuthAndRefreshTokens();

	const userId = AuthService.GetUserIdFromAccessToken(newAccessToken);

	if (userId !== id) {
		throw new APIError(ERROR_CODES.UNAUTHORIZED, StatusCodes.UNAUTHORIZED);
	}

	const userSocialHandles = await OffChainDbService.GetUserSocialHandles({ userId, address });

	const response = NextResponse.json({ socialHandles: userSocialHandles });

	response.headers.append(SET_COOKIE, await AuthService.GetAccessTokenCookie(newAccessToken));
	response.headers.append(SET_COOKIE, await AuthService.GetRefreshTokenCookie(newRefreshToken));

	return response;
});

export const POST = withErrorHandling(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> => {
	const { id } = zodParamsSchema.parse(await params);

	const zodBodySchema = z.object({
		social: z.nativeEnum(ESocial),
		handle: z.string().min(1, 'Social handle is required'),
		status: z.nativeEnum(ESocialVerificationStatus),
		address: z.coerce.string().refine((val) => ValidatorService.isValidSubstrateAddress(val), 'Invalid address')
	});

	const { social, handle, status, address } = zodBodySchema.parse(await getReqBody(req));

	if (
		(social === ESocial.TWITTER && !ValidatorService.isValidTwitterHandle(handle)) ||
		(social === ESocial.RIOT && !ValidatorService.isValidMatrixHandle(handle)) ||
		(social === ESocial.EMAIL && !ValidatorService.isValidEmail(handle))
	) {
		throw new APIError(ERROR_CODES.INVALID_PARAMS_ERROR, StatusCodes.BAD_REQUEST, 'Invalid handle');
	}

	const { newAccessToken, newRefreshToken } = await AuthService.ValidateAuthAndRefreshTokens();

	const userId = AuthService.GetUserIdFromAccessToken(newAccessToken);

	if (userId !== id) {
		throw new APIError(ERROR_CODES.UNAUTHORIZED, StatusCodes.UNAUTHORIZED);
	}

	const updatedSocialHandle = await OffChainDbService.UpdateUserSocialHandle({
		userId,
		social,
		handle,
		status,
		address
	});

	const response = NextResponse.json(updatedSocialHandle);
	response.headers.append(SET_COOKIE, await AuthService.GetAccessTokenCookie(newAccessToken));
	response.headers.append(SET_COOKIE, await AuthService.GetRefreshTokenCookie(newRefreshToken));

	return response;
});
