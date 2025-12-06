// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Metadata } from 'next';
import { OPENGRAPH_METADATA } from '@/_shared/_constants/opengraphMetadata';
import { getNetworkFromHeaders } from '@/app/api/_api-utils/getNetworkFromHeaders';
import { getGeneratedContentMetadata } from '@/_shared/_utils/generateContentMetadata';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import GovStats from './components/GovStats';
import GovOverview from './components/GovOverview';
import GovVoting from './components/GovVoting';
import { AnalyticsHeader } from './components/Header/Header';

export const dynamic = 'force-dynamic';

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
		<div className='w-full'>
			<AnalyticsHeader />
			<div className='mx-auto flex w-full max-w-7xl flex-col gap-y-6 p-5 sm:p-10'>
				<GovStats data={analyticsData?.data || null} />
				<GovOverview />
				<GovVoting />
			</div>
		</div>
	);
}

export default GovAnalyticsPage;
