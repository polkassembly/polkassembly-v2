// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useState, useEffect, useMemo, useCallback } from 'react';
import { BN } from '@polkadot/util';
import { useTranslations } from 'next-intl';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { ENotificationStatus, IVotingLocks, IVoteLock } from '@/_shared/types';
import { processVotingLocksForDisplay, getnextUnlockTime, shouldShowOnReferendaPage } from '@/app/_client-utils/voteUnlockUtils';
import { useToast } from './useToast';
import { useUserPreferences } from './useUserPreferences';
import { usePolkadotApiService } from './usePolkadotApiService';

interface UseVoteUnlockProps {
	addresses?: string[];
	isReferendaPage?: boolean;
	referendumIndex?: number;
	onRefresh?: () => void;
}

interface UseVoteUnlockReturn {
	// State
	loading: boolean;
	votingLocks: IVotingLocks;

	// Computed values
	totalUnlockableBalance: BN;
	combinedLockedVotes: IVoteLock[];
	hasUnlockableVotes: boolean;
	hasLockedVotes: boolean;
	nextUnlockTime: string | null;
	shouldShow: boolean;

	// Actions
	fetchVotingLocks: () => Promise<void>;
	handleUnlockTokens: () => Promise<void>;

	// Utils
	currentAddress: string;
	network: ReturnType<typeof getCurrentNetwork>;
}

export const useVoteUnlock = ({ addresses = [], isReferendaPage = false, referendumIndex, onRefresh }: UseVoteUnlockProps): UseVoteUnlockReturn => {
	const t = useTranslations();
	const { userPreferences } = useUserPreferences();
	const { apiService } = usePolkadotApiService();
	const { toast } = useToast();
	const network = getCurrentNetwork();

	const [loading, setLoading] = useState(false);
	const [votingLocks, setVotingLocks] = useState<IVotingLocks>({
		lockedVotes: [],
		unlockableVotes: [],
		ongoingVotes: []
	});

	const currentAddress = userPreferences.selectedAccount?.address || addresses[0] || '';

	// Memoized computed values to prevent unnecessary recalculations
	const computedValues = useMemo(() => {
		const processed = processVotingLocksForDisplay(votingLocks);
		const nextUnlockTime = getnextUnlockTime(votingLocks, network, t);
		const shouldShow = shouldShowOnReferendaPage(isReferendaPage, votingLocks.unlockableVotes, referendumIndex);

		return {
			...processed,
			nextUnlockTime,
			shouldShow
		};
	}, [votingLocks, network, t, isReferendaPage, referendumIndex]);

	// Fetch voting locks with error handling
	const fetchVotingLocks = useCallback(async () => {
		if (!apiService || !currentAddress) return;

		setLoading(true);
		try {
			const locks = await apiService.getVotingLocks(currentAddress);
			if (locks) {
				setVotingLocks(locks);
			}
		} catch (error) {
			console.error('Error fetching voting locks:', error);
			toast({
				title: 'Error',
				description: 'Failed to fetch voting locks',
				status: ENotificationStatus.ERROR
			});
		} finally {
			setLoading(false);
		}
	}, [apiService, currentAddress, toast]);

	// Handle token unlocking with optimized transaction batching
	const handleUnlockTokens = useCallback(async () => {
		if (!apiService || !currentAddress || !votingLocks.unlockableVotes.length) return;

		setLoading(true);
		try {
			await apiService.unlockVotingTokens({
				address: currentAddress,
				unlockableVotes: votingLocks.unlockableVotes,
				onSuccess: () => {
					toast({
						title: 'Success',
						description: 'Tokens unlocked successfully',
						status: ENotificationStatus.SUCCESS
					});
					// Refresh data after successful unlock
					fetchVotingLocks();
					onRefresh?.();
				},
				onFailed: (error: string) => {
					toast({
						title: 'Error',
						description: error,
						status: ENotificationStatus.ERROR
					});
				}
			});
		} catch (error) {
			console.error('Error unlocking tokens:', error);
			toast({
				title: 'Error',
				description: 'Failed to unlock tokens',
				status: ENotificationStatus.ERROR
			});
		} finally {
			setLoading(false);
		}
	}, [apiService, currentAddress, votingLocks.unlockableVotes, toast, fetchVotingLocks, onRefresh]);

	// Auto-fetch when dependencies change
	useEffect(() => {
		if (currentAddress) {
			fetchVotingLocks();
		}
	}, [currentAddress, fetchVotingLocks]);

	return {
		// State
		loading,
		votingLocks,

		// Computed values
		...computedValues,

		// Actions
		fetchVotingLocks,
		handleUnlockTokens,

		// Utils
		currentAddress,
		network
	};
};
