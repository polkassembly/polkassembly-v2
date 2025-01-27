// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ValidatorService } from '@/_shared/_services/validator_service';
import { getSubstrateAddress } from '@/_shared/_utils/getSubstrateAddress';
import { FirestoreService } from '@/app/api/_api-services/offchain_db_service/firestore_service';
import { AuthService } from '@api/_api-services/auth_service';
import { APIError } from '@api/_api-utils/apiError';
import { getReqBody } from '@api/_api-utils/getReqBody';
import { withErrorHandling } from '@api/_api-utils/withErrorHandling';
import { ERROR_CODES } from '@shared/_constants/errorLiterals';
import { StatusCodes } from 'http-status-codes';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

export const POST = withErrorHandling(async (req: NextRequest) => {
	const { newAccessToken, newRefreshToken } = await AuthService.ValidateAuthAndRefreshTokens();

	const zodBodySchema = z.object({
		address: z.string().refine((addr) => ValidatorService.isValidWeb3Address(addr), 'Not a valid web3 address')
	});

	const bodyRaw = await getReqBody(req);

	const { address } = zodBodySchema.parse(bodyRaw);

	const formattedAddress = ValidatorService.isValidEVMAddress(address) ? address : getSubstrateAddress(address);
	if (!formattedAddress) throw new APIError(ERROR_CODES.BAD_REQUEST, StatusCodes.BAD_REQUEST, 'Invalid address');

	const isAddressLinked = await FirestoreService.checkIfAddressIsLinked(address);

	if (isAddressLinked) {
		throw new APIError(ERROR_CODES.BAD_REQUEST, StatusCodes.BAD_REQUEST, 'Address already linked');
	}

	const signMessage = AuthService.getLinkAddressSignMessage(formattedAddress);

	const response = NextResponse.json({ signMessage });
	response.headers.append('Set-Cookie', await AuthService.GetAccessTokenCookie(newAccessToken));
	response.headers.append('Set-Cookie', await AuthService.GetRefreshTokenCookie(newRefreshToken));

	return response;
});
