// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useState } from 'react';
import { BN } from '@polkadot/util';
import { UnlockKeyhole } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useVoteUnlock } from '@/hooks/useVoteUnlock';
import { useUser } from '@/hooks/useUser';
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

	// Get the current user's address - prioritize defaultAddress, then first address
	const currentAddress = user?.defaultAddress || user?.addresses?.[0] || '';

	// Use the complete hook for vote unlock logic
	const { votingLocks, loading, nextUnlockData, totalUnlockableBalance, handleUnlockTokens } = useVoteUnlock(currentAddress);

	// Don't show if user doesn't have unlock access or no address
	if (!hasUnlockAccess || !currentAddress) {
		return null;
	}

	return (
		<>
			<button
				type='button'
				className={classes.unlockBalanceButton}
				onClick={() => setOpen(true)}
			>
				<UnlockKeyhole className='h-4 w-4 text-border_blue' />
				{nextUnlockData?.unlockTime ? (
					<>
						{t('Profile.UnlockIn')} {nextUnlockData.unlockTime}
					</>
				) : (
					<>{t('Profile.NoUnlocks')}</>
				)}
			</button>
			<VoteUnlockModal
				open={open}
				setOpen={setOpen}
				votingLocks={votingLocks}
				lockedBalance={new BN(lockedBalance)}
				totalUnlockableBalance={totalUnlockableBalance}
				onUnlock={handleUnlockTokens}
				loading={loading}
			/>
			<UnlockSuccessModal
				open={openSuccessModal}
				setOpen={setOpenSuccessModal}
				address={currentAddress}
			/>
		</>
	);
}

export default VoteUnlock;
