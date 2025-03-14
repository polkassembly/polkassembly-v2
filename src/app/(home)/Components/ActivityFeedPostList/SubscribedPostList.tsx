// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import JoinPA from '@assets/activityfeed/gifs/joinpa.gif';
import NoActivity from '@assets/activityfeed/gifs/noactivity.gif';
import { useUser } from '@/hooks/useUser';
import { EPostOrigin } from '@/_shared/types';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@ui/Button';
import styles from './ActivityFeedPostList.module.scss';
import ActivityFeedNavbar from '../ActivityFeedNavbar/ActivityFeedNavbar';

function SubscribedPostList() {
	const t = useTranslations();
	const { user } = useUser();
	const [currentTab, setCurrentTab] = useState<string>('All');

	return (
		<div>
			{user?.id && (
				<ActivityFeedNavbar
					currentTab={currentTab as EPostOrigin | 'All'}
					setCurrentTab={setCurrentTab}
				/>
			)}
			<div className={styles.allCaughtUp}>
				<Image
					src={user?.id ? NoActivity : JoinPA}
					alt='empty state'
					className='h-80 w-80 p-0'
					width={320}
					height={320}
				/>
				<p className='p-0 text-xl font-medium'>{user?.id ? t('ActivityFeed.PostItem.noActivity') : t('ActivityFeed.PostItem.LogoutAllCaughtUp')}</p>
				<p
					className='p-0 pt-3 text-center text-sm'
					style={{ lineHeight: '1.8' }}
				>
					{user?.id ? t('ActivityFeed.PostItem.noActivityDescription') : t('ActivityFeed.PostItem.LogoutAllCaughtUpDescription')}
				</p>
				{!user?.id && (
					<Link
						href='/login'
						className='flex w-full justify-center pt-5'
					>
						<Button className='w-full max-w-[420px]'>Login</Button>
					</Link>
				)}
			</div>
		</div>
	);
}

export default SubscribedPostList;
