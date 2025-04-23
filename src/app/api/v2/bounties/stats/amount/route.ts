// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextResponse } from 'next/server';
import { BN, BN_ZERO } from '@polkadot/util';
import { APIError } from '@/app/api/_api-utils/apiError';
import { ERROR_CODES } from '@/_shared/_constants/errorLiterals';
import { StatusCodes } from 'http-status-codes';
import { ENetwork } from '@shared/types';
import { getNetworkFromHeaders } from '@/app/api/_api-utils/getNetworkFromHeaders';
import { withErrorHandling } from '@/app/api/_api-utils/withErrorHandling';
import { SubsquidService } from '@/app/api/_api-services/onchain_db_service/subsquid_service';

export const GET = withErrorHandling(async (): Promise<NextResponse> => {
	const network = await getNetworkFromHeaders();
	if (!network || !Object.values(ENetwork).includes(network)) {
		throw new APIError(ERROR_CODES.INVALID_PARAMS_ERROR, StatusCodes.BAD_REQUEST, 'Invalid network in request header');
	}

	// Get active bounties with rewards from Subsquare via Subsquid
	const activeBountiesResponse = await SubsquidService.getActiveBountiesWithRewards(network);

	if (!activeBountiesResponse) {
		return NextResponse.json({ bountyAmount: '0' });
	}

	const activeProposals = activeBountiesResponse.data.items || [];

	// Sum up all bounty rewards
	const total = activeProposals.reduce((acc: BN, { reward }) => {
		return acc.add(new BN(reward || '0'));
	}, BN_ZERO);

	// Format the amount appropriately
	const bountyAmount = total.div(new BN(10).pow(new BN(10))).toString();

	return NextResponse.json({ bountyAmount });
});
