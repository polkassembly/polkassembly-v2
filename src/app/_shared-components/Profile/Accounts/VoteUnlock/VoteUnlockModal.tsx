// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { BN } from '@polkadot/util';
import { useState, useMemo, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/_shared-components/Dialog/Dialog';
import { Button } from '@/app/_shared-components/Button';
import Image from 'next/image';
import TreasureChestIcon from '@assets/icons/treasure-chest.svg';
import { IVotingLocks, IVoteLock } from '@/_shared/types';
import { UnlockKeyhole } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Separator } from '@/app/_shared-components/Separator';
import { combineLockedVotes } from '@/app/_client-utils/voteUnlockUtils';
import classes from './VoteUnlock.module.scss';
import LockVotesList from './LockVotesList/LockVotesList';
import UnlockVotesList from './UnlockVotesList/UnlockVotesList';

interface VoteUnlockModalProps {
	open: boolean;
	setOpen: (open: boolean) => void;
	votingLocks: IVotingLocks;
	lockedBalance: BN;
	totalUnlockableBalance: BN;
	onUnlock: (selectedVotes: IVoteLock[]) => void;
	loading: boolean;
}

function VoteUnlockModal({ open, setOpen, votingLocks, lockedBalance, totalUnlockableBalance, onUnlock, loading }: VoteUnlockModalProps) {
	const t = useTranslations();

	// Create a unique key for each vote to track selection
	const getVoteKey = (vote: IVoteLock) => `${vote.refId}-${vote.track}`;

	// Initialize selected votes (all unlockable votes selected by default)
	const [selectedVotes, setSelectedVotes] = useState<Set<string>>(() => {
		const initialSelection = new Set<string>();
		votingLocks.unlockableVotes.forEach((vote) => {
			initialSelection.add(getVoteKey(vote));
		});
		return initialSelection;
	});

	// Calculate selected votes and total balance
	const { selectedVotesList } = useMemo(() => {
		const selectedList: IVoteLock[] = [];

		votingLocks.unlockableVotes.forEach((vote) => {
			if (selectedVotes.has(getVoteKey(vote))) {
				selectedList.push(vote);
			}
		});

		return {
			selectedVotesList: selectedList
		};
	}, [votingLocks.unlockableVotes, selectedVotes]);

	// Handle vote selection change
	const handleVoteSelectionChange = useCallback((vote: IVoteLock, selected: boolean) => {
		const voteKey = getVoteKey(vote);
		setSelectedVotes((prev) => {
			const newSelection = new Set(prev);
			if (selected) {
				newSelection.add(voteKey);
			} else {
				newSelection.delete(voteKey);
			}
			return newSelection;
		});
	}, []);

	// Handle unlock action
	const handleUnlock = () => {
		onUnlock(selectedVotesList);
	};

	// Reset selection when modal opens
	const handleOpenChange = (isOpen: boolean) => {
		if (isOpen) {
			// Reset to all selected when opening
			const initialSelection = new Set<string>();
			votingLocks.unlockableVotes.forEach((vote) => {
				initialSelection.add(getVoteKey(vote));
			});
			setSelectedVotes(initialSelection);
		}
		setOpen(isOpen);
	};

	// Use utility to combine locked and ongoing votes for display
	const combinedLockedVotes = combineLockedVotes(votingLocks);

	return (
		<Dialog
			open={open}
			onOpenChange={handleOpenChange}
		>
			<DialogContent className={`${classes.dialogContent} ${classes.dialog}`}>
				<DialogHeader className='border-0 p-4'>
					<DialogTitle className={classes.dialogTitle}>
						<Image
							src={TreasureChestIcon}
							alt='Vote Unlock'
							width={100}
							height={100}
						/>
					</DialogTitle>
				</DialogHeader>

				<div className={classes.contentContainer}>
					<UnlockVotesList
						votingLocks={votingLocks.unlockableVotes}
						balance={totalUnlockableBalance}
						selectedVotes={selectedVotes}
						onVoteSelectionChange={handleVoteSelectionChange}
					/>

					<LockVotesList
						votingLocks={combinedLockedVotes}
						balance={lockedBalance}
					/>
				</div>
				<Separator className='my-0' />
				<div className={classes.modalFooter}>
					<Button
						variant='default'
						onClick={handleUnlock}
						isLoading={loading}
						disabled={totalUnlockableBalance.isZero() || selectedVotesList.length === 0}
					>
						<UnlockKeyhole className='h-4 w-4 text-white' />
						{t('Profile.UnlockTokens')}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}

export default VoteUnlockModal;
