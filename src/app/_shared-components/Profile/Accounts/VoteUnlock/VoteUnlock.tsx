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
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { BlockCalculationsService } from '@/app/_client-services/block_calculations_service';
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
	const network = getCurrentNetwork();

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

	// Find the closest unlock time from locked and ongoing votes
	const getClosestUnlockTime = () => {
		const allLockedVotes = [...votingLocks.lockedVotes, ...votingLocks.ongoingVotes];

		if (allLockedVotes.length === 0) {
			return null;
		}

		// Find the vote with the smallest blocksRemaining
		const closestVote = allLockedVotes.reduce((closest, current) => {
			if (!closest.blocksRemaining || !current.blocksRemaining) return closest;
			return current.blocksRemaining.lt(closest.blocksRemaining) ? current : closest;
		});

		if (!closestVote.blocksRemaining) {
			return null;
		}

		// Calculate time remaining using the same logic as VoteDetailCard
		const { totalSeconds } = BlockCalculationsService.getTimeForBlocks({
			network,
			blocks: closestVote.blocksRemaining
		});

		const days = Math.floor(totalSeconds / (24 * 60 * 60));
		const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60));
		const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);

		if (days > 0) {
			return `${days} ${t('Profile.days')}, ${hours} ${t('Profile.hours')}`;
		}
		if (hours > 0) {
			return `${hours} ${t('Profile.hours')}, ${minutes} ${t('Profile.minutes')}`;
		}
		if (minutes > 0) {
			return `${minutes} ${t('Profile.minutes')}`;
		}
		return t('Profile.LessThanOneMinute');
	};

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

	const closestUnlockTime = getClosestUnlockTime();

	return (
		<>
			{hasUnlockAccess && (
				<button
					type='button'
					className={classes.unlockBalanceButton}
					onClick={() => setOpen(true)}
				>
					<UnlockKeyhole className='h-4 w-4 text-border_blue' />
					{closestUnlockTime ? (
						<>
							{t('Profile.UnlockIn')} {closestUnlockTime}
						</>
					) : (
						<>{t('Profile.NoUnlocks')}</>
					)}
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
