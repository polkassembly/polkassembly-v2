// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { BN_MAX_INTEGER } from '@polkadot/util';
import { useState, useEffect } from 'react';
import { formatBnBalance } from '@/app/_client-utils/formatBnBalance';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { getDateFromBlock } from '@/_shared/_utils/blockToTime';
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

function LockVoteDetailCard({ vote, isNextUnlock }: LockVoteDetailCardProps) {
	const t = useTranslations();
	const network = getCurrentNetwork();
	const [lockedDate, setLockedDate] = useState<string | null>(null);

	// Get locked date if available
	useEffect(() => {
		const fetchLockedDate = async () => {
			if (!vote.lockedAtBlock) return;
			try {
				const date = await getDateFromBlock(vote.lockedAtBlock, network);
				setLockedDate(date);
			} catch (error) {
				console.error('Error getting locked date:', error);
			}
		};

		fetchLockedDate();
	}, [vote.lockedAtBlock, network]);

	// Get display text - unique to this component
	const getDisplayText = () => {
		if (vote.endBlock.eq(BN_MAX_INTEGER)) {
			return `${t('Profile.ProposalOngoing')}: #${vote.refId}`;
		}

		if (isNextUnlock) {
			return `${t('Profile.NextUnlock')}: #${vote.refId}`;
		}

		return `${t('Profile.LockedVote')}: #${vote.refId}`;
	};

	return (
		<div className={classes.container}>
			<div className='flex items-start gap-1'>
				{isNextUnlock && <UnlockKeyhole className='h-4 w-4 text-border_blue' />}
				<div className={classes.voteInfo}>
					<span className='flex items-center gap-1'>
						{!isNextUnlock && (
							<Image
								src={ProposalUnlockIcon}
								alt='proposal-unlock'
								width={20}
								height={20}
							/>
						)}
						{getDisplayText()}
					</span>
					<Link
						href={`/referenda/${vote.refId}`}
						className={classes.lockedDate}
						target='_blank'
					>
						{lockedDate ? `${t('Profile.LockedOn')} ${lockedDate}` : `Referendum #${vote.refId}`}
						<SquareArrowOutUpRight className='h-3 w-3 text-border_blue' />
					</Link>
				</div>
			</div>
			<div className={classes.voteBalance}>{formatBnBalance(vote.balance.toString(), { numberAfterComma: 2, withUnit: true }, network)}</div>
		</div>
	);
}

export default LockVoteDetailCard;
