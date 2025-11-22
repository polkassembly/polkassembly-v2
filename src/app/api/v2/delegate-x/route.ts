// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { withErrorHandling } from '@/app/api/_api-utils/withErrorHandling';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getReqBody } from '@/app/api/_api-utils/getReqBody';
import { OffChainDbService } from '@/app/api/_api-services/offchain_db_service';
import { APIError } from '@/app/api/_api-utils/apiError';
import { ERROR_CODES } from '@/_shared/_constants/errorLiterals';
import { StatusCodes } from 'http-status-codes';
import { PolkadotApiService } from '@/app/_client-services/polkadot_api_service';
import { getNetworkFromHeaders } from '@/app/api/_api-utils/getNetworkFromHeaders';
import { naclEncrypt, blake2AsU8a } from '@polkadot/util-crypto';
import { stringToU8a, u8aToString } from '@polkadot/util';
import { DelegateXService } from '@/app/api/_api-services/external_api_service/delegate_x_service';
import { AuthService } from '@/app/api/_api-services/auth_service';

const zodParamsSchema = z.object({
	strategyId: z.string().min(1, 'Strategy ID is required'),
	contactLink: z.string().optional(),
	signatureLink: z.string().optional(),
	includeComment: z.boolean().optional(),
	votingPower: z.string()
});

export const POST = withErrorHandling(async (req: NextRequest) => {
	const { strategyId, contactLink, signatureLink, includeComment = false, votingPower } = zodParamsSchema.parse(await getReqBody(req));

	const { newAccessToken, newRefreshToken } = await AuthService.ValidateAuthAndRefreshTokens();

	// get user id from token
	const userId = AuthService.GetUserIdFromAccessToken(newAccessToken);
	if (!userId) {
		throw new APIError(ERROR_CODES.UNAUTHORIZED, StatusCodes.UNAUTHORIZED, 'Unauthorized');
	}

	const network = await getNetworkFromHeaders();
	const { mnemonic, address } = await PolkadotApiService.createNewAddress();
	if (!address || !mnemonic) {
		throw new APIError(ERROR_CODES.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to create new address');
	}

	// import DELEGATE_X_SECRET from env variables
	const secret = process.env.DELEGATE_X_SECRET;

	if (!secret) {
		throw new APIError(ERROR_CODES.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR, 'Encryption secret not found');
	}

	// Hash the secret to ensure it's exactly 32 bytes (required by naclEncrypt)
	const secretKey = blake2AsU8a(stringToU8a(secret), 256);
	const { encrypted, nonce } = naclEncrypt(stringToU8a(mnemonic), secretKey);

	const delegateXAccount = await OffChainDbService.CreateDelegateXAccount({
		address,
		encryptedMnemonic: u8aToString(encrypted),
		nonce: u8aToString(nonce),
		userId: Number(userId),
		network,
		includeComment,
		votingPower
	});

	// create DelegateX Bot (disabled for now)
	await DelegateXService.createDelegateXBot(Number(userId), strategyId, contactLink, signatureLink);

	const response = NextResponse.json({ success: true, delegateXAccount });

	response.headers.append('Set-Cookie', await AuthService.GetAccessTokenCookie(newAccessToken));
	response.headers.append('Set-Cookie', await AuthService.GetRefreshTokenCookie(newRefreshToken));
	return response;
});

// Get DelegateX Account by user id
export const GET = withErrorHandling(async () => {
	const network = await getNetworkFromHeaders();
	const { newAccessToken } = await AuthService.ValidateAuthAndRefreshTokens();
	if (!newAccessToken) {
		throw new APIError(ERROR_CODES.UNAUTHORIZED, StatusCodes.UNAUTHORIZED, 'Unauthorized');
	}
	const userId = AuthService.GetUserIdFromAccessToken(newAccessToken);
	if (!userId) {
		throw new APIError(ERROR_CODES.UNAUTHORIZED, StatusCodes.UNAUTHORIZED, 'Unauthorized');
	}

	const delegateXAccount = await OffChainDbService.GetDelegateXAccountByUserId({ userId, network });
	if (!delegateXAccount) {
		throw new APIError(ERROR_CODES.NOT_FOUND, StatusCodes.NOT_FOUND, 'DelegateX account not found');
	}

	// get the vote data for the delegatex account
	const voteData = await OffChainDbService.GetDelegateXVotesMatrixByDelegateXAccountId({
		delegateXAccountId: `${delegateXAccount.userId}-${delegateXAccount.network}-${delegateXAccount.address}`
	});
	if (!voteData) {
		throw new APIError(ERROR_CODES.NOT_FOUND, StatusCodes.NOT_FOUND, 'Vote data not found');
	}

	return NextResponse.json({
		success: true,
		delegateXAccount,
		...voteData
	});
});
