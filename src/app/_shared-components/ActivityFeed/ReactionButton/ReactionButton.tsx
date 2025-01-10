// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';
import { AiFillLike, AiOutlineLike, AiFillDislike, AiOutlineDislike } from 'react-icons/ai';
import Image from 'next/image';
import LikeGif from '@assets/reactions/Liked-Colored.gif';
import styles from './ReactionButton.module.scss';

function ReactionButton({ type, isActive, showGif, onClick }: { type: 'like' | 'dislike'; isActive: boolean; showGif: boolean; onClick: () => void }) {
	const Icon = type === 'like' ? (isActive ? AiFillLike : AiOutlineLike) : isActive ? AiFillDislike : AiOutlineDislike;

	return (
		<button
			className='relative flex cursor-pointer items-center'
			onClick={onClick}
			type='button'
		>
			<div className='relative mr-1 w-[24px]'>
				{showGif ? (
					<div className={type === 'like' ? styles.likeGifContainer : styles.dislikeGifContainer}>
						<Image
							src={LikeGif}
							alt={`${type} Animation`}
							width={24}
							className='h-10 w-10'
							height={24}
							style={type === 'dislike' ? { transform: 'scaleY(-1)' } : undefined}
						/>
					</div>
				) : (
					<Icon className={`${styles.activity_icons} text-lg ${isActive ? 'text-text_pink' : ''}`} />
				)}
			</div>
			<span className={isActive ? 'text-text_pink' : ''}>{isActive ? `${type}d` : type}</span>
		</button>
	);
}

export default ReactionButton;
