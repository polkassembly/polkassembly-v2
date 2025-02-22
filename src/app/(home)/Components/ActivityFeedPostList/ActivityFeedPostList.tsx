// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { EPostOrigin, IPostListing, IGenericListingResponse } from '@/_shared/types';
import Image from 'next/image';
import NoActivity from '@/_assets/activityfeed/gifs/noactivity.gif';
import { useInfiniteQuery } from '@tanstack/react-query';
import { DEFAULT_LISTING_LIMIT, SLATE_TIME } from '@/_shared/_constants/listingLimit';
import { useTranslations } from 'next-intl';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { LoadingSpinner } from '@/app/_shared-components/LoadingSpinner';
import ActivityFeedPostItem from '../ActivityFeedPostItem/ActivityFeedPostItem';
import styles from './ActivityFeedPostList.module.scss';
import ActivityFeedNavbar from '../ActivityFeedNavbar/ActivityFeedNavbar';

function ActivityFeedPostList({ initialData }: { initialData: IGenericListingResponse<IPostListing> }) {
	const network = getCurrentNetwork();
	const t = useTranslations();

	const [origin, setOrigin] = useState<EPostOrigin | 'All'>('All');
	const observerTarget = useRef<HTMLDivElement>(null);

	// Fetch activity feed API
	const getExploreActivityFeed = async ({ pageParam = 1 }: { pageParam: number }) => {
		const formattedOrigin = origin === 'All' ? undefined : origin;
		const { data, error } = await NextApiClientService.fetchActivityFeed({ page: pageParam, origin: formattedOrigin, limit: DEFAULT_LISTING_LIMIT });
		if (error) {
			throw new Error(error.message || 'Failed to fetch data');
		}
		return { ...data, page: pageParam };
	};

	// Infinite query
	const { data, isLoading, fetchNextPage, hasNextPage } = useInfiniteQuery({
		queryKey: ['activityFeed', origin],
		queryFn: getExploreActivityFeed,
		initialPageParam: 1,
		initialData: {
			pages: [{ ...initialData, page: 1 }],
			pageParams: [1]
		},
		getNextPageParam: (lastPage) => {
			if (lastPage.items?.length === DEFAULT_LISTING_LIMIT) {
				return lastPage.page + 1;
			}
			return undefined;
		},
		staleTime: SLATE_TIME
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
	const filteredPosts = useMemo(() => {
		if (origin === 'All') return allPosts;

		return allPosts?.filter((post: IPostListing) => {
			if (!(network in NETWORKS_DETAILS)) {
				return false;
			}
			const networkInfo = NETWORKS_DETAILS[network as keyof typeof NETWORKS_DETAILS];
			if (!networkInfo) return false;

			const trackName = Object.keys(networkInfo.trackDetails).find((key) => post?.onChainInfo?.origin === key);
			return trackName === origin;
		});
	}, [allPosts, origin, network]);

	return (
		<div className='pb-10'>
			<ActivityFeedNavbar
				gov2LatestPosts={allPosts || []}
				currentTab={origin}
				setCurrentTab={setOrigin}
			/>
			{isLoading ? (
				<div className='flex h-full items-center justify-center'>
					<LoadingSpinner />
				</div>
			) : filteredPosts?.length === 0 ? (
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
					{filteredPosts?.map((post: IPostListing) => (
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
