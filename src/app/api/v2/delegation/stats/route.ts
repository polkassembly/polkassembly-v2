// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextResponse } from 'next/server';
import { BN } from '@polkadot/util';
import { OnChainDbService } from '@/app/api/_api-services/onchain_db_service';
import { getNetworkFromHeaders } from '@/app/api/_api-utils/getNetworkFromHeaders';
import { EDelegationType, IDelegationStats } from '@/_shared/types';
import { APIError } from '@/app/api/_api-utils/apiError';
import { ERROR_CODES } from '@/_shared/_constants/errorLiterals';
import { StatusCodes } from 'http-status-codes';
import { RedisService } from '@/app/api/_api-services/redis_service';
import { withErrorHandling } from '@/app/api/_api-utils/withErrorHandling';

interface DelegationCounts {
	delegates: Record<string, number>;
	delegators: Record<string, number>;
	totalBalance: BN;
}

interface SimplifiedVotingDelegation {
	balance: string;
	to: string;
	from: string;
}

const calculateDelegationStats = (votingDelegations: SimplifiedVotingDelegation[]): DelegationCounts => {
	return votingDelegations.reduce(
		(acc: DelegationCounts, item) => {
			const balance = new BN(item.balance);
			acc.totalBalance = acc.totalBalance.add(balance);

			if (!acc.delegates[item.to]) acc.delegates[item.to] = 1;
			if (!acc.delegators[item.from]) acc.delegators[item.from] = 1;

			return acc;
		},
		{ delegates: {}, delegators: {}, totalBalance: new BN(0) }
	);
};
const formatDelegationStats = (counts: DelegationCounts, totalDelegatedVotes: number): IDelegationStats => ({
	totalDelegatedBalance: counts.totalBalance.toString(),
	totalDelegatedVotes,
	totalDelegates: Object.keys(counts.delegates).length,
	totalDelegators: Object.keys(counts.delegators).length
});

export const GET = withErrorHandling(async (): Promise<NextResponse> => {
	const network = await getNetworkFromHeaders();

	const cachedStats = await RedisService.GetDelegationStats(network);
	if (cachedStats) {
		return NextResponse.json(cachedStats);
	}

	const data = (await OnChainDbService.GetTotalDelegationStats({
		network,
		type: EDelegationType.OPEN_GOV
	})) as unknown as {
		totalDelegatedVotes: number;
		votingDelegations: SimplifiedVotingDelegation[];
		totalDelegates: number;
	};

	if (!data || !Array.isArray(data.votingDelegations)) {
		throw new APIError(ERROR_CODES.NOT_FOUND, StatusCodes.INTERNAL_SERVER_ERROR, 'Invalid delegation data structure');
	}
	const counts = calculateDelegationStats(data.votingDelegations);
	console.log('totalDelegatedVotes', data?.totalDelegatedVotes);
	const stats = formatDelegationStats(counts, data?.totalDelegatedVotes || 0);

	await RedisService.SetDelegationStats(network, stats);

	return NextResponse.json(stats);
});
