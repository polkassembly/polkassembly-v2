// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { EVoteDecision } from '@/_shared/types';
import { AiFillLike } from '@react-icons/all-files/ai/AiFillLike';
import { AiFillDislike } from '@react-icons/all-files/ai/AiFillDislike';
import SplitImg from '@assets/icons/split-yellow-icon.svg';
import SplitAbstainImg from '@assets/icons/abstainGray.svg';
import { memo } from 'react';

interface VoteDetailsButtonProps {
	userVoteType: EVoteDecision | null;
	onClick?: () => void;
}

function VoteDetailsButton({ userVoteType, onClick }: VoteDetailsButtonProps) {
	const t = useTranslations();
	if (!userVoteType) return null;

	const votedText = t('PostDetails.voted');

	const voteTypeDisplay = () => {
		switch (userVoteType) {
			case EVoteDecision.AYE:
				return (
					<div className='flex items-center gap-x-1'>
						<AiFillLike className='text-base text-success' />
						<span className='font-medium text-success'>
							{votedText} {t('PostDetails.aye')}
						</span>
					</div>
				);
			case EVoteDecision.NAY:
				return (
					<div className='flex items-center gap-x-1'>
						<AiFillDislike className='text-base text-failure' />
						<span className='font-medium text-failure'>
							{votedText} {t('PostDetails.nay')}
						</span>
					</div>
				);
			case EVoteDecision.SPLIT:
				return (
					<div className='flex items-center gap-x-1'>
						<Image
							src={SplitImg}
							alt='split'
							width={16}
							height={16}
						/>
						<span className='font-medium text-toast_warning_text'>
							{votedText} {t('PostDetails.split')}
						</span>
					</div>
				);
			case EVoteDecision.SPLIT_ABSTAIN:
				return (
					<div className='flex items-center gap-x-1'>
						<Image
							src={SplitAbstainImg}
							alt='split abstain'
							width={16}
							height={16}
						/>
						<span className='font-medium text-toast_warning_text'>
							{votedText} {t('PostDetails.abstain')}
						</span>
					</div>
				);
			default:
				return (
					<span className='font-medium text-text_primary'>
						{votedText} {userVoteType}
					</span>
				);
		}
	};

	return (
		<button
			type='button'
			onClick={onClick}
			className='flex items-center gap-x-1 text-xs'
		>
			{voteTypeDisplay()}
		</button>
	);
}

export default memo(VoteDetailsButton);
