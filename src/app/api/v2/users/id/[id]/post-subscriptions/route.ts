// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandling } from '@/app/api/_api-utils/withErrorHandling';
import { z } from 'zod';
import { OffChainDbService } from '@/app/api/_api-services/offchain_db_service';
import { ValidatorService } from '@/_shared/_services/validator_service';
import { AuthService } from '@/app/api/_api-services/auth_service';
import { APIError } from '@/app/api/_api-utils/apiError';
import { ERROR_CODES } from '@/_shared/_constants/errorLiterals';
import { StatusCodes } from 'http-status-codes';
import { DEFAULT_LISTING_LIMIT } from '@/_shared/_constants/listingLimit';
import { getNetworkFromHeaders } from '@/app/api/_api-utils/getNetworkFromHeaders';

const SET_COOKIE = 'Set-Cookie';

const zodParamsSchema = z.object({
	id: z.coerce.number().refine((val) => ValidatorService.isValidUserId(val), 'Invalid user ID')
});

const zodQuerySchema = z.object({
	page: z.coerce.number().min(1).optional().default(1),
	limit: z.coerce.number().min(1).optional().default(DEFAULT_LISTING_LIMIT)
});

export const GET = withErrorHandling(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> => {
	const { id } = zodParamsSchema.parse(await params);

	const network = await getNetworkFromHeaders();

	const { page, limit } = zodQuerySchema.parse(Object.fromEntries(req.nextUrl.searchParams));

	const { newAccessToken, newRefreshToken } = await AuthService.ValidateAuthAndRefreshTokens();

	const userId = AuthService.GetUserIdFromAccessToken(newAccessToken);

	if (userId !== id) {
		throw new APIError(ERROR_CODES.FORBIDDEN, StatusCodes.FORBIDDEN, 'You are not allowed to access this resource');
	}

	const postSubscriptions = await OffChainDbService.GetPostSubscriptionsByUserId({
		userId,
		page,
		limit,
		network
	});

	const response = NextResponse.json(postSubscriptions);
	response.headers.append(SET_COOKIE, await AuthService.GetAccessTokenCookie(newAccessToken));
	response.headers.append(SET_COOKIE, await AuthService.GetRefreshTokenCookie(newRefreshToken));

	return response;
});
