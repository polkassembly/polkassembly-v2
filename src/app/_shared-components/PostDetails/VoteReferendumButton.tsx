// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useUser } from '@/hooks/useUser';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import VoteIcon from '@assets/activityfeed/vote.svg';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { EPostOrigin, EProposalType } from '@/_shared/types';
import { useState } from 'react';
import { Button } from '../Button';
import { Dialog, DialogContent, DialogHeader, DialogTrigger } from '../Dialog/Dialog';
import VoteReferendum from './VoteReferendum/VoteReferendum';

interface VoteReferendumButtonProps {
	index: string;
	btnClassName?: string;
	iconClassName?: string;
	size?: 'sm' | 'lg';
	track?: EPostOrigin;
	proposalType: EProposalType;
}

function VoteReferendumButton({ index, btnClassName, iconClassName, size = 'lg', track, proposalType }: VoteReferendumButtonProps) {
	const { user } = useUser();
	const t = useTranslations();
	const [openModal, setOpenModal] = useState(false);

	const {
		data: voteData,
		isLoading,
		isError
	} = useQuery({
		queryKey: ['userVotes', proposalType, index, user?.addresses[0]],
		queryFn: async () => {
			if (!user) return null;
			const { data, error } = await NextApiClientService.getPostVotesByAddress({
				proposalType,
				index,
				address: user?.addresses[0]
			});
			if (error) throw new Error(error.message || 'Failed to fetch vote data');
			if (!data) return null;
			return data;
		},
		enabled: !!user?.id,
		retry: 1,
		staleTime: 30000
	});

	const hasVoted = Array.isArray(voteData?.votes) && voteData.votes.length > 0;

	return !user ? (
		<Link href='/login'>
			<Button
				className={cn('w-full', btnClassName)}
				size={size}
			>
				<div className='flex items-center gap-1.5'>
					<Image
						src={VoteIcon}
						alt='Vote Icon'
						width={20}
						height={20}
						className={iconClassName}
					/>
					<span>{t('PostDetails.loginToVote')}</span>
				</div>
			</Button>
		</Link>
	) : (
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
						{hasVoted ? t('PostDetails.castVoteAgain') : t('PostDetails.castVote')}
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
	);
}

export default VoteReferendumButton;
