// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useCallback, useEffect, useMemo, useState } from 'react';
import { BN } from '@polkadot/util';
import { useTranslations } from 'next-intl';
import { IVotingLocks, ENotificationStatus, IVoteLock } from '@/_shared/types';
import { getNextUnlockData, calculateTotalUnlockableBalance } from '@/app/_client-utils/voteUnlockUtils';
import { useToast } from './useToast';
import { usePolkadotApiService } from './usePolkadotApiService';

export interface IUseVoteUnlockReturn {
	votingLocks: IVotingLocks;
	loading: boolean;
	error: string | null;
	nextUnlockData: IVoteLock | null;
	totalUnlockableBalance: BN;
	unlockSelectedVotes: (selectedVotes: IVoteLock[]) => Promise<{ success: boolean; unlockedAmount: BN }>;
	refetch: () => void;
}

export const useVoteUnlock = (address: string): IUseVoteUnlockReturn => {
	const { apiService } = usePolkadotApiService();
	const { toast } = useToast();
	const t = useTranslations();

	const [votingLocks, setVotingLocks] = useState<IVotingLocks>({
		lockedVotes: [],
		unlockableVotes: [],
		ongoingVotes: []
	});
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const fetchVotingLocks = useCallback(async () => {
		if (!apiService || !address) return;

		setLoading(true);
		setError(null);

		try {
			const locks = await apiService.getVotingLocks(address);
			setVotingLocks(
				locks || {
					lockedVotes: [],
					unlockableVotes: [],
					ongoingVotes: []
				}
			);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to fetch voting locks');
			setVotingLocks({
				lockedVotes: [],
				unlockableVotes: [],
				ongoingVotes: []
			});
		} finally {
			setLoading(false);
		}
	}, [apiService, address]);

	const nextUnlockData = useMemo(() => {
		return getNextUnlockData(votingLocks);
	}, [votingLocks]);

	const totalUnlockableBalance = useMemo(() => {
		return calculateTotalUnlockableBalance(votingLocks.unlockableVotes);
	}, [votingLocks.unlockableVotes]);

	const unlockSelectedVotes = useCallback(
		async (selectedVotes: IVoteLock[]) => {
			if (!apiService || !address || !selectedVotes.length) {
				return { success: false, unlockedAmount: new BN(0) };
			}

			// Calculate total amount being unlocked
			const unlockedAmount = selectedVotes.reduce((total, vote) => total.add(vote.balance), new BN(0));

			setLoading(true);

			try {
				// Wrap the unlock operation in a Promise that waits for the actual transaction result
				return await new Promise<{ success: boolean; unlockedAmount: BN }>((resolve, reject) => {
					apiService.unlockVotingTokens({
						address,
						unlockableVotes: selectedVotes,
						onSuccess: async () => {
							toast({
								title: t('Profile.unlockSuccess'),
								description: t('Profile.unlockSuccessDescription'),
								status: ENotificationStatus.SUCCESS
							});
							// Refresh data after successful unlock and wait for it to complete
							await fetchVotingLocks();
							// Resolve with success only when data refresh is complete
							resolve({ success: true, unlockedAmount });
						},
						onFailed: (errorMessage: string) => {
							toast({
								title: t('Profile.unlockFailed'),
								description: errorMessage,
								status: ENotificationStatus.ERROR
							});
							// Reject when transaction fails
							reject(new Error(errorMessage));
						}
					});
				});
			} catch (err) {
				console.error('Error unlocking tokens:', err);
				const errorMessage = err instanceof Error ? err.message : t('Profile.unlockFailedDescription');

				// Only show toast if it wasn't already shown in onFailed callback
				if (!(err instanceof Error && err.message !== t('Profile.unlockFailedDescription'))) {
					toast({
						title: t('Profile.unlockFailed'),
						description: errorMessage,
						status: ENotificationStatus.ERROR
					});
				}

				return { success: false, unlockedAmount: new BN(0) };
			} finally {
				setLoading(false);
			}
		},
		[apiService, address, toast, t, fetchVotingLocks]
	);

	const refetch = useCallback(() => {
		fetchVotingLocks();
	}, [fetchVotingLocks]);

	useEffect(() => {
		fetchVotingLocks();
	}, [fetchVotingLocks]);

	return {
		votingLocks,
		loading,
		error,
		nextUnlockData,
		totalUnlockableBalance,
		unlockSelectedVotes,
		refetch
	};
};
