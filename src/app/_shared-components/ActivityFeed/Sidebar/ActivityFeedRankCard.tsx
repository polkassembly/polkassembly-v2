// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import React, { useEffect, useState } from 'react';
import rankCardBg from '@assets/profile/rankcard-bg.svg';
import profileAvatar from '@assets/profile/user-icon.svg';
import rankCardInner from '@assets/profile/rankcard-inner.svg';
import rankStar from '@assets/profile/rank-star.svg';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useUser } from '@/hooks/useUser';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { IPublicUser } from '@/_shared/types';

function ActivityFeedRankCard() {
	const t = useTranslations();
	const { user } = useUser();
	const [userClientData, setUserClientData] = useState<IPublicUser | null>(null);
	const fetchUserClientData = async () => {
		try {
			if (!user?.id) {
				console.warn('No user ID available to fetch user data');
				return;
			}
			const userClientResponse = await NextApiClientService.getUserByIdApi(String(user?.id));
			if (userClientResponse?.data) {
				setUserClientData(userClientResponse.data);
			} else {
				console.error('Failed to fetch user data: No data returned');
			}
		} catch (error) {
			console.error('Error fetching user data:', error);
			setUserClientData(null);
		}
	};

	useEffect(() => {
		fetchUserClientData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [user?.id]);

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
						{t('ActivityFeed.Rank')} {userClientData?.rank || 0}
					</p>
					<div className='flex items-center justify-between gap-4 pt-8'>
						<div className='flex items-center gap-2'>
							<Image
								src={profileAvatar}
								alt='User Avatar'
								className=''
								width={32}
								height={32}
							/>
							<p className='text-base font-semibold text-btn_secondary_text'>{userClientData?.username || undefined}</p>
						</div>

						<div>
							<div className='flex items-center gap-1 rounded-lg bg-rank_card_bg px-1.5 py-0.5 font-medium'>
								<Image
									src={rankStar}
									alt='Rank Star'
									width={16}
									height={16}
								/>
								<span className='text-sm font-medium text-gray-800'>{userClientData?.profileScore || 0}</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default ActivityFeedRankCard;
