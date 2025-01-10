// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';
import { EActivityFeedTab } from '@/_shared/types';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { useQuery } from '@tanstack/react-query';
import { ADDRESS_LOGIN_TTL } from '@/app/api/_api-constants/timeConstants';
import ActivityFeedPostList from './ActivityFeedPostList';

function LatestActivity({ currentTab }: { currentTab: EActivityFeedTab }) {
	const getExploreActivityFeed = async () => {
		const { data, error } = await NextApiClientService.fetchActivityFeedApi(1, 10);
		if (error) {
			throw new Error(error.message || 'Failed to fetch data');
		}
		return data;
	};

	const { data, isLoading } = useQuery({
		queryKey: ['activityFeed', currentTab],
		queryFn: getExploreActivityFeed,
		placeholderData: (previousData) => previousData,
		staleTime: ADDRESS_LOGIN_TTL
	});

	return (
		<div>
			{currentTab === EActivityFeedTab.EXPLORE ? (
				<ActivityFeedPostList
					loading={isLoading}
					postData={data || { posts: [], totalCount: 0 }}
				/>
			) : (
				<p>Data will be available soon</p>
			)}
		</div>
	);
}

export default LatestActivity;
