// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useTranslations } from 'next-intl';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { DEFAULT_LISTING_LIMIT } from '@/_shared/_constants/listingLimit';
import { EPostOrigin, EProposalType } from '@/_shared/types';
import { ClientError } from '@/app/_client-utils/clientError';
import { useQuery } from '@tanstack/react-query';
import { FIVE_MIN_IN_MILLI } from '@/app/api/_api-constants/timeConstants';
import ActivityList from './ActivityList';

function TrackTabs({ trackName }: { trackName: EPostOrigin }) {
	const t = useTranslations('Overview');

	const fetchTrackList = async () => {
		const { data, error } = await NextApiClientService.fetchListingData({
			proposalType: EProposalType.REFERENDUM_V2,
			origins: [trackName],
			limit: DEFAULT_LISTING_LIMIT,
			page: 1
		});

		if (error || !data) {
			throw new ClientError(error?.message || 'Failed to fetch data');
		}
		return data;
	};

	const { data, isFetching } = useQuery({
		queryKey: ['trackList', trackName],
		queryFn: () => fetchTrackList(),
		placeholderData: (previousData) => previousData,
		staleTime: FIVE_MIN_IN_MILLI,
		retry: false,
		refetchOnMount: false,
		refetchOnWindowFocus: false
	});
	const ViewAllUrl = `/${trackName.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()}`;

	return (
		<ActivityList
			items={data?.items || []}
			isFetching={isFetching}
			noActivityText={`${t('no')} ${trackName} ${t('activityfound')}`}
			viewAllUrl={ViewAllUrl}
		/>
	);
}

export default TrackTabs;
