// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { DEFAULT_LISTING_LIMIT } from '@/_shared/_constants/listingLimit';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { EPostOrigin, EProposalType } from '@/_shared/types';
import { NextApiClientService } from '../_client-services/next_api_client_service';
import Overview from './Components/Overview';

async function OverviewPage() {
	const network = getCurrentNetwork();
	const fetchTrackDetails = async () => {
		try {
			const tracks = NETWORKS_DETAILS[`${network}`]?.trackDetails || {};
			const { data: allData, error: allError } = await NextApiClientService.fetchListingData({
				proposalType: EProposalType.REFERENDUM_V2,
				limit: DEFAULT_LISTING_LIMIT,
				page: 1
			});

			if (allError) {
				console.error('Error fetching referendum data:', allError);
			}

			const { data: discussionData, error: discussionError } = await NextApiClientService.fetchListingData({
				proposalType: EProposalType.DISCUSSION,
				limit: DEFAULT_LISTING_LIMIT,
				page: 1
			});

			if (discussionError) {
				console.error('Error fetching discussion data:', discussionError);
			}

			const trackData = await Promise.all(
				Object.entries(tracks).map(async ([trackName]) => {
					try {
						const { data, error } = await NextApiClientService.fetchListingData({
							proposalType: EProposalType.REFERENDUM_V2,
							origins: [trackName as EPostOrigin],
							limit: DEFAULT_LISTING_LIMIT,
							page: 1
						});

						if (error) {
							console.error(`Error fetching track data for ${trackName}:`, error);
						}

						return { trackName, data: data || null };
					} catch (err) {
						console.error(`Error processing track ${trackName}:`, err);
						return { trackName, data: null };
					}
				})
			);

			return {
				all: allData || null,
				discussion: discussionData || null,
				tracks: trackData
			};
		} catch (err) {
			console.error('Error in fetchTrackDetails:', err);
			return {
				all: null,
				discussion: null,
				tracks: []
			};
		}
	};
	const trackDetails = await fetchTrackDetails();

	return (
		<div className='grid grid-cols-1 gap-5 p-5 sm:p-8'>
			<Overview trackDetails={trackDetails || { all: null, discussion: null, tracks: [] }} />
		</div>
	);
}
export default OverviewPage;
