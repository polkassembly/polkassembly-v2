// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextRequest, NextResponse } from 'next/server';
import { isAddress } from '@polkadot/util-crypto';
import { getEncodedAddress } from '@/_shared/_utils/getEncodedAddress';
import { z } from 'zod';
import { IDelegate } from '@/_shared/types';
import { ERROR_CODES } from '@/_shared/_constants/errorLiterals';
import { StatusCodes } from 'http-status-codes';
import { getNetworkFromHeaders } from '../../../_api-utils/getNetworkFromHeaders';
import { APIError } from '../../../_api-utils/apiError';
import { fetchAllDelegateSources, fetchDelegateAnalytics } from '../../../_api-utils/delegateUtils';
import { RedisService } from '../../../_api-services/redis_service';
import { withErrorHandling } from '../../../_api-utils/withErrorHandling';

const querySchema = z.object({
	address: z.string().min(1, 'Address is required')
});

export const GET = withErrorHandling(async (req: NextRequest, { params }: { params: Promise<{ address: string }> }): Promise<NextResponse> => {
	const network = await getNetworkFromHeaders();

	const { address } = querySchema.parse(await params);

	const encodedAddress = getEncodedAddress(address, network);
	console.log('encodedAddress', encodedAddress);
	if (!encodedAddress && !isAddress(address)) {
		throw new APIError(ERROR_CODES.ADDRESS_NOT_FOUND_ERROR, StatusCodes.BAD_REQUEST);
	}

	const cachedDelegates = await RedisService.GetDelegates(network);

	if (cachedDelegates) {
		const delegate = cachedDelegates.find((d: IDelegate) => d.address === address);
		if (delegate) {
			return NextResponse.json({ delegate });
		}
	}

	const delegateSources = await fetchAllDelegateSources(network);
	if (!delegateSources.length) {
		throw new APIError(ERROR_CODES.NOT_FOUND, StatusCodes.NOT_FOUND);
	}

	const delegate = delegateSources.find((d) => d.address === address);
	if (!delegate) {
		throw new APIError(ERROR_CODES.ADDRESS_NOT_FOUND_ERROR, StatusCodes.NOT_FOUND);
	}

	const analytics = await fetchDelegateAnalytics(network, [address]);

	const combinedDelegate = {
		...delegate,
		...(analytics.find((a) => a.address === delegate.address) || {
			delegatedBalance: '0',
			receivedDelegationsCount: 0,
			votedProposalCount: 0
		})
	};

	await RedisService.SetDelegates(network, [combinedDelegate as unknown as IDelegate]);

	return NextResponse.json({
		delegate: combinedDelegate
	});
});
