// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useEffect, useRef } from 'react';
import { IPostListing, IGenericListingResponse } from '@/_shared/types';
import Image from 'next/image';
import NoActivity from '@/_assets/activityfeed/gifs/noactivity.gif';
import { useInfiniteQuery } from '@tanstack/react-query';
import { DEFAULT_LISTING_LIMIT, STALE_TIME } from '@/_shared/_constants/listingLimit';
import { ClientError } from '@/app/_client-utils/clientError';
import { useTranslations } from 'next-intl';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { LoadingSpinner } from '@/app/_shared-components/LoadingSpinner';
import { useUser } from '@/hooks/useUser';
import ActivityFeedPostItem from '../ActivityFeedPostItem/ActivityFeedPostItem';
import styles from './ActivityFeedPostList.module.scss';

function SubscribedPostList({ initialData }: { initialData: IGenericListingResponse<IPostListing> }) {
	const t = useTranslations();
	const observerTarget = useRef<HTMLDivElement>(null);

	const { user } = useUser();

	const userId = user?.id;

	if (!userId) {
		throw new ClientError('User not found');
	}

	const getSubscribedActivityFeed = async ({ pageParam = 1 }: { pageParam: number }) => {
		const { data, error } = await NextApiClientService.getSubscribedActivityFeed({ page: pageParam, limit: DEFAULT_LISTING_LIMIT, userId });
		if (!data || error) {
			throw new Error(error?.message || 'Failed to fetch data');
		}
		return { ...data, page: pageParam };
	};

	const { data, isLoading, fetchNextPage, hasNextPage } = useInfiniteQuery({
		queryKey: ['subscribedActivityFeed', userId],
		queryFn: getSubscribedActivityFeed,
		initialPageParam: 1,
		initialData: {
			pages: [{ ...initialData, page: 1 }],
			pageParams: [1]
		},
		getNextPageParam: (lastPage) => {
			if (lastPage?.items?.length === DEFAULT_LISTING_LIMIT) {
				return lastPage.page + 1;
			}
			return undefined;
		},
		staleTime: STALE_TIME,
		enabled: !!userId && initialData?.items?.length < 10
	});

	const allPosts = data?.pages?.flatMap((page) => page.items || []).filter((post): post is IPostListing => post !== undefined);

	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting && !isLoading && hasNextPage) {
					fetchNextPage();
				}
			},
			{ threshold: 0.1 }
		);

		if (observerTarget.current) {
			observer.observe(observerTarget.current);
		}

		return () => observer.disconnect();
	}, [isLoading, hasNextPage, fetchNextPage]);

	return (
		<div className='pb-10'>
			{isLoading ? (
				<div className='flex h-full items-center justify-center'>
					<LoadingSpinner />
				</div>
			) : allPosts?.length === 0 ? (
				<div className={styles.allCaughtUp}>
					<Image
						src={NoActivity}
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
				<div
					ref={observerTarget}
					className='hide_scrollbar flex flex-col gap-5 pb-16 lg:max-h-[1078px] lg:overflow-y-auto'
				>
					{allPosts?.map((post: IPostListing) => (
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

export default SubscribedPostList;
