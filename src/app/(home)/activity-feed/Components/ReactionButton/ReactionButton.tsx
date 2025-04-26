// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';
import { AiFillLike } from '@react-icons/all-files/ai/AiFillLike';
import { AiOutlineLike } from '@react-icons/all-files/ai/AiOutlineLike';
import { AiFillDislike } from '@react-icons/all-files/ai/AiFillDislike';
import { AiOutlineDislike } from '@react-icons/all-files/ai/AiOutlineDislike';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { EReaction } from '@/_shared/types';
import LikeGif from '@assets/reactions/Liked-Colored.gif';
import { useTranslations } from 'next-intl';
import styles from './ReactionButton.module.scss';

function ReactionButton({
	type,
	isActive,
	showGif,
	onClick,
	count,
	showText = true,
	className = 'text-bg_pink text-lg'
}: {
	type: EReaction;
	isActive: boolean;
	showGif: boolean;
	onClick?: () => void;
	showText?: boolean;
	count?: number;
	className?: string;
}) {
	const Icon = type === EReaction.like ? (isActive ? AiFillLike : AiOutlineLike) : isActive ? AiFillDislike : AiOutlineDislike;
	const t = useTranslations();

	return (
		<button
			className='relative flex cursor-pointer items-center transition-all duration-300 hover:scale-110'
			onClick={onClick}
			type='button'
		>
			<div className='relative w-[24px]'>
				{showGif ? (
					<div className={type === EReaction.like ? styles.likeGifContainer : styles.dislikeGifContainer}>
						<Image
							src={LikeGif}
							alt={`${type} Animation`}
							width={24}
							className='h-10 w-10'
							height={24}
							style={type === EReaction.dislike ? { transform: 'scaleY(-1)' } : undefined}
						/>
					</div>
				) : (
					<Icon className={cn(`${styles.activity_icons} ${className}`)} />
				)}
			</div>
			{showText && (
				<span className={`${isActive ? 'ml-1 font-bold text-bg_pink' : ''}`}>{isActive ? t(`ActivityFeed.PostItem.${type}d`) : t(`ActivityFeed.PostItem.${type}`)}</span>
			)}
			{count !== undefined && count > 0 && <span className='text-xs font-medium'>{count}</span>}
		</button>
	);
}

export default ReactionButton;
