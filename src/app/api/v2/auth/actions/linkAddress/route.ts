// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { WEB3_AUTH_SIGN_MESSAGE } from '@/_shared/_constants/signMessage';
import { ValidatorService } from '@/_shared/_services/validator_service';
import { getSubstrateAddress } from '@/_shared/_utils/getSubstrateAddress';
import { EWallet } from '@/_shared/types';
import { OffChainDbService } from '@/app/api/_api-services/offchain_db_service';
import { FirestoreService } from '@/app/api/_api-services/offchain_db_service/firestore_service';
import { getNetworkFromHeaders } from '@/app/api/_api-utils/getNetworkFromHeaders';
import { AuthService } from '@api/_api-services/auth_service';
import { APIError } from '@api/_api-utils/apiError';
import { getReqBody } from '@api/_api-utils/getReqBody';
import { withErrorHandling } from '@api/_api-utils/withErrorHandling';
import { ERROR_CODES } from '@shared/_constants/errorLiterals';
import { StatusCodes } from 'http-status-codes';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

export const POST = withErrorHandling(async (req: NextRequest) => {
	const network = await getNetworkFromHeaders();
	const { newAccessToken, newRefreshToken } = await AuthService.ValidateAuthAndRefreshTokens();
	const userId = AuthService.GetUserIdFromAccessToken(newAccessToken);

	const zodBodySchema = z.object({
		address: z.string().refine((addr) => ValidatorService.isValidWeb3Address(addr), 'Not a valid web3 address'),
		wallet: z.nativeEnum(EWallet),
		signature: z.string().min(2, 'A valid signature is required'),
		signMessage: z.string().min(2, 'A valid sign message is required')
	});

	const bodyRaw = await getReqBody(req);

	const { address, signature, wallet } = zodBodySchema.parse(bodyRaw);

	const formattedAddress = ValidatorService.isValidEVMAddress(address) ? address : getSubstrateAddress(address);
	if (!formattedAddress) throw new APIError(ERROR_CODES.BAD_REQUEST, StatusCodes.BAD_REQUEST, 'Invalid address');

	const isAddressLinked = await FirestoreService.checkIfAddressIsLinked(address);

	if (isAddressLinked) {
		throw new APIError(ERROR_CODES.BAD_REQUEST, StatusCodes.BAD_REQUEST, 'Address already linked');
	}

	const isValidSignature = await ValidatorService.isValidSignatureForMessage(address, signature, WEB3_AUTH_SIGN_MESSAGE);

	if (!isValidSignature) {
		throw new APIError(ERROR_CODES.BAD_REQUEST, StatusCodes.BAD_REQUEST, 'Invalid signature');
	}

	await OffChainDbService.AddNewAddress({ address, userId, isDefault: false, wallet, network });

	const response = NextResponse.json({ message: 'Address linked successfully' });
	response.headers.append('Set-Cookie', await AuthService.GetAccessTokenCookie(newAccessToken));
	response.headers.append('Set-Cookie', await AuthService.GetRefreshTokenCookie(newRefreshToken));

	return response;
});
