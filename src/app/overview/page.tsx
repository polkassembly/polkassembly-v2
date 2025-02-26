// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { ENetwork, EPostOrigin, EProposalType } from '@/_shared/types';
import { NextApiClientService } from '../_client-services/next_api_client_service';
import Overview from './Components/Overview';

async function page() {
	const network = getCurrentNetwork();
	const fetchTrackDetails = async () => {
		const tracks = NETWORKS_DETAILS[network as ENetwork]?.trackDetails || {};
		const { data: allData } = await NextApiClientService.fetchListingData({
			proposalType: EProposalType.REFERENDUM_V2,
			limit: 8,
			page: 1
		});
		const { data: discussionData } = await NextApiClientService.fetchListingData({
			proposalType: EProposalType.DISCUSSION,
			limit: 8,
			page: 1
		});
		const trackData = await Promise.all(
			Object.entries(tracks).map(async ([trackName]) => {
				const { data } = await NextApiClientService.fetchListingData({
					proposalType: EProposalType.REFERENDUM_V2,
					origins: [trackName as EPostOrigin],
					limit: 8,
					page: 1
				});

				return { trackName, data };
			})
		);
		return {
			all: allData,
			discussion: discussionData,
			tracks: trackData
		};
	};
	const trackDetails = await fetchTrackDetails();

	const symbol = NETWORKS_DETAILS[network as ENetwork].tokenSymbol;
	const tokenPrice = await NextApiClientService?.getCurrentTokenPrice({ symbol });

	return (
		<div className='grid grid-cols-1 gap-5 p-5 sm:p-8'>
			<Overview
				trackDetails={trackDetails || { all: [], discussion: [], tracks: [] }}
				tokenPrice={tokenPrice.data ?? { price: 'N/A' }}
			/>
		</div>
	);
}

export default page;
