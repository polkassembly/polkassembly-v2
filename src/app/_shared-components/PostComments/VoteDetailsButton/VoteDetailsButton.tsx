// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { EVoteDecision } from '@/_shared/types';
import { AiFillLike, AiFillDislike } from 'react-icons/ai';
import SplitImg from '@assets/icons/split-yellow-icon.svg';
import SplitAbstainImg from '@assets/icons/abstainGray.svg';
import { Separator } from '../../Separator';

function VoteDetailsButton({
	userVoteType,
	votedText,
	setShowVoteDetails
}: {
	userVoteType: EVoteDecision | null;
	votedText: string;
	setShowVoteDetails: (show: boolean) => void;
}) {
	const t = useTranslations();
	if (!userVoteType) return null;

	const voteTypeDisplay = () => {
		switch (userVoteType) {
			case EVoteDecision.AYE:
				return (
					<div className='flex items-center gap-x-1'>
						<AiFillLike className='text-green-500' />
						<span className='font-medium text-green-500'>
							{votedText} {t('PostDetails.aye')}
						</span>
					</div>
				);
			case EVoteDecision.NAY:
				return (
					<div className='flex items-center gap-x-1'>
						<AiFillDislike className='text-red-500' />
						<span className='font-medium text-red-500'>
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
							className='text-[#FECA7E]'
							width={14}
							height={14}
						/>
						<span className='font-medium text-[#FECA7E]'>
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
							className='text-bodyBlue dark:text-blue-dark-high'
							width={14}
							height={14}
						/>
						<span className='text-bodyBlue dark:text-blue-dark-high font-medium'>
							{votedText} {t('PostDetails.abstain')}
						</span>
					</div>
				);
			default:
				return <span>{userVoteType}</span>;
		}
	};

	return (
		<>
			<Separator
				orientation='vertical'
				className='h-3'
			/>
			<button
				type='button'
				onClick={() => setShowVoteDetails(true)}
				className='flex items-center gap-x-1 text-xs hover:underline'
			>
				{voteTypeDisplay()}
			</button>
		</>
	);
}

export default VoteDetailsButton;
