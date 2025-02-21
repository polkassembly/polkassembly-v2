// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ERROR_CODES, ERROR_MESSAGES } from '@/_shared/_constants/errorLiterals';
import { AuthService } from '@/app/api/_api-services/auth_service';
import { APIError } from '@/app/api/_api-utils/apiError';
import { getNetworkFromHeaders } from '@/app/api/_api-utils/getNetworkFromHeaders';
import { getReqBody } from '@/app/api/_api-utils/getReqBody';
import { withErrorHandling } from '@/app/api/_api-utils/withErrorHandling';
import { StatusCodes } from 'http-status-codes';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const zodParamsSchema = z.object({
	userAddress: z.string(),
	identityHash: z.string()
});

export const POST = withErrorHandling(async (req: NextRequest): Promise<NextResponse> => {
	const network = await getNetworkFromHeaders();

	const { newAccessToken, newRefreshToken } = await AuthService.ValidateAuthAndRefreshTokens();
	const { userAddress, identityHash } = zodParamsSchema.parse(await getReqBody(req));

	if (!userAddress || !identityHash) {
		throw new APIError(ERROR_CODES.INVALID_PARAMS_ERROR, StatusCodes.BAD_REQUEST, ERROR_MESSAGES.INVALID_PARAMS_ERROR);
	}

	const res = await fetch('https://us-central1-individual-node-watcher.cloudfunctions.net/judgementCall', {
		body: JSON.stringify({ identityHash, network, userAddress }),
		headers: {
			Authorization: `${process.env.IDENTITY_JUDGEMENT_AUTH}`,
			'Content-Type': 'application/json'
		},
		method: 'POST'
	});

	if (!res.ok) {
		throw new APIError(ERROR_CODES.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR, ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
	}

	const response = NextResponse.json({ message: 'Judgement call made successfully' });
	response.headers.append('Set-Cookie', await AuthService.GetRefreshTokenCookie(newRefreshToken));
	response.headers.append('Set-Cookie', await AuthService.GetAccessTokenCookie(newAccessToken));

	return response;
});
