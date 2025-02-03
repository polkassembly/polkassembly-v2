// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import VoteIcon from '@assets/activityfeed/vote.svg';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@ui/Dialog/Dialog';
import VoteReferendum from '../../PostDetails/VoteReferendum/VoteReferendum';
import styles from './ActivityFeedPostItem.module.scss';

interface VoteButtonProps {
	postIndex: string;
	isLoggedIn: boolean;
}

export default function VoteButton({ postIndex, isLoggedIn }: VoteButtonProps) {
	const t = useTranslations();

	if (isLoggedIn) {
		return (
			<Dialog>
				<DialogTrigger asChild>
					<span className={`${styles.castVoteButton} cursor-pointer`}>
						<Image
							src={VoteIcon}
							alt=''
							width={20}
							height={20}
						/>
						<span>{t('PostDetails.castVote')}</span>
					</span>
				</DialogTrigger>
				<DialogContent className='max-w-xl p-6'>
					<DialogHeader>
						<DialogTitle className='text-xl font-semibold text-text_primary'>{t('PostDetails.castYourVote')}</DialogTitle>
					</DialogHeader>
					<VoteReferendum index={postIndex} />
				</DialogContent>
			</Dialog>
		);
	}

	return (
		<Link href='/login'>
			<span className={`${styles.castVoteButton} cursor-pointer`}>
				<Image
					src={VoteIcon}
					alt=''
					width={20}
					height={20}
				/>
				<span>{t('PostDetails.loginToVote')}</span>
			</span>
		</Link>
	);
}
