// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useEffect, useRef, useState } from 'react';
import { IPostListing, IGenericListingResponse } from '@/_shared/types';
import Image from 'next/image';
import NoActivity from '@/_assets/activityfeed/gifs/noactivity.gif';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { DEFAULT_LISTING_LIMIT, STALE_TIME } from '@/_shared/_constants/listingLimit';
import { useTranslations } from 'next-intl';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { LoadingSpinner } from '@/app/_shared-components/LoadingSpinner';
import { useUser } from '@/hooks/useUser';
import Link from 'next/link';
import ActivityFeedPostItem from '../ActivityFeedPostItem/ActivityFeedPostItem';
import styles from './ActivityFeedPostList.module.scss';

interface QueryData {
	pages: {
		items: IPostListing[];
		totalCount: number;
		page: number;
	}[];
	pageParams: number[];
}

function SubscribedPostList({ initialData }: { initialData: IGenericListingResponse<IPostListing> }) {
	const t = useTranslations();
	const observerTarget = useRef<HTMLDivElement>(null);
	const [reachedEnd, setReachedEnd] = useState(false);
	const [localPosts, setLocalPosts] = useState<IPostListing[]>([]);
	const queryClient = useQueryClient();

	const { user } = useUser();

	const userId = user?.id;

	const handleUnsubscribe = (postId: string | number) => {
		setLocalPosts((prevPosts) =>
			prevPosts.filter((post) => {
				const postIdentifier = post.index ?? post.hash;
				return postIdentifier?.toString() !== postId.toString();
			})
		);
		queryClient.setQueryData<QueryData>(['subscribedActivityFeed', userId], (oldData) => {
			if (!oldData) return oldData;
			return {
				...oldData,
				pages: oldData.pages.map((page) => ({
					...page,
					items: page.items.filter((post) => {
						const postIdentifier = post.index ?? post.hash;
						return postIdentifier?.toString() !== postId.toString();
					})
				}))
			};
		});
	};

	const getSubscribedActivityFeed = async ({ pageParam = 1 }: { pageParam: number }) => {
		if (!userId) {
			return null;
		}
		const { data, error } = await NextApiClientService.getSubscribedActivityFeed({ page: pageParam, limit: DEFAULT_LISTING_LIMIT, userId });
		if (!data) {
			return null;
		}
		if (error) {
			throw new Error(error?.message || 'Failed to fetch data');
		}

		// Check if we've reached the end of available data
		if (data.totalCount <= pageParam * DEFAULT_LISTING_LIMIT || data.items.length < DEFAULT_LISTING_LIMIT) {
			setReachedEnd(true);
		}

		return { ...data, page: pageParam };
	};

	const { data, isLoading, fetchNextPage, hasNextPage, isFetching } = useInfiniteQuery({
		queryKey: ['subscribedActivityFeed', userId],
		queryFn: getSubscribedActivityFeed,
		initialPageParam: 1,
		initialData: {
			pages: [{ ...initialData, page: 1 }],
			pageParams: [1]
		},
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
		enabled: !!userId
	});

	useEffect(() => {
		const posts = data?.pages?.flatMap((page) => page?.items || []).filter((post): post is IPostListing => post !== undefined) || [];
		setLocalPosts(posts);
	}, [data]);

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
				<div className='flex h-full items-center justify-center'>
					<LoadingSpinner />
				</div>
			</div>
		);
	}

	if (!userId) {
		return (
			<div className='flex items-center justify-center gap-x-1 rounded-2xl bg-bg_modal p-4 text-text_primary'>
				{t('ActivityFeed.please')}{' '}
				<Link
					href='/login'
					className='text-text_pink'
				>
					{t('ActivityFeed.login')}
				</Link>{' '}
				{t('ActivityFeed.toView')}
			</div>
		);
	}

	return (
		<div className='pb-10'>
			{localPosts?.length === 0 ? (
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
				<div className='hide_scrollbar flex flex-col gap-5 pb-16 lg:max-h-[1078px] lg:overflow-y-auto'>
					{localPosts?.map((post: IPostListing) => (
						<ActivityFeedPostItem
							key={`${post?.proposalType}-${post?.index}-${post?.onChainInfo?.createdAt}`}
							postData={post}
							onUnsubscribe={handleUnsubscribe}
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

export default SubscribedPostList;
