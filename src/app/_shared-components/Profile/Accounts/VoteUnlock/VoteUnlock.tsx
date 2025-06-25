// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useState, useEffect } from 'react';
import { BN, BN_ZERO } from '@polkadot/util';
import { usePolkadotApiService } from '@/hooks/usePolkadotApiService';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useToast } from '@/hooks/useToast';
import { ENotificationStatus, IVotingLocks } from '@/_shared/types';
import { UnlockKeyhole } from 'lucide-react';
import { useTranslations } from 'next-intl';
import classes from './VoteUnlock.module.scss';
import VoteUnlockModal from './VoteUnlockModal';

interface VoteUnlockProps {
	addresses?: string[];
	isReferendaPage?: boolean;
	referendumIndex?: number;
	onRefresh?: () => void;
	lockedBalance: string;
	hasUnlockAccess: boolean;
}

function VoteUnlock({ addresses = [], isReferendaPage = false, referendumIndex, onRefresh, lockedBalance, hasUnlockAccess }: VoteUnlockProps) {
	const t = useTranslations();
	const { userPreferences } = useUserPreferences();
	const { apiService } = usePolkadotApiService();
	const { toast } = useToast();

	const [loading, setLoading] = useState(false);
	const [votingLocks, setVotingLocks] = useState<IVotingLocks>({
		lockedVotes: [],
		unlockableVotes: [],
		ongoingVotes: []
	});
	const [open, setOpen] = useState(false);

	const currentAddress = userPreferences.selectedAccount?.address || addresses[0] || '';

	// Calculate total unlockable balance
	const totalUnlockableBalance = votingLocks.unlockableVotes.reduce((total, vote) => {
		return total.gt(vote.balance) ? total : vote.balance;
	}, BN_ZERO);

	// For referenda page, only show if there are unlockable votes for this referendum
	const shouldShowOnReferendaPage = !isReferendaPage || votingLocks.unlockableVotes.some((vote) => vote.refId === referendumIndex?.toString());

	const fetchVotingLocks = async () => {
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
	};

	const handleUnlockTokens = async () => {
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
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (currentAddress) {
			fetchVotingLocks();
		}
	}, [currentAddress, apiService]);

	if (!shouldShowOnReferendaPage) {
		return null;
	}

	return (
		<>
			{hasUnlockAccess && (
				<button
					type='button'
					className={classes.unlockBalanceButton}
					onClick={() => setOpen(true)}
				>
					<UnlockKeyhole className='h-4 w-4 text-border_blue' />
					{t('Profile.unlock')} {t('Profile.in')} {t('Profile.days')} {t('Profile.hours')}
				</button>
			)}
			<VoteUnlockModal
				open={open}
				setOpen={setOpen}
				votingLocks={votingLocks}
				lockedBalance={new BN(lockedBalance)}
				totalUnlockableBalance={totalUnlockableBalance}
				onUnlock={handleUnlockTokens}
				loading={loading}
			/>
		</>
	);
}

export default VoteUnlock;
