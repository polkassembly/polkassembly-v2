// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useUser } from '@/hooks/useUser';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Button } from '../Button';
import { Dialog, DialogContent, DialogHeader, DialogTrigger } from '../Dialog';
import VoteReferendum from './VoteReferendum/VoteReferendum';

function VoteReferendumButton({ index }: { index: string }) {
	const { user } = useUser();
	const t = useTranslations();
	return !user ? (
		<Link href='/login'>
			<Button
				className='w-full'
				size='lg'
			>
				{t('PostDetails.loginToVote')}
			</Button>
		</Link>
	) : (
		<Dialog>
			<DialogTrigger asChild>
				<Button
					className='w-full'
					size='lg'
				>
					{t('PostDetails.castVote')}
				</Button>
			</DialogTrigger>
			<DialogContent className='max-w-xl'>
				<DialogHeader className='text-xl font-semibold text-text_primary'>{t('PostDetails.castYourVote')}</DialogHeader>
				<VoteReferendum index={index} />
			</DialogContent>
		</Dialog>
	);
}

export default VoteReferendumButton;
