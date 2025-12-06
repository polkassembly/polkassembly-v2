// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';
import { AiFillLike } from '@react-icons/all-files/ai/AiFillLike';
import { AiOutlineLike } from '@react-icons/all-files/ai/AiOutlineLike';
import { AiFillDislike } from '@react-icons/all-files/ai/AiFillDislike';
import { AiOutlineDislike } from '@react-icons/all-files/ai/AiOutlineDislike';
import { cn } from '@/lib/utils';
import { EReaction } from '@/_shared/types';
import { useTranslations } from 'next-intl';
import styles from './ReactionButton.module.scss';

function ReactionButton({
	type,
	isActive,
	onClick,
	count,
	showText = true,
	className = 'text-bg_pink text-lg',
	disabled = false
}: {
	type: EReaction;
	isActive: boolean;
	onClick?: () => void;
	showText?: boolean;
	count?: number;
	className?: string;
	disabled?: boolean;
}) {
	const Icon = type === EReaction.like ? (isActive ? AiFillLike : AiOutlineLike) : isActive ? AiFillDislike : AiOutlineDislike;
	const t = useTranslations();

	return (
		<button
			className={cn('relative flex cursor-pointer items-center transition-all duration-300 hover:scale-110', disabled ? 'opacity-50' : '')}
			onClick={onClick}
			type='button'
			disabled={disabled}
		>
			<div className='relative w-6'>
				<Icon className={cn(`${styles.activity_icons} ${className}`)} />
			</div>
			{showText && (
				<span className={`whitespace-nowrap ${isActive ? 'ml-1 font-bold text-bg_pink' : ''}`}>
					{isActive ? t(`ActivityFeed.PostItem.${type}d`) : t(`ActivityFeed.PostItem.${type}`)}
				</span>
			)}
			{count !== undefined && count > 0 && <span className='text-xs font-medium'>{count}</span>}
		</button>
	);
}

export default ReactionButton;
