// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import { ThumbsDown, ThumbsUp, Ban, User, ChevronDown, Trash } from 'lucide-react';
import DelegateIcon from '@assets/icons/delegate_plus.svg';
import { cn } from '@/lib/utils';
import { EProposalType, IVoteHistoryData, ENotificationStatus, EReactQueryKeys, EPostOrigin, IVoteData, EVoteDecision } from '@/_shared/types';
import { formatBnBalance } from '@/app/_client-utils/formatBnBalance';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { usePolkadotApiService } from '@/hooks/usePolkadotApiService';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { usePolkadotVault } from '@/hooks/usePolkadotVault';

import { useToast } from '@/hooks/useToast';
import { useUser } from '@/hooks/useUser';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/app/_shared-components/Collapsible';
import { getSubstrateAddress } from '@/_shared/_utils/getSubstrateAddress';
import { Button } from '../../../Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../Dialog/Dialog';
import { Separator } from '../../../Separator';
import classes from './UserVoteCard.module.scss';
import Address from '../../../Profile/Address/Address';
import VoteReferendumButton from '../../VoteReferendumButton';

interface UserVoteCardProps {
	index: string;
	btnClassName?: string;
	size?: 'sm' | 'lg';
	proposalType: EProposalType;
	voteData: IVoteHistoryData;
	track?: EPostOrigin;
}

function VoteDetails({ voteData, showAddress = true }: { voteData: IVoteData; showAddress?: boolean }) {
	const t = useTranslations();
	const network = getCurrentNetwork();

	const formatBalanceOptions = {
		withUnit: true,
		numberAfterComma: 2,
		compactNotation: true
	};
	return (
		<div className='flex flex-col gap-y-2'>
			{showAddress && (
				<div className={classes.userVoteCardLayout}>
					<h3 className={classes.userVoteCardTitleIcon}>
						<User className='h-4 w-4 text-basic_text' />
						{t('PostDetails.address')}
					</h3>

					<p className='text-sm text-basic_text'>
						<Address
							address={voteData.voterAddress}
							iconSize={18}
						/>
					</p>
				</div>
			)}
			<Separator
				orientation='horizontal'
				className='w-full'
			/>
			<div className={classes.userVoteCardLayout}>
				<h3 className={classes.userVoteCardTitleIcon}>
					{voteData.decision === EVoteDecision.ABSTAIN && <Ban className='h-4 w-4 text-basic_text' />}
					{voteData.decision === EVoteDecision.AYE && <ThumbsUp className='h-4 w-4 text-basic_text' />}
					{voteData.decision === EVoteDecision.NAY && <ThumbsDown className='h-4 w-4 text-basic_text' />}
					{t(`PostDetails.${voteData.decision}`)}
				</h3>

				<p className='text-sm text-basic_text'>
					{formatBnBalance(voteData.selfVotingPower || '0', formatBalanceOptions, network)} ({!voteData.lockPeriod || voteData.lockPeriod === 0 ? 0.1 : voteData.lockPeriod}x)
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
				<p className='text-sm text-basic_text'>{formatBnBalance(voteData.delegatedVotingPower || '0', formatBalanceOptions, network)}</p>
			</div>
		</div>
	);
}

function UserVoteCard({ index, btnClassName, size = 'lg', proposalType, voteData, track }: UserVoteCardProps) {
	const t = useTranslations();
	const [openRemoveConfirmModal, setOpenRemoveConfirmModal] = useState(false);
	const { apiService } = usePolkadotApiService();
	const { userPreferences } = useUserPreferences();
	const { setVaultQrState } = usePolkadotVault();

	const { user } = useUser();

	const { toast } = useToast();
	const queryClient = useQueryClient();
	const [isLoading, setIsLoading] = useState(false);

	const { votes } = voteData;

	const [selectedAddress, setSelectedAddress] = useState<string>(votes[0].voterAddress);

	const handleRemoveVote = async () => {
		if (!apiService || !selectedAddress || !userPreferences.wallet || !user?.id) return;

		try {
			setIsLoading(true);
			await apiService.removeReferendumVote({
				address: selectedAddress,
				referendumId: Number(index),
				wallet: userPreferences.wallet,
				setVaultQrState,
				selectedAccount: userPreferences.selectedAccount,
				onSuccess: () => {
					toast({
						title: t('PostDetails.voteRemovedTitle'),
						description: t('PostDetails.voteRemoved'),
						status: ENotificationStatus.SUCCESS
					});
					queryClient.setQueryData([EReactQueryKeys.USER_VOTES, proposalType, index, user.id], (oldData: IVoteHistoryData) => {
						const existingVotes = [...(oldData?.votes || [])];
						const filteredVotes = existingVotes.filter((vote) => getSubstrateAddress(vote.voterAddress) !== getSubstrateAddress(selectedAddress));
						return { votes: filteredVotes };
					});

					setOpenRemoveConfirmModal(false);
					setIsLoading(false);
				},
				onFailed: (errorMessage) => {
					toast({
						title: t('PostDetails.voteRemoveFailedTitle'),
						description: errorMessage || t('PostDetails.voteRemoveFailed'),
						status: ENotificationStatus.ERROR
					});
					setIsLoading(false);
				}
			});
		} catch (error) {
			console.error('Error removing vote:', error);
			toast({
				title: t('PostDetails.voteRemoveFailedTitle'),
				description: t('PostDetails.voteRemoveFailed'),
				status: ENotificationStatus.ERROR
			});
			setIsLoading(false);
		}
	};

	return (
		<div className={classes.userVoteCard}>
			<div className={`${classes.userVoteCardLayout}`}>
				<h2 className={classes.userVoteCardTitle}>{t('PostDetails.myVote')}</h2>
				{votes.length === 1 && (
					<Button
						type='button'
						variant='ghost'
						className={classes.userVoteCardRemoveButton}
						onClick={() => {
							setSelectedAddress(votes[0].voterAddress);
							setOpenRemoveConfirmModal(true);
						}}
						disabled={isLoading}
					>
						{t('PostDetails.removeVote')}
					</Button>
				)}
			</div>

			<div className='flex flex-col gap-y-2'>
				{votes.length === 1 ? (
					<VoteDetails voteData={votes[0]} />
				) : (
					votes.map((vote, i) => (
						<Collapsible
							key={vote.voterAddress}
							defaultOpen={i === 0}
						>
							<CollapsibleTrigger
								asChild
								className='rounded-md bg-page_background p-2'
							>
								<div className='flex cursor-pointer items-center gap-x-2'>
									<Address
										address={vote.voterAddress}
										className='flex-1'
									/>
									<Button
										type='button'
										variant='ghost'
										size='icon'
										className='text-text_pink'
										onClick={() => {
											setSelectedAddress(vote.voterAddress);
											setOpenRemoveConfirmModal(true);
										}}
										disabled={isLoading}
									>
										<Trash className='h-4 w-4' />
									</Button>
									<ChevronDown className='h-4 w-4' />
								</div>
							</CollapsibleTrigger>
							<CollapsibleContent>
								<VoteDetails
									voteData={vote}
									showAddress={false}
								/>
							</CollapsibleContent>
						</Collapsible>
					))
				)}
			</div>

			<VoteReferendumButton
				index={index}
				btnClassName={cn('w-full', btnClassName)}
				size={size}
				iconClassName='hidden'
				hasVoted
				track={track}
				proposalType={proposalType}
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
								disabled={isLoading}
							>
								{t('PostDetails.cancel')}
							</Button>
							<Button
								onClick={handleRemoveVote}
								isLoading={isLoading}
								disabled={isLoading}
							>
								{t('PostDetails.remove')}
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}

export default UserVoteCard;
