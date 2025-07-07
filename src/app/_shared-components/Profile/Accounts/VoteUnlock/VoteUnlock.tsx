// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useState } from 'react';
import { BN, BN_MAX_INTEGER } from '@polkadot/util';
import { useUser } from '@/hooks/useUser';
import { useVoteUnlock } from '@/hooks/useVoteUnlock';
import { UnlockKeyhole } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { IVoteLock } from '@/_shared/types';
import classes from './VoteUnlock.module.scss';
import VoteUnlockModal from './VoteUnlockModal';
import UnlockSuccessModal from './UnlockSuccessModal/UnlockSuccessModal';

interface VoteUnlockProps {
	lockedBalance: string;
	hasUnlockAccess: boolean;
}

function VoteUnlock({ lockedBalance, hasUnlockAccess }: VoteUnlockProps) {
	const t = useTranslations();
	const { user } = useUser();
	const [open, setOpen] = useState(false);
	const [openSuccessModal, setOpenSuccessModal] = useState(false);
	const [unlockedAmount, setUnlockedAmount] = useState<BN>(new BN(0));

	// Get the current user's address - prioritize defaultAddress, then first address
	const currentAddress = user?.defaultAddress || user?.addresses?.[0] || '';

	const { votingLocks, loading, nextUnlockData, totalUnlockableBalance, unlockSelectedVotes } = useVoteUnlock(currentAddress);

	// Handle unlock with selected votes - smooth flow between modals
	const handleUnlock = async (selectedVotes: IVoteLock[]) => {
		if (selectedVotes.length === 0) return;

		try {
			const result = await unlockSelectedVotes(selectedVotes);

			if (result.success) {
				// Close unlock modal and show success modal with unlocked amount
				setUnlockedAmount(result.unlockedAmount);
				setOpen(false);
				setOpenSuccessModal(true);
				// Data will be refetched automatically by the hook
			}
			// Error handling is already done in the hook
		} catch (error) {
			console.error('Error unlocking tokens:', error);
		}
	};

	// Don't show if user doesn't have unlock access or no address
	if (!hasUnlockAccess || !currentAddress) {
		return null;
	}

	// Get display text for the button
	const buttonText = (() => {
		// First priority: if there are unlockable votes
		if (votingLocks.unlockableVotes.length > 0) {
			return t('Profile.UnlockYourTokens');
		}
		// Second priority: if there are ongoing votes
		if (nextUnlockData?.endBlock.eq(BN_MAX_INTEGER)) {
			return `${t('Profile.ProposalOngoing')}: #${nextUnlockData.refId}`;
		}
		// Default: no unlocks available
		return t('Profile.NoUnlocks');
	})();

	return (
		<>
			<button
				type='button'
				className={classes.unlockBalanceButton}
				onClick={() => setOpen(true)}
			>
				<UnlockKeyhole className='h-4 w-4 text-border_blue' />
				{buttonText}
			</button>

			<VoteUnlockModal
				open={open}
				setOpen={setOpen}
				votingLocks={votingLocks}
				lockedBalance={new BN(lockedBalance)}
				totalUnlockableBalance={totalUnlockableBalance}
				onUnlock={handleUnlock}
				loading={loading}
			/>

			<UnlockSuccessModal
				open={openSuccessModal}
				setOpen={setOpenSuccessModal}
				address={currentAddress}
				unlockedAmount={unlockedAmount}
			/>
		</>
	);
}

export default VoteUnlock;
