// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useState } from 'react';
import { BN } from '@polkadot/util';
import { UnlockKeyhole } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useVoteUnlock } from '@/hooks/useVoteUnlock';
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
	const [open, setOpen] = useState(false);

	// Use the optimized hook for all vote unlock logic
	const { loading, votingLocks, totalUnlockableBalance, nextUnlockTime, shouldShow, handleUnlockTokens } = useVoteUnlock({
		addresses,
		isReferendaPage,
		referendumIndex,
		onRefresh
	});

	if (!shouldShow) {
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
					{nextUnlockTime ? (
						<>
							{t('Profile.UnlockIn')} {nextUnlockTime}
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
