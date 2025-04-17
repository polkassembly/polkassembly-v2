// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useEffect, useMemo, useRef, useState } from 'react';
import { EPostOrigin, IPostListing, IGenericListingResponse } from '@/_shared/types';
import Image from 'next/image';
import NoActivity from '@/_assets/activityfeed/gifs/noactivity.gif';
import { useInfiniteQuery } from '@tanstack/react-query';
import { DEFAULT_LISTING_LIMIT, STALE_TIME } from '@/_shared/_constants/listingLimit';
import { useTranslations } from 'next-intl';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { Skeleton } from '@/app/_shared-components/Skeleton';
import { LoadingSpinner } from '@/app/_shared-components/LoadingSpinner';
import ActivityFeedPostItem from '../ActivityFeedPostItem/ActivityFeedPostItem';
import styles from './ActivityFeedPostList.module.scss';
import ActivityFeedNavbar from '../ActivityFeedNavbar/ActivityFeedNavbar';

function ActivityFeedPostList({ initialData }: { initialData: IGenericListingResponse<IPostListing> }) {
	const network = getCurrentNetwork();
	const t = useTranslations();
	const [origin, setOrigin] = useState<EPostOrigin | 'All'>('All');
	const observerTarget = useRef<HTMLDivElement>(null);
	const [reachedEnd, setReachedEnd] = useState(false);

	const getExploreActivityFeed = async ({ pageParam = 1 }: { pageParam: number }) => {
		const formattedOrigin = origin === 'All' ? undefined : [origin.replace(/\s+/g, '')];

		const { data, error } = await NextApiClientService.fetchActivityFeed({
			page: pageParam,
			origins: formattedOrigin as EPostOrigin[],
			limit: DEFAULT_LISTING_LIMIT
		});
		if (!data) {
			return null;
		}
		if (error) {
			throw new Error(error.message || 'Failed to fetch data');
		}

		if (data.totalCount <= pageParam * DEFAULT_LISTING_LIMIT || data.items.length < DEFAULT_LISTING_LIMIT) {
			setReachedEnd(true);
		}

		return { ...data, page: pageParam };
	};

	const { data, isLoading, fetchNextPage, hasNextPage, isFetching } = useInfiniteQuery({
		queryKey: ['activityFeed', origin],
		queryFn: getExploreActivityFeed,
		initialPageParam: 1,
		initialData:
			origin === 'All'
				? {
						pages: [{ ...initialData, page: 1 }],
						pageParams: [1]
					}
				: undefined,
		getNextPageParam: (lastPage, allPages) => {
			if (reachedEnd || (lastPage?.items && lastPage.items.length < DEFAULT_LISTING_LIMIT)) {
				return undefined;
			}

			const totalFetched = allPages.reduce((sum, page) => sum + (page?.items?.length || 0), 0);
			if (lastPage?.totalCount && totalFetched >= lastPage.totalCount) {
				return undefined;
			}

			return lastPage?.page ? lastPage.page + 1 : undefined;
		},
		staleTime: STALE_TIME,
		enabled: true
	});

	const allPosts = useMemo(() => {
		if (origin === 'All' && !data?.pages?.length) {
			return initialData.items.filter((post): post is IPostListing => post !== undefined);
		}

		const allItems =
			data?.pages?.reduce<IPostListing[]>((acc, page) => {
				if (page?.items) {
					acc.push(...page.items);
				}
				return acc;
			}, []) || [];

		return allItems.filter((post): post is IPostListing => post !== undefined);
	}, [data?.pages, origin, initialData]);

	useEffect(() => {
		setReachedEnd(false);
	}, [origin]);

	const filteredPosts = useMemo(() => {
		if (origin === 'All') return allPosts;

		return allPosts.filter((post: IPostListing) => {
			if (!(network in NETWORKS_DETAILS)) return false;
			const networkInfo = NETWORKS_DETAILS[network as keyof typeof NETWORKS_DETAILS];
			if (!networkInfo) return false;

			const postOrigin = post?.onChainInfo?.origin;
			return postOrigin?.replace(/\s+/g, '') === origin.replace(/\s+/g, '');
		});
	}, [allPosts, origin, network]);

	useEffect(() => {
		if (reachedEnd || isFetching || !hasNextPage) return () => {};

		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting && !isLoading && hasNextPage && !isFetching && !reachedEnd) {
					fetchNextPage();
				}
			},
			{ threshold: 0.1 }
		);

		if (observerTarget.current) {
			observer.observe(observerTarget.current);
		}

		return () => observer.disconnect();
	}, [isLoading, hasNextPage, fetchNextPage, isFetching, reachedEnd]);

	if (isLoading && !data?.pages?.length) {
		return (
			<div className='pb-10'>
				<ActivityFeedNavbar
					currentTab={origin}
					setCurrentTab={setOrigin}
				/>
				<div className='flex h-full items-center justify-center bg-bg_modal'>
					<div className='flex flex-col items-center gap-4'>
						<LoadingSpinner className='mt-10 h-10 w-auto md:mt-32' />
						<Skeleton className='h-48 w-auto' />
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className='pb-10'>
			<ActivityFeedNavbar
				currentTab={origin}
				setCurrentTab={setOrigin}
			/>
			{filteredPosts?.length === 0 ? (
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
				<div className='hide_scrollbar flex flex-col gap-5 pb-16'>
					{filteredPosts?.map((post: IPostListing) => (
						<ActivityFeedPostItem
							key={`${post?.proposalType}-${post?.index}-${post?.onChainInfo?.createdAt}`}
							postData={post}
						/>
					))}
					{isFetching && !reachedEnd && (
						<div className='flex justify-center py-4'>
							<LoadingSpinner className='h-8 w-auto' />
						</div>
					)}
					{!reachedEnd && hasNextPage && (
						<div
							ref={observerTarget}
							className='h-4'
						/>
					)}
				</div>
			)}
		</div>
	);
}

export default ActivityFeedPostList;
