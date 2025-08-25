// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useQuery } from '@tanstack/react-query';
import { BN } from '@polkadot/util';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { ClientError } from '@/app/_client-utils/clientError';
import { EDelegationStatus, ITrackDelegationStats } from '@/_shared/types';
import { usePolkadotApiService } from './usePolkadotApiService';

interface UserBalanceData {
	votingPower: {
		total: number;
		self: number;
		delegated: number;
	};
	available: number;
	delegated: number;
}

// Utility function to calculate voting power (similar to existing pattern in codebase)
const calculateVotingPower = (balance: string, lockPeriod: number): BN => {
	if (lockPeriod) {
		return new BN(balance).mul(new BN(lockPeriod));
	}
	return new BN(balance).div(new BN('10'));
};

// Utility function to convert from planck to DOT
const planckToDOT = (planckValue: BN): number => {
	return parseFloat(planckValue.toString()) / 10 ** 10;
};

const getUpdatedDelegationData = (delegationData: ITrackDelegationStats[]) => {
	let totalDelegated = new BN(0);
	let totalReceived = new BN(0);

	delegationData.forEach((delegation) => {
		if (delegation.status === EDelegationStatus.RECEIVED || delegation.status === EDelegationStatus.DELEGATED) {
			delegation?.delegations?.forEach((d) => {
				const votingPower = calculateVotingPower(d.balance, d?.lockPeriod || 0);
				if (delegation.status === EDelegationStatus.RECEIVED) {
					totalReceived = totalReceived.add(votingPower);
				} else {
					totalDelegated = totalDelegated.add(votingPower);
				}
			});
		}
	});

	return {
		totalDelegated: totalDelegated.toString(),
		totalReceived: totalReceived.toString()
	};
};

export const useUserBalanceData = (address?: string) => {
	const { apiService } = usePolkadotApiService();

	const getDelegations = async () => {
		if (!address) return { totalDelegated: '0', totalReceived: '0' };

		const { data: delegationData, error: delegationError } = await NextApiClientService.getDelegateTracks({ address });

		if (delegationError || !delegationData) {
			throw new ClientError(delegationError?.message || 'Failed to fetch delegation data');
		}

		return getUpdatedDelegationData(delegationData.delegationStats || []);
	};

	const { data: delegationData, isFetching: isDelegationFetching } = useQuery({
		queryKey: ['userDelegationData', address],
		queryFn: () => getDelegations(),
		enabled: !!address,
		retry: false,
		refetchOnMount: false,
		refetchOnWindowFocus: false
	});

	const getBalances = async () => {
		if (!address || !apiService) return { freeBalance: new BN(0), lockedBalance: new BN(0), totalBalance: new BN(0), transferableBalance: new BN(0) };

		return apiService.getUserBalances({ address });
	};

	const { data: balanceData, isFetching: isBalanceFetching } = useQuery({
		queryKey: ['userBalanceData', address],
		queryFn: () => getBalances(),
		enabled: !!address && !!apiService,
		retry: false,
		refetchOnMount: false,
		refetchOnWindowFocus: false
	});

	// Calculate user balance data
	const userBalanceData: UserBalanceData = {
		votingPower: {
			total: 0,
			self: 0,
			delegated: 0
		},
		available: 0,
		delegated: 0
	};

	if (balanceData && delegationData) {
		// getUserBalances returns { freeBalance, lockedBalance, totalBalance, transferableBalance }
		const { lockedBalance, freeBalance } = balanceData;
		const totalReceived = new BN(delegationData.totalReceived || '0');
		const totalDelegated = new BN(delegationData.totalDelegated || '0');

		// Self voting power is the locked balance
		userBalanceData.votingPower.self = planckToDOT(lockedBalance);

		// Delegated voting power is what others have delegated to this address
		userBalanceData.votingPower.delegated = planckToDOT(totalReceived);

		// Total voting power is self + delegated
		userBalanceData.votingPower.total = userBalanceData.votingPower.self + userBalanceData.votingPower.delegated;

		// Available balance is free balance
		userBalanceData.available = planckToDOT(freeBalance);

		// Delegated balance is what this address has delegated to others
		userBalanceData.delegated = planckToDOT(totalDelegated);
	}

	return {
		userBalanceData,
		isLoading: isDelegationFetching || isBalanceFetching
	};
};

// Keep the old hook name for backward compatibility
export const useVotingPower = useUserBalanceData;
