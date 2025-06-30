// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Metadata } from 'next';
import Image from 'next/image';
import { OPENGRAPH_METADATA } from '@/_shared/_constants/opengraphMetadata';
import { getNetworkFromHeaders } from '@/app/api/_api-utils/getNetworkFromHeaders';
import { getGeneratedContentMetadata } from '@/_shared/_utils/generateContentMetadata';
import govAnalyticsIcon from '@/_assets/sidebar/gov-analytics-icon.svg';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import GovStats from './components/GovStats';
import GovOverview from './components/GovOverview';
import GovVoting from './components/GovVoting';

export async function generateMetadata(): Promise<Metadata> {
	const network = await getNetworkFromHeaders();
	const { title } = OPENGRAPH_METADATA;

	return getGeneratedContentMetadata({
		title: `${title} - Governance Level Analytics`,
		description: 'Explore the Polkassembly Governance Analytics',
		network,
		url: `https://${network}.polkassembly.io/gov-analytics`,
		imageAlt: 'Polkassembly Governance Analytics'
	});
}

async function fetchGovAnalyticsData() {
	try {
		return await NextApiClientService.getGovAnalyticsStats();
	} catch (error) {
		console.error('Error fetching governance analytics data:', error);
		return null;
	}
}

async function GovAnalyticsPage() {
	const analyticsData = await fetchGovAnalyticsData();

	return (
		<div className='mx-auto grid w-full max-w-7xl grid-cols-1 gap-5 p-5 sm:p-10'>
			<h1 className='flex items-center gap-2 text-2xl font-semibold text-text_primary'>
				<Image
					src={govAnalyticsIcon}
					alt='gov analytics icon'
					width={24}
					height={24}
					className='darkIcon'
				/>
				Governance Analytics
			</h1>
			<div className='flex w-full flex-col gap-y-6 rounded-xl bg-bg_modal p-6 shadow-lg'>All active and history referenda of various tracks.</div>
			<div className='flex w-full flex-col gap-y-6 rounded-xl bg-bg_modal p-6 shadow-lg'>
				<GovStats data={analyticsData?.data || null} />
				<GovOverview />
				<GovVoting />
			</div>
		</div>
	);
}

export default GovAnalyticsPage;
