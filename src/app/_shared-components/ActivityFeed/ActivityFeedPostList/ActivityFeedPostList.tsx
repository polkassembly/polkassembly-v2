// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import React, { useState } from 'react';
import { IOnChainPostListingResponse, IPostListing } from '@/_shared/types';
import Image from 'next/image';
import JoinPA from '@/_assets/activityfeed/gifs/joinpa.gif';
import Loading from '@/app/loading';
import { useTranslations } from 'next-intl';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import ActivityFeedPostItem from '../ActivityFeedPostItem/ActivityFeedPostItem';
import ActivityFeedNavbar from '../ActivityFeedNavbar/ActivityFeedNavbar';
import styles from './ActivityFeedPostList.module.scss';

function ActivityFeedPostList({ postData, loading }: { postData: IOnChainPostListingResponse; loading: boolean }) {
	const [currentTab, setCurrentTab] = useState<string>('All');
	const network = getCurrentNetwork();
	const t = useTranslations();

	const filteredPosts =
		currentTab === 'All'
			? postData.posts
			: postData.posts.filter((post: IPostListing) => {
					if (!(network in NETWORKS_DETAILS)) {
						return false;
					}
					const networkInfo = NETWORKS_DETAILS[network as keyof typeof NETWORKS_DETAILS];
					if (!networkInfo) return false;

					const trackName = Object.keys(networkInfo.tracks).find((key) => post?.onChainInfo?.origin === key);
					return trackName === currentTab;
				});
	return (
		<div className='hide_scrollbar pb-16 lg:max-h-[1078px] lg:overflow-y-auto'>
			<ActivityFeedNavbar
				gov2LatestPosts={postData.posts}
				currentTab={currentTab}
				setCurrentTab={setCurrentTab}
			/>
			{loading ? (
				<Loading />
			) : filteredPosts?.length === 0 || postData?.posts?.length === 0 ? (
				<div className={styles.allCaughtUp}>
					<Image
						src={JoinPA}
						alt='empty state'
						className='h-80 w-80 p-0'
						width={320}
						height={320}
					/>
					<p className='p-0 text-xl font-medium'>{t('ActivityFeed.PostItem.allCaughtUp')}</p>
					<p
						className='p-0 text-center text-sm'
						style={{ lineHeight: '1.8' }}
					>
						{t('ActivityFeed.PostItem.allCaughtUpDescription')}
					</p>
				</div>
			) : (
				<div className='flex flex-col gap-5'>
					{(currentTab === 'All' ? postData.posts : filteredPosts).map((post: IPostListing) => (
						<ActivityFeedPostItem
							key={`${post?.proposalType}-${post?.index}-${post?.onChainInfo?.createdAt}`}
							postData={post}
						/>
					))}
				</div>
			)}
		</div>
	);
}

export default ActivityFeedPostList;
