// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ERROR_CODES } from '@/_shared/_constants/errorLiterals';
import { ValidatorService } from '@/_shared/_services/validator_service';
import { EDelegateSource, IDelegateDetails } from '@/_shared/types';
import { AuthService } from '@/app/api/_api-services/auth_service';
import { OffChainDbService } from '@/app/api/_api-services/offchain_db_service';
import { OnChainDbService } from '@/app/api/_api-services/onchain_db_service';
import { RedisService } from '@/app/api/_api-services/redis_service';
import { APIError } from '@/app/api/_api-utils/apiError';
import { getNetworkFromHeaders } from '@/app/api/_api-utils/getNetworkFromHeaders';
import { getReqBody } from '@/app/api/_api-utils/getReqBody';
import { withErrorHandling } from '@/app/api/_api-utils/withErrorHandling';
import { StatusCodes } from 'http-status-codes';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const SET_COOKIE_HEADER = 'Set-Cookie';

const zodParamsSchema = z.object({
	address: z.string().refine((addr) => ValidatorService.isValidWeb3Address(addr), 'Not a valid web3 address')
});

// get PA delegate details
export const GET = withErrorHandling(async (req: Request, { params }: { params: Promise<{ address: string }> }) => {
	const { address } = zodParamsSchema.parse(await params);
	const network = await getNetworkFromHeaders();

	const delegate = await OffChainDbService.GetPolkassemblyDelegateByAddress({ network, address });

	if (!delegate) {
		throw new APIError(ERROR_CODES.NOT_FOUND, StatusCodes.NOT_FOUND, 'Delegate not found');
	}

	const delegateOnChainDetails = await OnChainDbService.GetDelegateDetails({ network, address });

	const publicUser = await OffChainDbService.GetPublicUserByAddress(address);

	const delegateDetails: IDelegateDetails = {
		...delegate,
		sources: delegate?.sources ?? [EDelegateSource.POLKASSEMBLY],
		...delegateOnChainDetails,
		publicUser: publicUser ?? undefined
	};

	return NextResponse.json(delegateDetails);
});

// update delegate manifesto
export const PATCH = withErrorHandling(async (req: Request, { params }: { params: Promise<{ address: string }> }) => {
	const { address } = zodParamsSchema.parse(await params);

	const zodBodySchema = z.object({
		manifesto: z.string().min(1, 'Manifesto is required')
	});

	const { manifesto } = zodBodySchema.parse(await getReqBody(req));

	const network = await getNetworkFromHeaders();

	const { newAccessToken, newRefreshToken } = await AuthService.ValidateAuthAndRefreshTokens();

	// check if address belongs to the user
	const user = await OffChainDbService.GetUserByAddress(address);
	if (!user || user.id !== AuthService.GetUserIdFromAccessToken(newAccessToken)) {
		throw new APIError(ERROR_CODES.FORBIDDEN, StatusCodes.FORBIDDEN, 'You are not allowed to update this address.');
	}

	await OffChainDbService.UpdatePolkassemblyDelegate({ network, address, manifesto });

	// invalidate delegate details cache
	await RedisService.DeleteDelegateDetails(network);

	const response = NextResponse.json({ message: 'Manifesto updated successfully' });
	response.headers.append(SET_COOKIE_HEADER, await AuthService.GetAccessTokenCookie(newAccessToken));
	response.headers.append(SET_COOKIE_HEADER, await AuthService.GetRefreshTokenCookie(newRefreshToken));
	return response;
});

// delete delegate
export const DELETE = withErrorHandling(async (req: Request, { params }: { params: Promise<{ address: string }> }) => {
	const { address } = zodParamsSchema.parse(await params);

	const network = await getNetworkFromHeaders();

	const { newAccessToken, newRefreshToken } = await AuthService.ValidateAuthAndRefreshTokens();

	// check if address belongs to the user
	const user = await OffChainDbService.GetUserByAddress(address);
	if (!user || user.id !== AuthService.GetUserIdFromAccessToken(newAccessToken)) {
		throw new APIError(ERROR_CODES.FORBIDDEN, StatusCodes.FORBIDDEN, 'You are not allowed to delete this address.');
	}

	await OffChainDbService.DeletePolkassemblyDelegate({ network, address });

	const response = NextResponse.json({ message: 'Delegate deleted successfully' });
	response.headers.append(SET_COOKIE_HEADER, await AuthService.GetAccessTokenCookie(newAccessToken));
	response.headers.append(SET_COOKIE_HEADER, await AuthService.GetRefreshTokenCookie(newRefreshToken));
	return response;
});
