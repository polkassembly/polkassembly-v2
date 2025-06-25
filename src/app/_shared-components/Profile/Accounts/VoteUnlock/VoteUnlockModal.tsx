// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { BN } from '@polkadot/util';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/_shared-components/Dialog/Dialog';
import { Button } from '@/app/_shared-components/Button';
import Image from 'next/image';
import TreasureChestIcon from '@assets/icons/treasure-chest.svg';
import { IVotingLocks } from '@/_shared/types';
import { LockKeyhole, CheckCircle, UnlockKeyhole } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Separator } from '@/app/_shared-components/Separator';
import classes from './VoteUnlock.module.scss';
import VotesList from './VotesList/VotesList';

interface VoteUnlockModalProps {
	open: boolean;
	setOpen: (open: boolean) => void;
	votingLocks: IVotingLocks;
	lockedBalance: BN;
	totalUnlockableBalance: BN;
	onUnlock: () => void;
	loading: boolean;
}

function VoteUnlockModal({ open, setOpen, votingLocks, lockedBalance, totalUnlockableBalance, onUnlock, loading }: VoteUnlockModalProps) {
	const t = useTranslations();
	return (
		<Dialog
			open={open}
			onOpenChange={setOpen}
		>
			<DialogContent className={classes.dialogContent}>
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
					<VotesList
						votingLocks={votingLocks.unlockableVotes}
						balance={totalUnlockableBalance}
						balanceLabel={t('Profile.Unlockable')}
						icon={
							<CheckCircle
								fill='#51D36E'
								className='h-5 w-5 text-info_bg'
							/>
						}
					/>

					<VotesList
						votingLocks={votingLocks.lockedVotes.concat(votingLocks.ongoingVotes)}
						balance={lockedBalance}
						balanceLabel={t('Profile.LockedBalance')}
						icon={<LockKeyhole className='h-5 w-5 text-gold_balance' />}
					/>
				</div>
				<Separator className='my-0' />
				<div className={classes.modalFooter}>
					<Button
						variant='default'
						onClick={onUnlock}
						isLoading={loading}
						disabled={totalUnlockableBalance.isZero()}
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
