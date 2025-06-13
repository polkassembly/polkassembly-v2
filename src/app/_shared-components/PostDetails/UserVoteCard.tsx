// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useTranslations } from 'next-intl';
import VoteIcon from '@assets/activityfeed/vote.svg';
import { ThumbsDown, ThumbsUp, Ban } from 'lucide-react';
import DelegateIcon from '@assets/icons/delegate_plus.svg';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { EPostOrigin, EProposalType, IVoteHistoryData } from '@/_shared/types';
import { useState } from 'react';
import { formatBnBalance } from '@/app/_client-utils/formatBnBalance';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import classes from './PostDetails.module.scss';
import { Button } from '../Button';
import { Dialog, DialogContent, DialogHeader, DialogTrigger } from '../Dialog/Dialog';
import VoteReferendum from './VoteReferendum/VoteReferendum';
import { Separator } from '../Separator';

interface VoteReferendumButtonProps {
	index: string;
	btnClassName?: string;
	iconClassName?: string;
	size?: 'sm' | 'lg';
	track?: EPostOrigin;
	proposalType: EProposalType;
	voteData: IVoteHistoryData;
	isLoading: boolean;
	isError: boolean;
}

function VoteReferendumButton({ index, btnClassName, iconClassName, size = 'lg', track, proposalType, voteData, isLoading, isError }: VoteReferendumButtonProps) {
	const t = useTranslations();
	const [openModal, setOpenModal] = useState(false);
	const network = getCurrentNetwork();

	const myVote = voteData.votes[0];

	const formatBalanceOptions = {
		withUnit: true,
		numberAfterComma: 2,
		compactNotation: true
	};

	const handleRemoveVote = () => {
		console.log('remove vote');
	};

	return (
		<div className={classes.userVoteCard}>
			<div className={classes.userVoteCardLayout}>
				<h2 className={classes.userVoteCardTitle}>{t('PostDetails.myVote')}</h2>
				<button
					type='button'
					className={classes.userVoteCardRemoveButton}
					onClick={handleRemoveVote}
				>
					{t('PostDetails.remove')}
				</button>
			</div>
			<div className={classes.userVoteCardLayout}>
				<h3 className={classes.userVoteCardTitleIcon}>
					{myVote.decision === 'abstain' && <Ban className='h-4 w-4 text-basic_text' />}
					{myVote.decision === 'aye' && <ThumbsUp className='h-4 w-4 text-basic_text' />}
					{myVote.decision === 'nay' && <ThumbsDown className='h-4 w-4 text-basic_text' />}
					{t(`PostDetails.${myVote.decision}`)}
				</h3>

				<p className='text-sm text-basic_text'>
					{formatBnBalance(myVote.selfVotingPower || '0', formatBalanceOptions, network)} ({!myVote.lockPeriod || myVote.lockPeriod === 0 ? 0.1 : myVote.lockPeriod}x)
				</p>
			</div>
			<Separator
				orientation='horizontal'
				className='w-full'
			/>
			<div className={classes.userVoteCardLayout}>
				<h3 className={classes.userVoteCardTitleIcon}>
					<Image
						src={DelegateIcon}
						alt='Delegate Icon'
						width={20}
						height={20}
						className='darkIcon mb-0.5'
					/>
					{t('PostDetails.delegations')}
				</h3>
				<p className='text-sm text-basic_text'>{formatBnBalance(myVote.delegatedVotingPower || '0', formatBalanceOptions, network)}</p>
			</div>

			<Dialog
				open={openModal}
				onOpenChange={setOpenModal}
			>
				<DialogTrigger asChild>
					<Button
						className={cn('w-full', btnClassName)}
						size={size}
						disabled={isLoading || isError}
						isLoading={isLoading}
					>
						<div className='flex items-center gap-1'>
							<Image
								src={VoteIcon}
								alt='Vote Icon'
								width={20}
								height={20}
								className={iconClassName}
							/>
							{t('PostDetails.changeVote')}
						</div>
					</Button>
				</DialogTrigger>
				<DialogContent className='max-w-xl p-3 sm:p-6'>
					<DialogHeader className='text-xl font-semibold text-text_primary'>{t('PostDetails.castYourVote')}</DialogHeader>
					<VoteReferendum
						index={index}
						track={track}
						onClose={() => setOpenModal(false)}
						proposalType={proposalType}
					/>
				</DialogContent>
			</Dialog>
		</div>
	);
}

export default VoteReferendumButton;
