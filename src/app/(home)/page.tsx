// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextApiClientService } from '../_client-services/next_api_client_service';
import Overview from './Components/Overview';
import { ClientError } from '../_client-utils/clientError';

async function OverviewPage() {
	const { allTracks, treasuryStats } = await NextApiClientService.fetchOverviewData();

	if (allTracks.error || !allTracks.data) {
		throw new ClientError(allTracks.error?.message || 'Failed to fetch data');
	}

	return (
		<div className='mx-auto grid max-w-7xl grid-cols-1 gap-5 px-4 py-5 lg:px-16'>
			<Overview
				allTracksData={allTracks.data}
				treasuryStatsData={treasuryStats.error ? [] : treasuryStats.data || []}
			/>
		</div>
	);
}
export default OverviewPage;
