// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/_shared-components/Dialog/Dialog';
import Image from 'next/image';
import TreasureChestOpenIcon from '@assets/icons/treasure-chest-open.svg';
import { useTranslations } from 'next-intl';
import { useVoteUnlock } from '@/hooks/useVoteUnlock';
import classes from './UnlockSuccessModal.module.scss';
import VoteDetailCard from '../VoteDetailCard/VoteDetailCard';

interface UnlockSuccessModalProps {
	open: boolean;
	setOpen: (open: boolean) => void;
	address: string;
}

function UnlockSuccessModal({ open, setOpen, address }: UnlockSuccessModalProps) {
	const t = useTranslations();

	const { nextUnlockData } = useVoteUnlock(address);

	return (
		<Dialog
			open={open}
			onOpenChange={setOpen}
		>
			<DialogContent className={classes.dialogContent}>
				<DialogHeader className='border-0 p-4'>
					<DialogTitle className={classes.dialogTitle}>
						<Image
							src={TreasureChestOpenIcon}
							alt='Vote Unlock'
							width={100}
							height={100}
						/>
					</DialogTitle>
				</DialogHeader>

				<div className={classes.dialogContent}>
					<h2 className={classes.title}>{t('Profile.unlockSuccess')}</h2>
					{nextUnlockData && (
						<div className={classes.card}>
							<VoteDetailCard
								vote={nextUnlockData}
								isNextUnlock
							/>
						</div>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}

export default UnlockSuccessModal;
