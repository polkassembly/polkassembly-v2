// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useCallback, useEffect, useMemo, useState } from 'react';
import { BN } from '@polkadot/util';
import { useTranslations } from 'next-intl';
import { IVotingLocks, ENotificationStatus, IVoteLock } from '@/_shared/types';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { getNextUnlockData, calculateTotalUnlockableBalance } from '@/app/_client-utils/voteUnlockUtils';
import { useToast } from './useToast';
import { usePolkadotApiService } from './usePolkadotApiService';

export interface IUseVoteUnlockReturn {
	votingLocks: IVotingLocks;
	loading: boolean;
	error: string | null;
	nextUnlockData: IVoteLock | null;
	totalUnlockableBalance: BN;
	handleUnlockTokens: () => Promise<void>;
	refetch: () => void;
}

export const useVoteUnlock = (address: string): IUseVoteUnlockReturn => {
	const { apiService } = usePolkadotApiService();
	const { toast } = useToast();
	const t = useTranslations();
	const network = getCurrentNetwork();

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
		return getNextUnlockData(votingLocks, network, t);
	}, [votingLocks, network, t]);

	const totalUnlockableBalance = useMemo(() => {
		return calculateTotalUnlockableBalance(votingLocks.unlockableVotes);
	}, [votingLocks.unlockableVotes]);

	const handleUnlockTokens = useCallback(async () => {
		if (!apiService || !address || !votingLocks.unlockableVotes.length) return;

		setLoading(true);
		try {
			await apiService.unlockVotingTokens({
				address,
				unlockableVotes: votingLocks.unlockableVotes,
				onSuccess: () => {
					toast({
						title: t('Profile.success'),
						description: t('Profile.tokensUnlockedSuccessfully'),
						status: ENotificationStatus.SUCCESS
					});
					// Refresh data after successful unlock
					fetchVotingLocks();
				},
				onFailed: (errorMessage: string) => {
					toast({
						title: t('Profile.error'),
						description: errorMessage,
						status: ENotificationStatus.ERROR
					});
				}
			});
		} catch (err) {
			console.error('Error unlocking tokens:', err);
			toast({
				title: t('Profile.error'),
				description: t('Profile.failedToUnlockTokens'),
				status: ENotificationStatus.ERROR
			});
		} finally {
			setLoading(false);
		}
	}, [apiService, address, votingLocks.unlockableVotes, toast, t, fetchVotingLocks]);

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
		handleUnlockTokens,
		refetch
	};
};
