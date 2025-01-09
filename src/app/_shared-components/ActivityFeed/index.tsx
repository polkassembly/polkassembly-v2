// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';
import { EActivityFeedTab, IOnChainPostListingResponse, EDataSource, EProposalType, ENetwork } from '@/_shared/types';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { useQuery } from '@tanstack/react-query';
import ActivityFeedPostList from './ActivityFeedPostList';

function LatestActivity({ currentTab }: { currentTab: EActivityFeedTab }) {
	const getExploreActivityFeed = async (): Promise<IOnChainPostListingResponse> => {
		const { data, error } = await NextApiClientService.getActivityFeedApi();
		if (error) {
			throw new Error(error.message || 'Failed to fetch data');
		}
		if (Array.isArray(data)) {
			const posts = data.map((post) => ({
				...post,
				dataSource: EDataSource.POLKASSEMBLY,
				proposalType: EProposalType.REFERENDUM_V2,
				network: ENetwork.POLKADOT
			}));
			return { posts, totalCount: posts.length };
		}
		return data || { posts: [], totalCount: 0 };
	};

	const { data: activityData } = useQuery<IOnChainPostListingResponse>({
		queryKey: ['activityFeed', currentTab],
		queryFn: getExploreActivityFeed
	});

	return (
		<div className='space-y-5'>{currentTab === EActivityFeedTab.EXPLORE ? <ActivityFeedPostList postData={activityData || { posts: [], totalCount: 0 }} /> : <p>No data</p>}</div>
	);
}

export default LatestActivity;
