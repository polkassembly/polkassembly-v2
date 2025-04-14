// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ERROR_CODES } from '@/_shared/_constants/errorLiterals';
import { ValidatorService } from '@/_shared/_services/validator_service';
import { ENetwork, ESocial, ESocialVerificationStatus } from '@/_shared/types';
import { AuthService } from '@/app/api/_api-services/auth_service';
import { OffChainDbService } from '@/app/api/_api-services/offchain_db_service';
import { APIError } from '@/app/api/_api-utils/apiError';
import { getReqBody } from '@/app/api/_api-utils/getReqBody';
import { withErrorHandling } from '@/app/api/_api-utils/withErrorHandling';
import { StatusCodes } from 'http-status-codes';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createId as createCuid } from '@paralleldrive/cuid2';
import { NotificationService } from '@/app/api/_api-services/notification_service';
import { dayjs } from '@/_shared/_utils/dayjsInit';
import { getOauthConsumer } from '@/app/api/_api-utils/getOauthConsumer';
import { getNetworkFromHeaders } from '@/app/api/_api-utils/getNetworkFromHeaders';

const SET_COOKIE = 'Set-Cookie';

async function getOAuthRequestToken(network: ENetwork): Promise<{ oauthRequestToken: string; oauthRequestTokenSecret: string }> {
	const oauthConsumer = getOauthConsumer(network);
	// Wrap the callback-based function in a promise

	if (!oauthConsumer) return { oauthRequestToken: '', oauthRequestTokenSecret: '' };

	return new Promise((resolve, reject) => {
		oauthConsumer.getOAuthRequestToken((error, oauthRequestToken, oauthRequestTokenSecret) => {
			if (error) {
				console.log('error in oauthConsumer', error);
				reject(new APIError(ERROR_CODES.BAD_REQUEST, StatusCodes.BAD_REQUEST, 'Oops! Something went wrong while getting the OAuth request token.'));
			} else {
				resolve({ oauthRequestToken, oauthRequestTokenSecret });
			}
		});
	});
}

const zodParamsSchema = z.object({
	id: z.coerce.number().refine((val) => ValidatorService.isValidUserId(val), 'Invalid user ID')
});

export const POST = withErrorHandling(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> => {
	const { id } = zodParamsSchema.parse(await params);

	const network = await getNetworkFromHeaders();

	const zodBodySchema = z.object({
		social: z.nativeEnum(ESocial),
		handle: z.string().min(1, 'Social handle is required'),
		address: z.coerce.string().refine((val) => ValidatorService.isValidSubstrateAddress(val), 'Invalid address')
	});

	const { social, handle, address } = zodBodySchema.parse(await getReqBody(req));

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

	const user = await OffChainDbService.GetUserById(userId);

	if (!user) {
		throw new APIError(ERROR_CODES.USER_NOT_FOUND, StatusCodes.NOT_FOUND);
	}

	let updatedSocialHandle = {};

	if (social === ESocial.EMAIL) {
		const verifyToken = createCuid();
		await NotificationService.SendVerificationEmail(user, verifyToken, handle);

		updatedSocialHandle = await OffChainDbService.UpdateUserSocialHandle({
			userId,
			address,
			social,
			handle,
			status: ESocialVerificationStatus.PENDING,
			verificationToken: {
				token: verifyToken,
				expiresAt: dayjs().add(5, 'minutes').toDate()
			}
		});
	}

	if (social === ESocial.TWITTER) {
		const { oauthRequestToken, oauthRequestTokenSecret } = await getOAuthRequestToken(network);

		const twitterHandle = handle.startsWith('@') ? handle.substring(1) : handle;

		updatedSocialHandle = await OffChainDbService.UpdateUserSocialHandle({
			userId,
			address,
			social,
			handle: twitterHandle,
			status: ESocialVerificationStatus.PENDING,
			verificationToken: { token: oauthRequestToken, secret: oauthRequestTokenSecret, expiresAt: dayjs().add(5, 'minutes').toDate() }
		});
	}

	if (social === ESocial.RIOT) {
		updatedSocialHandle = await OffChainDbService.UpdateUserSocialHandle({
			userId,
			address,
			social,
			handle,
			status: ESocialVerificationStatus.VERIFIED
		});
	}

	const response = NextResponse.json(updatedSocialHandle);
	response.headers.append(SET_COOKIE, await AuthService.GetAccessTokenCookie(newAccessToken));
	response.headers.append(SET_COOKIE, await AuthService.GetRefreshTokenCookie(newRefreshToken));

	return response;
});
