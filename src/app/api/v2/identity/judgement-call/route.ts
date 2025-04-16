// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ERROR_CODES, ERROR_MESSAGES } from '@/_shared/_constants/errorLiterals';
import { IDENTITY_JUDGEMENT_AUTH, REQUEST_JUDGEMENT_CF_URL } from '@/app/api/_api-constants/apiEnvVars';
import { AuthService } from '@/app/api/_api-services/auth_service';
import { APIError } from '@/app/api/_api-utils/apiError';
import { getNetworkFromHeaders } from '@/app/api/_api-utils/getNetworkFromHeaders';
import { getReqBody } from '@/app/api/_api-utils/getReqBody';
import { withErrorHandling } from '@/app/api/_api-utils/withErrorHandling';
import { StatusCodes } from 'http-status-codes';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { ValidatorService } from '@/_shared/_services/validator_service';

const zodParamsSchema = z.object({
	userAddress: z.string().refine((address) => {
		try {
			return ValidatorService.isValidSubstrateAddress(address);
		} catch {
			return false;
		}
	}, 'Invalid substrate address'),
	identityHash: z.string().regex(/^0x[0-9a-fA-F]+$/, 'Identity hash must be a valid hex string starting with 0x')
});

export const POST = withErrorHandling(async (req: NextRequest): Promise<NextResponse> => {
	const network = await getNetworkFromHeaders();

	const { newAccessToken, newRefreshToken } = await AuthService.ValidateAuthAndRefreshTokens();
	const { userAddress, identityHash } = zodParamsSchema.parse(await getReqBody(req));

	if (!userAddress || !identityHash) {
		throw new APIError(ERROR_CODES.INVALID_PARAMS_ERROR, StatusCodes.BAD_REQUEST, ERROR_MESSAGES.INVALID_PARAMS_ERROR);
	}

	if (!IDENTITY_JUDGEMENT_AUTH || !REQUEST_JUDGEMENT_CF_URL) {
		throw new APIError(ERROR_CODES.INTERNAL_SERVER_ERROR);
	}

	const res = await fetch(REQUEST_JUDGEMENT_CF_URL, {
		body: JSON.stringify({ identityHash, network, userAddress }),
		headers: {
			Authorization: `${IDENTITY_JUDGEMENT_AUTH}`,
			'Content-Type': 'application/json'
		},
		method: 'POST'
	});

	const { hash } = (await res.json()) as { hash: string };

	if (!res.ok) {
		throw new APIError(ERROR_CODES.INTERNAL_SERVER_ERROR);
	}

	const response = NextResponse.json({ data: hash, message: 'Judgement call made successfully' });
	response.headers.append('Set-Cookie', await AuthService.GetRefreshTokenCookie(newRefreshToken));
	response.headers.append('Set-Cookie', await AuthService.GetAccessTokenCookie(newAccessToken));

	return response;
});
