// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { BN } from '@polkadot/util';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/_shared-components/Dialog/Dialog';
import Image from 'next/image';
import TreasureChestOpenIcon from '@assets/icons/treasure-chest-open.svg';
import { useTranslations } from 'next-intl';
import { useVoteUnlock } from '@/hooks/useVoteUnlock';
import { formatBnBalance } from '@/app/_client-utils/formatBnBalance';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import classes from './UnlockSuccessModal.module.scss';
import LockVoteDetailCard from '../LockVoteDetailCard/LockVoteDetailCard';

interface UnlockSuccessModalProps {
	open: boolean;
	setOpen: (open: boolean) => void;
	address: string;
	unlockedAmount: BN;
}

function UnlockSuccessModal({ open, setOpen, address, unlockedAmount }: UnlockSuccessModalProps) {
	const t = useTranslations();
	const network = getCurrentNetwork();
	const { nextUnlockData } = useVoteUnlock(address);

	const formattedUnlockedAmount = formatBnBalance(unlockedAmount.toString(), { numberAfterComma: 2, withUnit: true }, network);

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
							alt='Unlock Success'
							width={100}
							height={100}
						/>
					</DialogTitle>
				</DialogHeader>

				<div className={classes.dialogContent}>
					<h2 className={classes.title}>{t('Profile.unlockSuccess')}</h2>
					<span className={classes.amountValue}>{formattedUnlockedAmount}</span>
					{nextUnlockData && (
						<div className={classes.card}>
							<LockVoteDetailCard
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
