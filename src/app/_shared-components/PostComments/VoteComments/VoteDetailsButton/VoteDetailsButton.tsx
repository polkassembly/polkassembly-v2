// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { memo } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { EVoteDecision } from '@/_shared/types';
import { AiFillLike } from '@react-icons/all-files/ai/AiFillLike';
import { AiFillDislike } from '@react-icons/all-files/ai/AiFillDislike';
import SplitImg from '@assets/icons/split-yellow-icon.svg';
import SplitAbstainImg from '@assets/icons/abstainGray.svg';
import { Button } from '@/app/_shared-components/Button';

interface VoteDetailsButtonProps {
	userVoteType: EVoteDecision | null;
	onClick?: () => void;
}

function VoteDetailsButton({ userVoteType, onClick }: VoteDetailsButtonProps) {
	const t = useTranslations();
	const votedText = t('PostDetails.voted');

	if (!userVoteType) return null;

	return (
		<Button
			variant='ghost'
			onClick={onClick}
			className='m-0 flex items-center gap-x-1 p-0 text-xs'
		>
			{userVoteType === EVoteDecision.AYE && (
				<div className='flex items-center gap-x-1'>
					<AiFillLike className='text-base text-success' />
					<span className='font-medium text-success hover:underline'>
						{votedText} {t('PostDetails.aye')}
					</span>
				</div>
			)}
			{userVoteType === EVoteDecision.NAY && (
				<div className='flex items-center gap-x-1'>
					<AiFillDislike className='text-base text-failure' />
					<span className='font-medium text-failure hover:underline'>
						{votedText} {t('PostDetails.nay')}
					</span>
				</div>
			)}
			{userVoteType === EVoteDecision.SPLIT && (
				<div className='flex items-center gap-x-1'>
					<Image
						src={SplitImg}
						alt='split'
						width={16}
						height={16}
					/>
					<span className='font-medium text-toast_warning_text hover:underline'>
						{votedText} {t('PostDetails.split')}
					</span>
				</div>
			)}
			{userVoteType === EVoteDecision.SPLIT_ABSTAIN && (
				<div className='flex items-center gap-x-1'>
					<Image
						src={SplitAbstainImg}
						alt='split abstain'
						width={16}
						height={16}
					/>
					<span className='font-medium text-toast_warning_text hover:underline'>
						{votedText} {t('PostDetails.abstain')}
					</span>
				</div>
			)}
			{![EVoteDecision.AYE, EVoteDecision.NAY, EVoteDecision.SPLIT, EVoteDecision.SPLIT_ABSTAIN].includes(userVoteType) && (
				<span className='font-medium text-text_primary hover:underline'>
					{votedText} {userVoteType}
				</span>
			)}
		</Button>
	);
}

export default memo(VoteDetailsButton);
