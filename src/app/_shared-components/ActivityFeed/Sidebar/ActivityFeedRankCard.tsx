// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { useUser } from '@/hooks/useUser';
import Image from 'next/image';
import userIcon from '@assets/icons/user-profile.png';
import { Icon } from '../../Icon';

function ActivityFeedRankCard() {
	const t = useTranslations();
	const { user } = useUser();
	if (!user?.publicUser) return null;

	return (
		<div className='relative'>
			<div className='absolute inset-0 z-0'>
				<Icon
					name='profile/rankcard-bg'
					className='h-28 w-full object-cover'
				/>
			</div>

			<div className='relative z-10 flex flex-col'>
				<div className='absolute top-9'>
					<Icon
						name='profile/rankcard-inner'
						className='h-24 w-full filter dark:brightness-0 dark:saturate-100'
					/>
				</div>

				<div className='z-20 flex flex-col justify-between px-5 pt-3 text-center'>
					<p className='text-base font-semibold text-rank_card_text'>
						{t('ActivityFeed.Rank')} {user?.publicUser?.rank}
					</p>
					<div className='flex items-center justify-between gap-4 pt-8'>
						<div className='flex items-center gap-2'>
							<Image
								src={userIcon}
								alt='User Icon'
								className='h-10 w-10 rounded-full'
								width={32}
								height={32}
							/>
							<p className='text-base font-semibold text-btn_secondary_text'>{user?.username}</p>
						</div>

						<div>
							<div className='flex items-center gap-1 rounded-lg bg-rank_card_bg px-1.5 py-0.5 font-medium'>
								<Icon
									name='profile/rank-star'
									className='h-4 w-4'
								/>
								<span className='text-sm font-medium text-gray-800'>{user?.publicUser?.profileScore}</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default ActivityFeedRankCard;
