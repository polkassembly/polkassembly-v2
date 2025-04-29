// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useUser } from '@/hooks/useUser';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import VoteIcon from '@assets/activityfeed/vote.svg';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Button } from '../Button';
import { Dialog, DialogContent, DialogHeader, DialogTrigger } from '../Dialog/Dialog';
import VoteReferendum from './VoteReferendum/VoteReferendum';

interface VoteReferendumButtonProps {
	index: string;
	btnClassName?: string;
	iconClassName?: string;
}

function VoteReferendumButton({ index, btnClassName, iconClassName }: VoteReferendumButtonProps) {
	const { user } = useUser();
	const t = useTranslations();
	return !user ? (
		<Link href='/login'>
			<Button
				className={cn('w-full', btnClassName)}
				size='sm'
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
		<Dialog>
			<DialogTrigger asChild>
				<Button
					className={cn('w-full', btnClassName)}
					size='sm'
					variant='secondary'
				>
					<div className='flex items-center gap-1'>
						<Image
							src={VoteIcon}
							alt='Vote Icon'
							width={20}
							height={20}
							className={iconClassName}
						/>
						{t('PostDetails.castVote')}
					</div>
				</Button>
			</DialogTrigger>
			<DialogContent className='max-w-xl p-3 sm:p-6'>
				<DialogHeader className='text-xl font-semibold text-text_primary'>{t('PostDetails.castYourVote')}</DialogHeader>
				<VoteReferendum index={index} />
			</DialogContent>
		</Dialog>
	);
}

export default VoteReferendumButton;
