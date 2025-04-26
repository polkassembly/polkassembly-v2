// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { DEFAULT_LISTING_LIMIT } from '@/_shared/_constants/listingLimit';
import { EProposalType } from '@/_shared/types';
import { NextApiClientService } from '../_client-services/next_api_client_service';
import Overview from './Components/Overview';
import { ClientError } from '../_client-utils/clientError';

async function OverviewPage() {
	const { data: allTracksData, error: allTracksError } = await NextApiClientService.fetchListingData({
		proposalType: EProposalType.REFERENDUM_V2,
		limit: DEFAULT_LISTING_LIMIT,
		page: 1
	});

	if (allTracksError || !allTracksData) {
		throw new ClientError(allTracksError?.message || 'Failed to fetch data');
	}

	return (
		<div className='mx-auto grid max-w-7xl grid-cols-1 gap-5 px-4 py-5 lg:px-16'>
			<Overview allTracksData={allTracksData} />
		</div>
	);
}
export default OverviewPage;
