// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Metadata } from 'next';
import { OPENGRAPH_METADATA } from '@/_shared/_constants/opengraphMetadata';
import { getNetworkFromHeaders } from '@/app/api/_api-utils/getNetworkFromHeaders';
import { getGeneratedContentMetadata } from '@/_shared/_utils/generateContentMetadata';
import { ClientError } from '../_client-utils/clientError';
import Overview from './Components/Overview';
import { NextApiClientService } from '../_client-services/next_api_client_service';
import { getReferrerFromHeaders } from '../../_shared/_utils/getReferrerFromHeaders';
import KlaraAutoOpen from '../_shared-components/Klara/KlaraAutoOpen';

export async function generateMetadata(): Promise<Metadata> {
	const network = await getNetworkFromHeaders();
	const { title } = OPENGRAPH_METADATA;

	return getGeneratedContentMetadata({
		title,
		description: 'Polkassembly is a community-driven platform',
		url: `https://${network}.polkassembly.io`,
		imageAlt: 'Polkassembly',
		network
	});
}

async function OverviewPage() {
	const { allTracks, treasuryStats } = await NextApiClientService.fetchOverviewData();
	const referer = await getReferrerFromHeaders();

	if (allTracks.error || !allTracks.data) {
		throw new ClientError(allTracks.error?.message || 'Failed to fetch data');
	}

	return (
		<div>
			<Overview
				allTracksData={allTracks.data}
				treasuryStatsData={treasuryStats.error ? [] : treasuryStats.data || []}
			/>
			<KlaraAutoOpen referer={referer} />
		</div>
	);
}
export default OverviewPage;
