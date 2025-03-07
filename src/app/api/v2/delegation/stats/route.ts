// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextResponse } from 'next/server';
import { OnChainDbService } from '@/app/api/_api-services/onchain_db_service';
import { getNetworkFromHeaders } from '@/app/api/_api-utils/getNetworkFromHeaders';
import { EDelegationType, IDelegationStats } from '@/_shared/types';
import { BN } from '@polkadot/util';

export async function GET() {
	try {
		const network = await getNetworkFromHeaders();
		const data = await OnChainDbService.GetTotalDelegationStats({ network, type: EDelegationType.OPEN_GOV });

		let totalDelegatedBalance = new BN(0);
		const totalDelegatorsObj: Record<string, number> = {};
		const totalDelegatesObj: Record<string, number> = {};

		if (Array.isArray(data?.votingDelegations)) {
			data.votingDelegations.forEach((item: { balance: string; to: string; from: string }) => {
				const bnBalance = new BN(item.balance);
				totalDelegatedBalance = totalDelegatedBalance.add(bnBalance);

				if (totalDelegatesObj[item.to] === undefined) {
					totalDelegatesObj[item.to] = 1;
				}
				if (totalDelegatorsObj[item.from] === undefined) {
					totalDelegatorsObj[item.from] = 1;
				}
			});
		} else {
			console.error('votingDelegations is not an array or is undefined:', data?.votingDelegations);
		}

		const delegationStats: IDelegationStats = {
			totalDelegatedBalance: totalDelegatedBalance.toString(),
			totalDelegatedVotes: {
				totalCount: data?.totalDelegatedVotes?.totalCount || 0
			},
			totalDelegates: Object.keys(totalDelegatesObj).length,
			totalDelegators: Object.keys(totalDelegatorsObj).length
		};

		return NextResponse.json(delegationStats);
	} catch (error) {
		console.error('Error in delegation stats route:', error);
		return NextResponse.json({ error: 'Failed to fetch delegation statistics' }, { status: 500 });
	}
}
