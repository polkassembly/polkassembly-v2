// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ERROR_CODES } from '@/_shared/_constants/errorLiterals';
import { ValidatorService } from '@/_shared/_services/validator_service';
import { EWallet } from '@/_shared/types';
import { AuthService } from '@/app/api/_api-services/auth_service';
import { APIError } from '@/app/api/_api-utils/apiError';
import { getReqBody } from '@/app/api/_api-utils/getReqBody';
import { withErrorHandling } from '@/app/api/_api-utils/withErrorHandling';
import { StatusCodes } from 'http-status-codes';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

export const POST = withErrorHandling(async (req: NextRequest) => {
	const zodBodySchema = z.object({
		authCode: z.string(),
		tfaToken: z.string(),
		loginAddress: z
			.string()
			.refine((addr) => ValidatorService.isValidWeb3Address(addr), 'Invalid login address')
			.optional(),
		loginWallet: z.nativeEnum(EWallet).optional()
	});

	const bodyRaw = await getReqBody(req);

	// 1. read auth code and tfa token from request body
	const { authCode, tfaToken, loginAddress, loginWallet } = zodBodySchema.parse(bodyRaw);

	// 2. get user id from tfa token
	const user = await AuthService.GetUserFromTfaToken(tfaToken);

	// 3. verify if user has tfa enabled
	if (!user.twoFactorAuth || !user.twoFactorAuth.enabled || !user.twoFactorAuth.base32Secret || !user.twoFactorAuth.url) {
		throw new APIError(ERROR_CODES.BAD_REQUEST, StatusCodes.BAD_REQUEST, 'TFA is not enabled for this user');
	}

	// 4. verify auth code
	const isValidAuthCode = await AuthService.IsValidTfaAuthCode({ userId: user.id, authCode, base32Secret: user.twoFactorAuth.base32Secret });

	if (!isValidAuthCode) {
		throw new APIError(ERROR_CODES.BAD_REQUEST, StatusCodes.BAD_REQUEST, 'Invalid TFA auth code');
	}

	// 5. send access token and refresh token
	const accessToken = await AuthService.GetSignedAccessToken({ ...user, loginAddress, loginWallet });

	if (!accessToken) {
		throw new APIError(ERROR_CODES.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR, 'Access token not generated');
	}

	const refreshToken = await AuthService.GetRefreshToken({ userId: user.id, loginAddress, loginWallet });

	if (!refreshToken) {
		throw new APIError(ERROR_CODES.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR, 'Refresh token not generated');
	}

	const refreshTokenCookie = await AuthService.GetRefreshTokenCookie(refreshToken);
	const accessTokenCookie = await AuthService.GetAccessTokenCookie(accessToken);

	const response = NextResponse.json({ message: 'TFA login successful' });
	response.headers.append('Set-Cookie', accessTokenCookie);
	response.headers.append('Set-Cookie', refreshTokenCookie);

	return response;
});
