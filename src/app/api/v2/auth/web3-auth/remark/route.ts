// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ValidatorService } from '@/_shared/_services/validator_service';
import { EWallet } from '@/_shared/types';
import { AuthService } from '@api/_api-services/auth_service';
import { RedisService } from '@api/_api-services/redis_service';
import { APIError } from '@api/_api-utils/apiError';
import { getNetworkFromHeaders } from '@api/_api-utils/getNetworkFromHeaders';
import { getReqBody } from '@api/_api-utils/getReqBody';
import { withErrorHandling } from '@api/_api-utils/withErrorHandling';
import { ERROR_CODES } from '@shared/_constants/errorLiterals';
import { StatusCodes } from 'http-status-codes';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createId as createCuid } from '@paralleldrive/cuid2';
import { getSubstrateAddress } from '@/_shared/_utils/getSubstrateAddress';

export const GET = withErrorHandling(async (req: NextRequest) => {
	const zodQuerySchema = z.object({
		address: z.string().refine((addr) => ValidatorService.isValidWeb3Address(addr), 'Not a valid web3 address')
	});

	const { address } = zodQuerySchema.parse(Object.fromEntries(req.nextUrl.searchParams));

	const substrateAddress = getSubstrateAddress(address) || address;

	const cuidString = createCuid();
	const signingMessage = `Connect with Polkassembly - ${cuidString}`;

	// Store the cuidString in Redis with the address as key
	await RedisService.SetRemarkLoginMessage({ address: substrateAddress, message: cuidString });

	return NextResponse.json({ message: signingMessage });
});

export const POST = withErrorHandling(async (req: NextRequest) => {
	const network = await getNetworkFromHeaders();
	const iframeHeader = req.headers.get('x-iframe-context');

	const zodBodySchema = z.object({
		address: z.string().refine((addr) => ValidatorService.isValidWeb3Address(addr), 'Not a valid web3 address'),
		wallet: z.nativeEnum(EWallet),
		remarkHash: z.string().min(3, 'A valid remark hash is required')
	});

	const bodyRaw = await getReqBody(req);

	const { address, wallet, remarkHash } = zodBodySchema.parse(bodyRaw);

	const {
		accessToken = '',
		isTFAEnabled = false,
		tfaToken = '',
		refreshToken
	} = await AuthService.Web3LoginOrRegisterWithRemark({
		address,
		wallet,
		network,
		remarkHash
	});

	// If 2FA is not enabled and accessToken is not generated, throw error
	if (!accessToken && !isTFAEnabled) {
		throw new APIError(ERROR_CODES.UNAUTHORIZED, StatusCodes.UNAUTHORIZED);
	}

	// If 2FA is enabled, return the tfaToken and userId
	if (isTFAEnabled) return NextResponse.json({ isTFAEnabled, tfaToken });

	if (!refreshToken) {
		throw new APIError(ERROR_CODES.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR, 'Refresh token not generated.');
	}

	const refreshTokenCookie = await AuthService.GetRefreshTokenCookie(refreshToken, iframeHeader === 'mimir');

	if (!refreshTokenCookie) {
		throw new APIError(ERROR_CODES.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR, 'Refresh token cookie not generated.');
	}

	const accessTokenCookie = await AuthService.GetAccessTokenCookie(accessToken, iframeHeader === 'mimir');

	if (!accessTokenCookie) {
		throw new APIError(ERROR_CODES.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR, 'Access token cookie not generated.');
	}

	await RedisService.DeleteRemarkLoginMessage(getSubstrateAddress(address) || address);

	// no 2FA, successful login/signup
	const response = NextResponse.json({ isTFAEnabled, message: 'Web3 authentication successful' });
	response.headers.append('Set-Cookie', accessTokenCookie);
	response.headers.append('Set-Cookie', refreshTokenCookie);

	return response;
});
