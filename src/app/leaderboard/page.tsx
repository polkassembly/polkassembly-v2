// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ERROR_CODES, ERROR_MESSAGES } from '@/_shared/_constants/errorLiterals';
import { DEFAULT_LISTING_LIMIT } from '@/_shared/_constants/listingLimit';
import { Metadata } from 'next';
import { OPENGRAPH_METADATA } from '@/_shared/_constants/opengraphMetadata';
import { getNetworkFromHeaders } from '@/app/api/_api-utils/getNetworkFromHeaders';
import { getGeneratedContentMetadata } from '@/_shared/_utils/generateContentMetadata';
import { ExternalLink } from 'lucide-react';
import LeaderboardTabsClient from './LeaderboardTabsClient';
import { ClientError } from '../_client-utils/clientError';
import { NextApiClientService } from '../_client-services/next_api_client_service';

export async function generateMetadata(): Promise<Metadata> {
	const network = await getNetworkFromHeaders();
	const { title } = OPENGRAPH_METADATA;

	return getGeneratedContentMetadata({
		title: `${title} - Leaderboard`,
		description: 'Explore the Polkassembly Leaderboard',
		network,
		url: `https://${network}.polkassembly.io/leaderboard`,
		imageAlt: 'Polkassembly Leaderboard'
	});
}

async function LeaderboardPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
	const searchParamsValue = await searchParams;
	const page = parseInt(searchParamsValue.page || '1', DEFAULT_LISTING_LIMIT);

	const { data, error } = await NextApiClientService.fetchLeaderboardApi({ page });
	const { data: top3RankData, error: top3RankError } = await NextApiClientService.fetchLeaderboardApi({ page: 1, limit: 3 });

	if (error || !data || top3RankError || !top3RankData) {
		throw new ClientError(ERROR_CODES.CLIENT_ERROR, error?.message || ERROR_MESSAGES[ERROR_CODES.CLIENT_ERROR]);
	}
	return (
		<div className='w-full bg-bg_modal'>
			<div className='border-0 px-4 py-5 shadow-none lg:px-20 lg:py-10'>
				<div className='mb-4 p-0'>
					<div className='text-2xl font-bold'>Leaderboard</div>
				</div>
				<div className='p-0'>
					<p className='mb-2 text-muted-foreground'>
						Discover the most active and impactful participants across the network. The leaderboard highlights top voters, delegates, and proposers driving governance forward —
						based on verified activity and influence.
					</p>
					<a
						href='//wiki.polkassembly.io/docs/learn-governance/leaderboard'
						className='inline-flex items-center gap-1 font-medium text-pink-600 hover:underline'
					>
						Read More <ExternalLink size={14} />
					</a>
				</div>
			</div>
			<LeaderboardTabsClient
				data={data}
				top3RankData={top3RankData}
			/>
		</div>
	);
}

export default LeaderboardPage;
