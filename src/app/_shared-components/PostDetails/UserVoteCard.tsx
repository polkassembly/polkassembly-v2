// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import { ThumbsDown, ThumbsUp, Ban, User } from 'lucide-react';
import DelegateIcon from '@assets/icons/delegate_plus.svg';
import { cn } from '@/lib/utils';
import { EProposalType, IVoteHistoryData, ENotificationStatus, EReactQueryKeys, EPostOrigin, IVoteData, EVoteDecision } from '@/_shared/types';
import { formatBnBalance } from '@/app/_client-utils/formatBnBalance';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { usePolkadotApiService } from '@/hooks/usePolkadotApiService';
import { useUserPreferences } from '@/hooks/useUserPreferences';

import { useToast } from '@/hooks/useToast';
import { Button } from '../Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../Dialog/Dialog';
import { Separator } from '../Separator';
import classes from './PostDetails.module.scss';
import Address from '../Profile/Address/Address';
import VoteReferendumButton from './VoteReferendumButton';

interface UserVoteCardProps {
	index: string;
	btnClassName?: string;
	size?: 'sm' | 'lg';
	proposalType: EProposalType;
	voteData: IVoteHistoryData;
	track?: EPostOrigin;
	existingVote?: IVoteData;
	loginAddress?: string;
}

function UserVoteCard({ index, btnClassName, size = 'lg', proposalType, voteData, track, existingVote, loginAddress }: UserVoteCardProps) {
	const t = useTranslations();
	const [openRemoveConfirmModal, setOpenRemoveConfirmModal] = useState(false);
	const network = getCurrentNetwork();
	const { apiService } = usePolkadotApiService();
	const { userPreferences } = useUserPreferences();

	const { toast } = useToast();
	const queryClient = useQueryClient();
	const [isRemoving, setIsRemoving] = useState(false);

	const myVote = voteData.votes[0];

	const formatBalanceOptions = {
		withUnit: true,
		numberAfterComma: 2,
		compactNotation: true
	};

	const handleRemoveVote = async () => {
		if (!apiService || !loginAddress) return;

		try {
			setIsRemoving(true);
			await apiService.removeReferendumVote({
				address: loginAddress,
				referendumId: Number(index),
				selectedAccount: userPreferences.selectedAccount,
				onSuccess: () => {
					toast({
						title: t('PostDetails.voteRemovedTitle'),
						description: t('PostDetails.voteRemoved'),
						status: ENotificationStatus.SUCCESS
					});
					queryClient.invalidateQueries({ queryKey: [EReactQueryKeys.USER_VOTES, proposalType, index, loginAddress] });
					setOpenRemoveConfirmModal(false);
				},
				onFailed: (errorMessage) => {
					toast({
						title: t('PostDetails.voteRemoveFailedTitle'),
						description: errorMessage || t('PostDetails.voteRemoveFailed'),
						status: ENotificationStatus.ERROR
					});
				}
			});
		} catch (error) {
			console.error('Error removing vote:', error);
			toast({
				title: t('PostDetails.voteRemoveFailedTitle'),
				description: t('PostDetails.voteRemoveFailed'),
				status: ENotificationStatus.ERROR
			});
		} finally {
			setIsRemoving(false);
		}
	};

	return (
		<div className={classes.userVoteCard}>
			<div className={`${classes.userVoteCardLayout} mb-2`}>
				<h2 className={classes.userVoteCardTitle}>{t('PostDetails.myVote')}</h2>
				<Button
					type='button'
					variant='ghost'
					className={classes.userVoteCardRemoveButton}
					onClick={() => setOpenRemoveConfirmModal(true)}
					disabled={isRemoving}
					isLoading={isRemoving}
				>
					{isRemoving ? t('PostDetails.removing') : t('PostDetails.removeVote')}
				</Button>
			</div>
			<div className={classes.userVoteCardLayout}>
				<h3 className={classes.userVoteCardTitleIcon}>
					<User className='h-4 w-4 text-basic_text' />
					{t('PostDetails.address')}
				</h3>

				<p className='text-sm text-basic_text'>
					<Address
						address={myVote.voterAddress}
						iconSize={18}
					/>
				</p>
			</div>
			<Separator
				orientation='horizontal'
				className='w-full'
			/>
			<div className={classes.userVoteCardLayout}>
				<h3 className={classes.userVoteCardTitleIcon}>
					{myVote.decision === EVoteDecision.ABSTAIN && <Ban className='h-4 w-4 text-basic_text' />}
					{myVote.decision === EVoteDecision.AYE && <ThumbsUp className='h-4 w-4 text-basic_text' />}
					{myVote.decision === EVoteDecision.NAY && <ThumbsDown className='h-4 w-4 text-basic_text' />}
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

			<VoteReferendumButton
				index={index}
				btnClassName={cn('w-full', btnClassName)}
				size={size}
				iconClassName='hidden'
				hasVoted
				track={track}
				proposalType={proposalType}
				existingVote={existingVote}
			/>

			<Dialog
				open={openRemoveConfirmModal}
				onOpenChange={setOpenRemoveConfirmModal}
			>
				<DialogContent className='max-w-md p-3 sm:p-6'>
					<DialogHeader>
						<DialogTitle className='text-xl font-semibold text-text_primary'>{t('PostDetails.removeVote')}</DialogTitle>
					</DialogHeader>
					<div className='mt-4'>
						<p className='text-base text-basic_text'>{t('PostDetails.removeVoteConfirmation')}</p>
						<div className='mt-6 flex justify-end gap-3'>
							<Button
								variant='outline'
								onClick={() => setOpenRemoveConfirmModal(false)}
								disabled={isRemoving}
							>
								{t('PostDetails.cancel')}
							</Button>
							<Button
								onClick={handleRemoveVote}
								isLoading={isRemoving}
								disabled={isRemoving}
							>
								{isRemoving ? t('PostDetails.removing') : t('PostDetails.remove')}
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}

export default UserVoteCard;
