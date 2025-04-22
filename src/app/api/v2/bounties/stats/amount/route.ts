// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextResponse } from 'next/server';
import { BN, BN_ZERO } from '@polkadot/util';
import { APIError } from '@/app/api/_api-utils/apiError';
import { ERROR_CODES } from '@/_shared/_constants/errorLiterals';
import { StatusCodes } from 'http-status-codes';
import { ENetwork } from '@shared/types';
import { PolkadotApiService } from '@/app/_client-services/polkadot_api_service';
import { OnChainDbService } from '@/app/api/_api-services/onchain_db_service';
import { getNetworkFromHeaders } from '@/app/api/_api-utils/getNetworkFromHeaders';
import { withErrorHandling } from '@/app/api/_api-utils/withErrorHandling';

interface Bounty {
	index: { toJSON: () => number };
	bounty: {
		status: {
			isFunded: boolean;
			isCuratorProposed: boolean;
			isActive: boolean;
		};
	};
}

export const GET = withErrorHandling(async (): Promise<NextResponse> => {
	const network = await getNetworkFromHeaders();
	if (!network || !Object.values(ENetwork).includes(network as ENetwork)) {
		throw new APIError(ERROR_CODES.INVALID_PARAMS_ERROR, StatusCodes.BAD_REQUEST, 'Invalid network in request header');
	}

	const api = await PolkadotApiService.Init(network as ENetwork);
	const activeBounties = await api.getActiveBounties();

	const balances = await Promise.all(
		activeBounties.map(async (bounty: Bounty) => {
			const id = bounty?.index?.toJSON();
			if (!id) return new BN(0);

			const bountyData = await OnChainDbService.GetBountyData(network as ENetwork, id.toString());
			const address = bountyData?.address;

			if (!address) {
				const metadataValue = bountyData?.meta?.value || 0;
				return new BN(metadataValue);
			}

			try {
				return await api.getAccountData(address);
			} catch (accountError) {
				console.error(`Error fetching account data for bounty ${id}: ${accountError}`);
				return new BN(0);
			}
		})
	);

	await api.disconnect();
	const total = balances.reduce((acc: BN, curr: BN) => acc.add(curr), BN_ZERO);
	const bountyAmount = total.div(new BN(10).pow(new BN(10))).toString();

	return NextResponse.json({ bountyAmount: bountyAmount.toString() });
});
