// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useState, useEffect } from 'react';
import { formatBnBalance } from '@/app/_client-utils/formatBnBalance';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { BlockCalculationsService } from '@/app/_client-services/block_calculations_service';
import { usePolkadotApiService } from '@/hooks/usePolkadotApiService';
import { Checkbox } from '@/app/_shared-components/Checkbox';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { SquareArrowOutUpRight } from 'lucide-react';
import { IVoteLock } from '@/_shared/types';
import Image from 'next/image';
import ProposalUnlockIcon from '@assets/icons/create-proposal.svg';
import classes from './UnlockVoteDetailCard.module.scss';

interface UnlockVoteDetailCardProps {
	vote: IVoteLock;
	isSelected?: boolean;
	onSelectionChange?: (vote: IVoteLock, selected: boolean) => void;
}

function UnlockVoteDetailCard({ vote, isSelected = true, onSelectionChange }: UnlockVoteDetailCardProps) {
	const t = useTranslations();
	const network = getCurrentNetwork();
	const { apiService } = usePolkadotApiService();
	const [lockedDate, setLockedDate] = useState<string | null>(null);

	// Get locked date if available
	useEffect(() => {
		const fetchLockedDate = async () => {
			if (!vote.lockedAtBlock || !apiService) return;
			try {
				const currentBlock = await apiService.getCurrentBlockHeight();
				if (!currentBlock) return;
				const date = await BlockCalculationsService.getDateFromBlock(vote.lockedAtBlock, network, currentBlock);
				setLockedDate(date);
			} catch (error) {
				console.error('Error getting locked date:', error);
			}
		};

		fetchLockedDate();
	}, [vote.lockedAtBlock, network, apiService]);

	const handleCheckboxChange = (checked: boolean) => {
		if (onSelectionChange) {
			onSelectionChange(vote, checked);
		}
	};

	return (
		<div className={classes.container}>
			<div className={classes.voteInfo}>
				<span className={classes.voteInfoText}>
					<Image
						src={ProposalUnlockIcon}
						alt='proposal-unlock'
						width={20}
						height={20}
					/>
					{t('Profile.ProposalUnlock')}
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
			<div className='flex items-center gap-3'>
				<div className={classes.voteBalance}>{formatBnBalance(vote.balance.toString(), { numberAfterComma: 2, withUnit: true }, network)}</div>
				<Checkbox
					className={classes.checkbox}
					checked={isSelected}
					onCheckedChange={handleCheckboxChange}
				/>
			</div>
		</div>
	);
}

export default UnlockVoteDetailCard;
