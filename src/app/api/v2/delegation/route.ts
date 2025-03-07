// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextRequest, NextResponse } from 'next/server';
import { isAddress } from '@polkadot/util-crypto';
import { getEncodedAddress } from '@/_shared/_utils/getEncodedAddress';
import { z } from 'zod';
import { ERROR_CODES } from '@/_shared/_constants/errorLiterals';
import { StatusCodes } from 'http-status-codes';
import { getNetworkFromHeaders } from '../../_api-utils/getNetworkFromHeaders';
import { APIError } from '../../_api-utils/apiError';
import { OffChainDbService } from '../../_api-services/offchain_db_service';
import { AuthService } from '../../_api-services/auth_service';
import { fetchAllDelegateSources, fetchDelegateAnalytics } from '../../_api-utils/delegateUtils';

const GetDelegatesQuerySchema = z
	.object({
		address: z.string().nullish()
	})
	.transform((data) => ({
		address: data.address || undefined
	}));

const CreateDelegateSchema = z.object({
	address: z.string().min(1, 'Address is required'),
	bio: z.string().min(1, 'Bio is required'),
	name: z.string().min(1, 'Name is required')
});

export async function GET(req: NextRequest): Promise<NextResponse> {
	try {
		const network = await getNetworkFromHeaders();
		if (!network) {
			throw new APIError(ERROR_CODES.INVALID_NETWORK, StatusCodes.BAD_REQUEST);
		}

		const { address } = GetDelegatesQuerySchema.parse({
			address: req.nextUrl.searchParams.get('address')
		});

		if (address) {
			const encodedAddress = getEncodedAddress(address, network);
			if (!encodedAddress && !isAddress(address)) {
				throw new APIError(ERROR_CODES.ADDRESS_NOT_FOUND_ERROR, StatusCodes.BAD_REQUEST);
			}
		}
		const delegateSources = await fetchAllDelegateSources(network);
		if (!delegateSources.length) {
			throw new APIError(ERROR_CODES.NOT_FOUND, StatusCodes.NOT_FOUND);
		}

		const targetAddresses = address ? [address] : delegateSources.map((d) => d.address);
		const analytics = await fetchDelegateAnalytics(network, targetAddresses);

		const combinedDelegates = delegateSources
			.map((delegate) => ({
				...delegate,
				...(analytics.find((a) => a.address === delegate.address) || {
					delegatedBalance: '0',
					receivedDelegationsCount: 0,
					votedProposalCount: 0
				})
			}))
			.filter((d) => d.votedProposalCount > 0 || d.receivedDelegationsCount > 0);

		return NextResponse.json({
			data: {
				delegates: combinedDelegates,
				totalDelegates: combinedDelegates.length
			}
		});
	} catch (error) {
		console.error('Delegate API Error:', error);

		if (error instanceof z.ZodError) {
			return NextResponse.json({ error: 'Invalid request parameters' }, { status: StatusCodes.BAD_REQUEST });
		}

		if (error instanceof APIError) {
			return NextResponse.json({ error: error.message }, { status: error.status });
		}

		return NextResponse.json({ error: 'Internal server error' }, { status: StatusCodes.INTERNAL_SERVER_ERROR });
	}
}

export async function POST(req: NextRequest): Promise<NextResponse> {
	try {
		const body = await req.json();
		const { address, bio, name } = CreateDelegateSchema.parse(body);

		const { newAccessToken } = await AuthService.ValidateAuthAndRefreshTokens();
		if (!newAccessToken) {
			throw new APIError(ERROR_CODES.UNAUTHORIZED, StatusCodes.UNAUTHORIZED);
		}

		const userId = AuthService.GetUserIdFromAccessToken(newAccessToken);
		if (!userId) {
			throw new APIError(ERROR_CODES.USER_NOT_FOUND, StatusCodes.NOT_FOUND);
		}

		const network = await getNetworkFromHeaders();
		if (!network) {
			throw new APIError(ERROR_CODES.INVALID_NETWORK, StatusCodes.BAD_REQUEST);
		}

		const delegate = await OffChainDbService.CreateDelegate({
			network,
			address,
			bio,
			createAt: new Date(),
			isNovaWalletDelegate: false,
			name,
			userId
		});

		return NextResponse.json(delegate);
	} catch (error) {
		console.error('Create Delegate Error:', error);

		if (error instanceof z.ZodError) {
			return NextResponse.json({ error: 'Invalid request body' }, { status: StatusCodes.BAD_REQUEST });
		}

		if (error instanceof APIError) {
			return NextResponse.json({ error: error.message }, { status: error.status });
		}

		return NextResponse.json({ error: 'Internal server error' }, { status: StatusCodes.INTERNAL_SERVER_ERROR });
	}
}
