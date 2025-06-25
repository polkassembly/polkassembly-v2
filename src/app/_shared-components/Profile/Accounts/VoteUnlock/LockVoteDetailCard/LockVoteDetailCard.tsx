// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { BN } from '@polkadot/util';
import { useState, useEffect } from 'react';
import { formatBnBalance } from '@/app/_client-utils/formatBnBalance';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { getFormattedDateFromBlock } from '@/_shared/_utils/blockToDateUtils';
import { usePolkadotApiService } from '@/hooks/usePolkadotApiService';
import { getMemoizedTimeFromBlocks } from '@/app/_client-utils/voteUnlockUtils';
import Link from 'next/link';
import Image from 'next/image';
import ProposalUnlockIcon from '@assets/icons/create-proposal.svg';
import { useTranslations } from 'next-intl';
import { SquareArrowOutUpRight, UnlockKeyhole } from 'lucide-react';
import { IVoteLock } from '@/_shared/types';
import classes from './LockVoteDetailCard.module.scss';

interface LockVoteDetailCardProps {
	vote: IVoteLock;
	isNextUnlock?: boolean;
}

interface VoteLockWithDate extends IVoteLock {
	lockedAtDate?: string;
}

function LockVoteDetailCard({ vote, isNextUnlock }: LockVoteDetailCardProps) {
	const t = useTranslations();
	const network = getCurrentNetwork();
	const { apiService } = usePolkadotApiService();
	const [voteWithDate, setVoteWithDate] = useState<VoteLockWithDate>(vote);

	// Use memoized time calculation for better performance
	const getTimeRemainingForBlocks = (blocks: BN) => {
		return getMemoizedTimeFromBlocks(blocks, network, t).formatted;
	};

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
			<div className='flex items-start gap-1'>
				{isNextUnlock && <UnlockKeyhole className='h-4 w-4 text-border_blue' />}
				<div className={classes.voteInfo}>
					{voteWithDate.blocksRemaining && (
						<span className='flex items-center gap-1'>
							{!isNextUnlock && (
								<Image
									src={ProposalUnlockIcon}
									alt='proposal-unlock'
									width={20}
									height={20}
								/>
							)}
							{isNextUnlock ? t('Profile.NextUnlockIn') : t('Profile.ProposalUnlockIn')}: {getTimeRemainingForBlocks(voteWithDate.blocksRemaining)}
						</span>
					)}
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
			</div>
			<div className={classes.voteBalance}>{formatBnBalance(voteWithDate.balance.toString(), { numberAfterComma: 2, withUnit: true }, network)}</div>
		</div>
	);
}

export default LockVoteDetailCard;
