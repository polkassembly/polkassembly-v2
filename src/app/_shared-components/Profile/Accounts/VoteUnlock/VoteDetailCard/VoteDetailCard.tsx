// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { BN } from '@polkadot/util';
import { useState, useEffect } from 'react';
import { formatBnBalance } from '@/app/_client-utils/formatBnBalance';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { BlockCalculationsService } from '@/app/_client-services/block_calculations_service';
import { getFormattedDateFromBlock } from '@/_shared/_utils/blockToDateUtils';
import { usePolkadotApiService } from '@/hooks/usePolkadotApiService';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { SquareArrowOutUpRight } from 'lucide-react';
import { IVoteLock } from '@/_shared/types';
import classes from './VoteDetailCard.module.scss';

interface VoteDetailCardProps {
	vote: IVoteLock;
}

interface VoteLockWithDate {
	refId: string;
	track: string;
	balance: BN;
	conviction: number;
	endBlock: BN;
	status: string;
	blocksRemaining?: BN;
	lockedAtBlock?: BN;
	lockedAtDate?: string;
}

function VoteDetailCard({ vote }: VoteDetailCardProps) {
	const t = useTranslations();
	const network = getCurrentNetwork();
	const { apiService } = usePolkadotApiService();
	const [voteWithDate, setVoteWithDate] = useState<VoteLockWithDate>(vote);

	const getTimeRemainingForBlocks = (blocks: BN) => {
		// Use theoretical calculation for now (we could make this async to use improved calculation)
		const { totalSeconds } = BlockCalculationsService.getTimeForBlocks({ network, blocks });
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
		return 'Less than 1 minute';
	};

	// Fetch formatted dates for votes that have lockedAtBlock
	useEffect(() => {
		const fetchDatesForVote = async () => {
			if (!apiService) return;

			const processVote = async (vote: VoteLockWithDate) => {
				let lockedAtDate;
				if (vote.lockedAtBlock) {
					try {
						lockedAtDate = await getFormattedDateFromBlock({
							targetBlockNumber: vote.lockedAtBlock,
							network,
							apiService
						});
					} catch (error) {
						console.error('Error getting locked at date:', error);
					}
				}
				return { ...vote, lockedAtDate };
			};

			const voteWithDate = await processVote(vote);

			setVoteWithDate(voteWithDate);
		};

		fetchDatesForVote();
	}, [vote, apiService, network]);

	return (
		<div className={classes.container}>
			<div className={classes.voteInfo}>
				{voteWithDate.blocksRemaining && (
					<span className={classes.timeRemaining}>
						{t('Profile.ProposalUnlockIn')}: {getTimeRemainingForBlocks(voteWithDate.blocksRemaining)}
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
			<div className={classes.voteBalance}>{formatBnBalance(voteWithDate.balance.toString(), { numberAfterComma: 2, withUnit: true }, network)}</div>
		</div>
	);
}

export default VoteDetailCard;
