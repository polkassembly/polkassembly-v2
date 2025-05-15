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
import { Button } from '@/app/_shared-components/Button';

interface VoteDetailsButtonProps {
	userVoteDecision: EVoteDecision | null;
	onClick?: () => void;
}

function VoteDecisionDisplay({ userVoteDecision }: { userVoteDecision: EVoteDecision | null }) {
	const t = useTranslations();
	const votedText = t('PostDetails.voted');

	switch (userVoteDecision) {
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
		case EVoteDecision.ABSTAIN:
			return (
				<div className='flex items-center gap-x-1'>
					<Image
						src={SplitAbstainImg}
						alt='split abstain'
						width={16}
						height={16}
					/>
					<span className='font-medium text-text_primary'>
						{votedText} {t('PostDetails.abstain')}
					</span>
				</div>
			);
		default:
			return (
				<span className='font-medium text-text_primary'>
					{votedText} {userVoteDecision}
				</span>
			);
	}
}

function VoteDetailsButton({ userVoteDecision, onClick }: VoteDetailsButtonProps) {
	if (!userVoteDecision) return null;

	return (
		<Button
			variant='ghost'
			onClick={onClick}
			size='sm'
			className='m-0 flex items-center gap-x-1 p-0 text-xs hover:underline'
		>
			<VoteDecisionDisplay userVoteDecision={userVoteDecision} />
		</Button>
	);
}

export default memo(VoteDetailsButton);
