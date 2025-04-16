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
import { dayjs } from '@/_shared/_utils/dayjsInit';
import { confirmTwitterVerification } from '@/app/api/_api-utils/confirmTwitterVerification';
import { getNetworkFromHeaders } from '@/app/api/_api-utils/getNetworkFromHeaders';

const SET_COOKIE = 'Set-Cookie';

const zodParamsSchema = z.object({
	id: z.coerce.number().refine((val) => ValidatorService.isValidUserId(val), 'Invalid user ID')
});

export const POST = withErrorHandling(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> => {
	const { id } = zodParamsSchema.parse(await params);

	const network = await getNetworkFromHeaders();

	const zodBodySchema = z.object({
		social: z.nativeEnum(ESocial),
		token: z.string().min(1, 'Token is required'),
		twitterOauthVerifier: z.string().optional()
	});

	const { social, token, twitterOauthVerifier } = zodBodySchema.parse(await getReqBody(req));

	const { newAccessToken, newRefreshToken } = await AuthService.ValidateAuthAndRefreshTokens();

	const userId = AuthService.GetUserIdFromAccessToken(newAccessToken);

	if (userId !== id) {
		throw new APIError(ERROR_CODES.UNAUTHORIZED, StatusCodes.UNAUTHORIZED);
	}

	const user = await OffChainDbService.GetUserById(userId);

	if (!user) {
		throw new APIError(ERROR_CODES.USER_NOT_FOUND, StatusCodes.NOT_FOUND);
	}

	const socialHandle = await OffChainDbService.GetSocialHandleByToken({ token });

	if (!socialHandle || !socialHandle.handle || socialHandle.userId !== userId) {
		throw new APIError(ERROR_CODES.INVALID_PARAMS_ERROR, StatusCodes.BAD_REQUEST, 'Social handle not found');
	}

	if (!socialHandle.verificationToken || !socialHandle.verificationToken.token || socialHandle.verificationToken.token !== token) {
		throw new APIError(ERROR_CODES.INVALID_PARAMS_ERROR, StatusCodes.BAD_REQUEST, 'Invalid token');
	}

	const verifyTokenExpiresAt = socialHandle.verificationToken.expiresAt || new Date();

	if (dayjs(verifyTokenExpiresAt).isBefore(dayjs())) {
		throw new APIError(ERROR_CODES.INVALID_PARAMS_ERROR, StatusCodes.BAD_REQUEST, 'Token expired');
	}

	if (social === ESocial.TWITTER) {
		const { data, error } = await confirmTwitterVerification({
			network,
			oauthRequestToken: token,
			twitterHandle: socialHandle.handle,
			oauthVerifier: twitterOauthVerifier,
			oauthRequestTokenSecret: socialHandle.verificationToken.secret
		});
		if (error || !data) throw new APIError(ERROR_CODES.BAD_REQUEST, StatusCodes.BAD_REQUEST, 'Failed');
	}
	const updatedSocialHandle = await OffChainDbService.UpdateSocialHandleByToken({
		token,
		status: ESocialVerificationStatus.VERIFIED
	});

	const response = NextResponse.json(updatedSocialHandle);
	response.headers.append(SET_COOKIE, await AuthService.GetAccessTokenCookie(newAccessToken));
	response.headers.append(SET_COOKIE, await AuthService.GetRefreshTokenCookie(newRefreshToken));

	return response;
});
