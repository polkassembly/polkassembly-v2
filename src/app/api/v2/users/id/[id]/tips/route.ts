// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandling } from '@/app/api/_api-utils/withErrorHandling';
import { z } from 'zod';
import { OffChainDbService } from '@/app/api/_api-services/offchain_db_service';
import { ValidatorService } from '@/_shared/_services/validator_service';
import { getNetworkFromHeaders } from '@/app/api/_api-utils/getNetworkFromHeaders';
import { ITip } from '@/_shared/types';
import { ERROR_CODES } from '@/_shared/_constants/errorLiterals';
import { StatusCodes } from 'http-status-codes';
import { APIError } from '@/app/api/_api-utils/apiError';
import { AuthService } from '@/app/api/_api-services/auth_service';
import { getEncodedAddress } from '@/_shared/_utils/getEncodedAddress';
import { getReqBody } from '@/app/api/_api-utils/getReqBody';

const SET_COOKIE = 'Set-Cookie';

const zodParamsSchema = z.object({
	id: z.coerce.number().refine((val) => ValidatorService.isValidUserId(val), 'Invalid user ID')
});

// get tips
export const GET = withErrorHandling(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse<{ tips: ITip[] }>> => {
	const { id } = zodParamsSchema.parse(await params);

	const network = await getNetworkFromHeaders();

	const tips = await OffChainDbService.GetTipsByUserId({ network, userId: id });

	return NextResponse.json({ tips });
});

export const POST = withErrorHandling(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
	const { id } = zodParamsSchema.parse(await params);
	const zodBodySchema = z.object({
		userAddress: z.string().refine((userAddress) => ValidatorService.isValidWeb3Address(userAddress), 'Not a valid web3 address'),
		amount: z.string().refine((tipAmount) => ValidatorService.isValidAmount(tipAmount), 'Not a valid tip amount'),
		beneficiaryAddress: z.string().refine((tipToAddress) => ValidatorService.isValidWeb3Address(tipToAddress), 'Not a valid web3 address'),
		remark: z.string(),
		extrinsicHash: z.string()
	});

	const { userAddress, amount, beneficiaryAddress, remark, extrinsicHash } = zodBodySchema.parse(await getReqBody(req));
	const { newAccessToken, newRefreshToken } = await AuthService.ValidateAuthAndRefreshTokens();

	const userId = AuthService.GetUserIdFromAccessToken(newAccessToken);

	if (userId !== id) {
		throw new APIError(ERROR_CODES.UNAUTHORIZED, StatusCodes.UNAUTHORIZED);
	}

	const network = await getNetworkFromHeaders();

	const beneficiaryUserProfile = await OffChainDbService.GetPublicUserByAddress(beneficiaryAddress);
	if (!beneficiaryUserProfile) {
		throw new APIError(ERROR_CODES.NOT_FOUND, StatusCodes.NOT_FOUND, 'Beneficiary user not found');
	}

	const userTipping = await OffChainDbService.CreateTip({
		network,
		userAddress: getEncodedAddress(userAddress, network) || userAddress,
		userId,
		amount,
		beneficiaryAddress: getEncodedAddress(beneficiaryAddress, network) || beneficiaryAddress,
		beneficiaryUserId: beneficiaryUserProfile?.id,
		remark,
		extrinsicHash
	});

	const response = NextResponse.json(userTipping);
	response.headers.append(SET_COOKIE, await AuthService.GetAccessTokenCookie(newAccessToken));
	response.headers.append(SET_COOKIE, await AuthService.GetRefreshTokenCookie(newRefreshToken));

	return response;
});
