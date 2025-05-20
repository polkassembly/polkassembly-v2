// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ERROR_CODES, ERROR_MESSAGES } from '@/_shared/_constants/errorLiterals';
import { DEFAULT_LISTING_LIMIT } from '@/_shared/_constants/listingLimit';
import { Metadata } from 'next';
import { OPENGRAPH_METADATA } from '@/_shared/_constants/opengraphMetadata';
import { getNetworkFromHeaders } from '@/app/api/_api-utils/getNetworkFromHeaders';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import Leaderboard from './Components/index';
import { ClientError } from '../_client-utils/clientError';
import { NextApiClientService } from '../_client-services/next_api_client_service';

export async function generateMetadata(): Promise<Metadata> {
	const network = await getNetworkFromHeaders();
	const { title, description } = OPENGRAPH_METADATA;
	const image = NETWORKS_DETAILS[`${network}`].openGraphImage?.large;
	const smallImage = NETWORKS_DETAILS[`${network}`].openGraphImage?.small;

	return {
		title: `${title} - Leaderboard`,
		description,
		metadataBase: new URL(`https://${network}.polkassembly.io`),
		icons: [{ url: '/favicon.ico' }],
		openGraph: {
			title: `${title} - Leaderboard`,
			description,
			images: [
				{
					url: image || '',
					width: 600,
					height: 600,
					alt: 'Polkassembly Leaderboard'
				},
				{
					url: smallImage || '',
					width: 1200,
					height: 600,
					alt: 'Polkassembly Leaderboard'
				}
			],
			siteName: 'Polkassembly',
			type: 'website',
			url: `https://${network}.polkassembly.io/leaderboard`
		},
		twitter: {
			card: 'summary_large_image',
			title: `${title} - Leaderboard`,
			description,
			images: image ? [image] : [smallImage || ''],
			site: '@polkassembly'
		}
	};
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
		<div className='mx-auto grid max-w-7xl grid-cols-1 gap-5 p-5 sm:p-10'>
			<Leaderboard
				data={data}
				top3RankData={top3RankData}
			/>
		</div>
	);
}

export default LeaderboardPage;
