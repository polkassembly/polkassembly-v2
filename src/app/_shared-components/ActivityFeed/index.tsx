// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';
import { EActivityFeedTab } from '@/_shared/types';
import ActivityFeedPostItem from './ActivityFeedPostItem';

const post = [
	{
		id: 1,
		amount: 2500,
		equivalentUSD: 36000,
		status: 'Active',
		proposer: '1eGtATyy4ayn77dsrhdW8N3Vs1yjqjzJcintksNmScqy31j',
		category: 'Council',
		date: '20 Dec 2021',
		title: '#45 Standard Guidelines to judge Liquidity Treasury Proposals on the main governance side - Kusama and Polkadot your Vote!',
		description:
			'Based on the income to the treasuries, the amounts getting burned and the amounts going to proposals, the treasury can be utilised: this includes spending funds, extending the c...',
		likes: 16,
		dislikes: 4,
		comments: 10,
		shares: 16,
		approvalRating: 20
	},
	{
		id: 2,
		amount: 1000,
		equivalentUSD: 15000,
		status: 'Inactive',
		proposer: '13MNarAqpNkginnQb6gTNq2QnieZGs2SKu8JdK9LLxo6ksEP',
		category: 'Governance',
		date: '15 Dec 2021',
		title: '#12 Proposal to allocate more funds for community events',
		description: 'This proposal outlines the benefits of allocating more funds for community-driven events to encourage participation and foster collaboration among members...',
		likes: 25,
		dislikes: 2,
		comments: 18,
		shares: 10,
		approvalRating: 60
	}
];

const subscribedpost = [
	{
		id: 3,
		amount: 1000,
		equivalentUSD: 15000,
		status: 'Inactive',
		proposer: '1eGtATyy4ayn77dsrhdW8N3Vs1yjqjzJcintksNmScqy31j',
		category: 'Governance',
		date: '15 Dec 2021',
		title: '#12 Proposal to allocate more funds for community events',
		description: 'This proposal outlines the benefits of allocating more funds for community-driven events to encourage participation and foster collaboration among members...',
		likes: 25,
		dislikes: 2,
		comments: 18,
		shares: 10,
		approvalRating: 60
	}
];

function LatestActivity({ currentTab }: { currentTab: EActivityFeedTab }) {
	return (
		<div className='space-y-5'>
			{currentTab === EActivityFeedTab.EXPLORE
				? post.map((item) => (
						<ActivityFeedPostItem
							key={item.id}
							postData={item}
						/>
					))
				: subscribedpost.map((item) => (
						<ActivityFeedPostItem
							key={item.id}
							postData={item}
						/>
					))}
		</div>
	);
}

export default LatestActivity;
