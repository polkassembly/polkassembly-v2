// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';
import rankCardBg from '@assets/profile/rankcard-bg.svg';
import profileAvatar from '@assets/profile/user-icon.svg';
import rankCardInner from '@assets/profile/rankcard-inner.svg';
import rankStar from '@assets/profile/rank-star.svg';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

function ActivityFeedRankCard() {
	const t = useTranslations();
	return (
		<div className='relative'>
			<div className='absolute inset-0 z-0'>
				<Image
					src={rankCardBg}
					alt='Rank Card Background'
					className='w-full object-cover'
					priority
				/>
			</div>

			<div className='relative z-10 flex flex-col'>
				<div className='absolute top-9'>
					<Image
						src={rankCardInner}
						alt='Rank Card Inner'
						width={500}
						height={500}
						priority
						className='filter dark:brightness-0 dark:saturate-100'
					/>
				</div>

				<div className='z-20 flex flex-col justify-between px-5 pt-3 text-center'>
					<p className='text-base font-semibold text-text_primary dark:text-[#243A57]'>{t('ActivityFeed.Rank')} 49</p>
					<div className='flex items-center justify-between gap-4 pt-8'>
						<div className='flex items-center gap-2'>
							<Image
								src={profileAvatar}
								alt='User Avatar'
								className=''
								width={32}
								height={32}
							/>
							<p className='text-base font-semibold text-btn_secondary_text'>Courtney</p>
						</div>

						<div>
							<div className='flex items-center gap-1 rounded-lg bg-[#FCC636] px-1.5 py-0.5 font-medium'>
								<Image
									src={rankStar}
									alt='Rank Star'
									width={16}
									height={16}
								/>
								<span className='text-sm font-medium text-gray-800'>870</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default ActivityFeedRankCard;
