// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useQuery } from '@tanstack/react-query';
import { BN } from '@polkadot/util';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { EDelegationStatus, ITrackDelegationStats } from '@/_shared/types';
import { usePolkadotApiService } from './usePolkadotApiService';

interface UserBalanceData {
	votingPower: {
		total: BN;
		self: BN;
		delegated: BN;
	};
	available: BN;
	delegated: BN;
}

// Utility function to calculate voting power (similar to existing pattern in codebase)
const calculateVotingPower = (balance: string, lockPeriod: number): BN => {
	if (lockPeriod) {
		return new BN(balance).mul(new BN(lockPeriod));
	}
	return new BN(balance).div(new BN('10'));
};

const getUpdatedDelegationData = (delegationData: ITrackDelegationStats[]) => {
	// Token totals (raw balances)
	let totalDelegated = new BN(0);
	let totalReceived = new BN(0);
	// Voting power totals - track the max voting power per track
	const delegatedVPByTrack = new Map<number, BN>();
	const receivedVPByTrack = new Map<number, BN>();

	// Handle edge case with empty delegationData
	if (!delegationData?.length) {
		return {
			totalDelegated: '0',
			totalReceived: '0',
			maxDelegatedVP: '0',
			maxReceivedVP: '0'
		};
	}

	delegationData.forEach((delegation) => {
		if (delegation.status === EDelegationStatus.RECEIVED || delegation.status === EDelegationStatus.DELEGATED) {
			// Handle edge case with empty delegations array
			if (!delegation?.delegations?.length) return;

			delegation.delegations.forEach((d) => {
				// Ensure we have valid balance values
				const balance = d.balance || '0';
				const balanceBn = new BN(balance);
				const votingPower = calculateVotingPower(balance, d?.lockPeriod || 0);
				// Use track ID from the delegation
				const { trackId } = delegation;

				if (delegation.status === EDelegationStatus.RECEIVED) {
					totalReceived = totalReceived.add(balanceBn);
					// Add voting power to the track's total
					const currentTrackVP = receivedVPByTrack.get(trackId) || new BN(0);
					receivedVPByTrack.set(trackId, currentTrackVP.add(votingPower));
				} else {
					totalDelegated = totalDelegated.add(balanceBn);
					// Add voting power to the track's total
					const currentTrackVP = delegatedVPByTrack.get(trackId) || new BN(0);
					delegatedVPByTrack.set(trackId, currentTrackVP.add(votingPower));
				}
			});
		}
	});

	// Find maximum voting power across tracks for both delegated and received
	const trackDelegatedPowers = Array.from(delegatedVPByTrack.values());
	const maxDelegatedVP = trackDelegatedPowers.length > 0 ? trackDelegatedPowers.reduce((max, current) => (current.gt(max) ? current : max), new BN(0)) : new BN(0);

	const trackReceivedPowers = Array.from(receivedVPByTrack.values());
	const maxReceivedVP = trackReceivedPowers.length > 0 ? trackReceivedPowers.reduce((max, current) => (current.gt(max) ? current : max), new BN(0)) : new BN(0);

	return {
		totalDelegated: totalDelegated.toString(), // tokens
		totalReceived: totalReceived.toString(), // tokens
		maxDelegatedVP: maxDelegatedVP.toString(), // maximum delegated voting power per track
		maxReceivedVP: maxReceivedVP.toString() // maximum received voting power per track
	};
};

export const useUserBalanceData = (address?: string) => {
	const { apiService } = usePolkadotApiService();

	const getDelegations = async () => {
		if (!address) return { totalDelegated: '0', totalReceived: '0', maxDelegatedVP: '0', maxReceivedVP: '0' };

		try {
			const { data: delegationData, error: delegationError } = await NextApiClientService.getDelegateTracks({ address });

			if (delegationError || !delegationData) {
				return null;
			}

			return getUpdatedDelegationData(delegationData.delegationStats || []);
		} catch {
			// Silent fail with default values
			return { totalDelegated: '0', totalReceived: '0', maxDelegatedVP: '0', maxReceivedVP: '0' };
		}
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
			total: new BN(0),
			self: new BN(0),
			delegated: new BN(0)
		},
		available: new BN(0),
		delegated: new BN(0)
	};

	if (balanceData && delegationData) {
		// getUserBalances returns { freeBalance, lockedBalance, totalBalance, transferableBalance }
		const { totalBalance } = balanceData;
		const maxReceivedVP = new BN('maxReceivedVP' in delegationData ? delegationData.maxReceivedVP || '0' : '0');
		const maxDelegatedVP = new BN('maxDelegatedVP' in delegationData ? delegationData.maxDelegatedVP || '0' : '0');

		// Self voting power is the free balance
		userBalanceData.votingPower.self = totalBalance;

		// Delegated voting power is what others have delegated to this address (max received)
		userBalanceData.votingPower.delegated = maxReceivedVP;

		// Total voting power is self + max received delegations
		userBalanceData.votingPower.total = totalBalance.mul(new BN(6)).add(maxReceivedVP);

		// Available balance is total balance of an account
		userBalanceData.available = totalBalance;

		// Delegated balance is the maximum delegated voting power (not the sum)
		userBalanceData.delegated = maxDelegatedVP;
	}

	return {
		userBalanceData,
		isLoading: isDelegationFetching || isBalanceFetching
	};
};

// Keep the old hook name for backward compatibility
export const useVotingPower = useUserBalanceData;
