// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { useEffect } from 'react';
import { EActivityFeedTab, IPostListing } from '@/_shared/types';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { useInfiniteQuery } from '@tanstack/react-query';
import { ADDRESS_LOGIN_TTL } from '@/app/api/_api-constants/timeConstants';
import ActivityFeedPostList from './ActivityFeedPostList';

function LatestActivity({ currentTab }: { currentTab: EActivityFeedTab }) {
	const observerTarget = React.useRef<HTMLDivElement>(null);

	// Fetch activity feed API
	const getExploreActivityFeed = async ({ pageParam = 1 }: { pageParam: number }) => {
		const { data, error } = await NextApiClientService.fetchActivityFeedApi(pageParam, 10);
		if (error) {
			throw new Error(error.message || 'Failed to fetch data');
		}
		return { ...data, page: pageParam };
	};

	// Infinite query
	const { data, isLoading, isError, error, fetchNextPage, hasNextPage } = useInfiniteQuery({
		queryKey: ['activityFeed', currentTab],
		queryFn: getExploreActivityFeed,
		initialPageParam: 1,
		getNextPageParam: (lastPage) => (lastPage.posts?.length === 10 ? lastPage.page + 1 : undefined),
		staleTime: ADDRESS_LOGIN_TTL
	});

	// Flatten all posts from pages
	const allPosts = data?.pages.flatMap((page) => page.posts || []).filter((post): post is IPostListing => post !== undefined);

	// Intersection Observer
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
		<div>
			{currentTab === EActivityFeedTab.EXPLORE ? (
				<>
					<ActivityFeedPostList
						loading={isLoading}
						postData={{
							posts: allPosts || [],
							totalCount: data?.pages[0]?.totalCount || 0
						}}
					/>
					{isError && <p>Error: {error?.message}</p>}
					<div
						ref={observerTarget}
						style={{ height: '20px' }}
					/>
				</>
			) : (
				<p>Data will be available soon</p>
			)}
		</div>
	);
}
export default LatestActivity;
