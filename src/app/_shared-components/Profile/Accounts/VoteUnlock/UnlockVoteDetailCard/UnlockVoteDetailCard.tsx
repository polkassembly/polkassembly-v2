// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useState, useEffect } from 'react';
import { formatBnBalance } from '@/app/_client-utils/formatBnBalance';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { getFormattedDateFromBlock } from '@/_shared/_utils/blockToDateUtils';
import { usePolkadotApiService } from '@/hooks/usePolkadotApiService';
import { Checkbox } from '@/app/_shared-components/Checkbox';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { SquareArrowOutUpRight } from 'lucide-react';
import { IVoteLock } from '@/_shared/types';
import classes from './UnlockVoteDetailCard.module.scss';

interface UnlockVoteDetailCardProps {
	vote: IVoteLock;
}

interface VoteLockWithDate extends IVoteLock {
	lockedAtDate?: string;
}

function UnlockVoteDetailCard({ vote }: UnlockVoteDetailCardProps) {
	const t = useTranslations();
	const network = getCurrentNetwork();
	const { apiService } = usePolkadotApiService();
	const [voteWithDate, setVoteWithDate] = useState<VoteLockWithDate>(vote);

	// Fetch formatted dates for votes that have lockedAtBlock
	useEffect(() => {
		const fetchDatesForVote = async () => {
			if (!apiService || !vote.lockedAtBlock) return;

			try {
				const lockedAtDate = await getFormattedDateFromBlock({
					targetBlockNumber: vote.lockedAtBlock,
					network,
					apiService
				});
				setVoteWithDate((prev) => ({ ...prev, lockedAtDate }));
			} catch (error) {
				console.error('Error getting locked at date:', error);
			}
		};

		fetchDatesForVote();
	}, [vote.lockedAtBlock, apiService, network]);

	// Update vote data when prop changes
	useEffect(() => {
		setVoteWithDate(vote);
	}, [vote]);

	return (
		<div className={classes.container}>
			<div className={classes.voteInfo}>
				{voteWithDate.blocksRemaining && <span className={classes.timeRemaining}>{t('Profile.ProposalUnlock')}</span>}
				{voteWithDate.lockedAtDate && (
					<Link
						href={`/referenda/${voteWithDate.refId}`}
						className={classes.lockedDate}
						target='_blank'
					>
						{t('Profile.LockedOn')} {voteWithDate.lockedAtDate}
						<SquareArrowOutUpRight className='h-3 w-3 text-border_blue' />
					</Link>
				)}
			</div>
			<div className='flex items-center gap-3'>
				<div className={classes.voteBalance}>{formatBnBalance(voteWithDate.balance.toString(), { numberAfterComma: 2, withUnit: true }, network)}</div>
				<Checkbox className={classes.checkbox} />
			</div>
		</div>
	);
}

export default UnlockVoteDetailCard;
