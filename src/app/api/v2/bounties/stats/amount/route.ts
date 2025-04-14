// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextRequest, NextResponse } from 'next/server';
import { BN, BN_ZERO } from '@polkadot/util';
import { APIError } from '@/app/api/_api-utils/apiError';
import { ERROR_CODES } from '@/_shared/_constants/errorLiterals';
import { StatusCodes } from 'http-status-codes';
import { ENetwork } from '@shared/types';
import { OnChainDbService } from '@/app/api/_api-services/onchain_db_service';
import { getNetworkFromHeaders } from '@/app/api/_api-utils/getNetworkFromHeaders';
import { withErrorHandling } from '@/app/api/_api-utils/withErrorHandling';

export const GET = withErrorHandling(async (req: NextRequest): Promise<NextResponse> => {
	const network = await getNetworkFromHeaders();
	if (!network || !Object.values(ENetwork).includes(network as ENetwork)) {
		throw new APIError(ERROR_CODES.INVALID_PARAMS_ERROR, StatusCodes.BAD_REQUEST, 'Invalid network in request header');
	}

	const url = new URL(req.url);
	const bountyIds = url.searchParams.get('bountyIds');

	if (!bountyIds) {
		throw new APIError(ERROR_CODES.INVALID_PARAMS_ERROR, StatusCodes.BAD_REQUEST, 'Missing bounty IDs');
	}

	const bountyIdArray = bountyIds.split(',');

	const balances = await Promise.all(
		bountyIdArray.map(async (id: string) => {
			if (!id) return new BN(0);

			const bountyData = await OnChainDbService.GetBountyAmount(network as ENetwork, id);
			const address = bountyData?.address;

			if (!address) {
				const metadataValue = bountyData?.meta?.value || 0;
				return new BN(metadataValue);
			}

			try {
				return new BN(bountyData?.amount || 0);
			} catch (error) {
				console.error(`Error processing bounty amount for bounty ${id}: ${error}`);
				return new BN(0);
			}
		})
	);

	const total = balances.reduce((acc: BN, curr: BN) => acc.add(curr), BN_ZERO);
	const bountyAmount = total.div(new BN(10).pow(new BN(10))).toString();

	return NextResponse.json({ bountyAmount: bountyAmount.toString() });
});
