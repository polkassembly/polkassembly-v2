// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import React from 'react';
import rankCardBg from '@assets/profile/rankcard-bg.svg';
import profileAvatar from '@assets/profile/user-icon.svg';
import rankCardInner from '@assets/profile/rankcard-inner.svg';
import rankStar from '@assets/profile/rank-star.svg';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useUser } from '@/hooks/useUser';
import Link from 'next/link';

function ActivityFeedRankCard() {
	const t = useTranslations();
	const { user } = useUser();

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
					<p className='text-base font-semibold text-rank_card_text'>
						{t('ActivityFeed.Rank')} {user?.publicUser?.rank ?? '#'}
					</p>
					<div className='w-full pt-8'>
						{user?.publicUser?.rank ? (
							<div className='flex items-center justify-between'>
								<div className='flex items-center gap-2'>
									<Image
										src={profileAvatar}
										alt='User Avatar'
										className=''
										width={32}
										height={32}
									/>
									<p className='max-w-28 truncate font-semibold text-btn_secondary_text'>{user.username.charAt(0).toUpperCase() + user.username.slice(1)}</p>
								</div>

								<div>
									<div className='flex items-center gap-1 rounded-lg bg-rank_card_bg px-1.5 py-0.5 font-medium'>
										<Image
											src={rankStar}
											alt='Rank Star'
											width={16}
											height={16}
										/>
										<span className='text-sm font-medium text-gray-800'>{user?.publicUser?.profileScore}</span>
									</div>
								</div>
							</div>
						) : (
							<div className='w-full text-center'>
								<p className='font-medium text-text_primary'>
									<Link
										href='/login'
										className='cursor-pointer text-text_pink underline'
									>
										{t('Profile.login')}
									</Link>{' '}
									{t('ActivityFeed.NoRank')}
								</p>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}

export default ActivityFeedRankCard;
