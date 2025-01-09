// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import { IOnChainPostListingResponse } from '@/_shared/types';
import Image from 'next/image';
import JoinPA from '@/_assets/activityfeed/gifs/joinpa.gif';
import ActivityFeedPostItem from './ActivityFeedPostItem/ActivityFeedPostItem';

function ActivityFeedPostList({ postData }: { postData: IOnChainPostListingResponse }) {
	return (
		<div className='hide-scrollbar space-y-5 lg:max-h-[1078px] lg:overflow-y-auto'>
			{postData?.posts?.length === 0 ? (
				<div className='flex h-[900px] flex-col items-center rounded-xl border border-solid border-[#D2D8E0] bg-white px-5 pt-5 dark:border-[#4B4B4B] dark:bg-[#0D0D0D] md:pt-10'>
					<Image
						src={JoinPA}
						alt='empty state'
						className='h-80 w-80 p-0'
						width={320}
						height={320}
					/>
					<p className='p-0 text-xl font-medium text-[#243A57] dark:text-white'>You&apos;re all caught up!</p>
					<p
						className='p-0 text-center text-[#243A57] dark:text-white'
						style={{ lineHeight: '1.8' }}
					>
						Why not explore other categories or topics?
					</p>
				</div>
			) : (
				postData.posts.map((post) => (
					<ActivityFeedPostItem
						key={post?.index}
						postData={post}
						totalCount={postData?.totalCount}
					/>
				))
			)}
		</div>
	);
}

export default ActivityFeedPostList;
