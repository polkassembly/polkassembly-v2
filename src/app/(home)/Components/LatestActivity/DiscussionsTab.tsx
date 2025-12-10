// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useTranslations } from 'next-intl';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { DEFAULT_LISTING_LIMIT } from '@/_shared/_constants/listingLimit';
import { EProposalType } from '@/_shared/types';
import { ClientError } from '@/app/_client-utils/clientError';
import { useQuery } from '@tanstack/react-query';
import { FIVE_MIN_IN_MILLI } from '@/app/api/_api-constants/timeConstants';
import ActivityList from './ActivityList';

function DiscussionsTab() {
	const t = useTranslations('Overview');

	const fetchDiscussionsList = async () => {
		const { data: discussionData, error: discussionError } = await NextApiClientService.fetchListingData({
			proposalType: EProposalType.DISCUSSION,
			limit: DEFAULT_LISTING_LIMIT,
			page: 1
		});

		if (discussionError || !discussionData) {
			throw new ClientError(discussionError?.message || 'Failed to fetch data');
		}
		return discussionData;
	};

	const { data, isFetching } = useQuery({
		queryKey: ['discussions'],
		queryFn: () => fetchDiscussionsList(),
		placeholderData: (previousData) => previousData,
		staleTime: FIVE_MIN_IN_MILLI,
		retry: false,
		refetchOnMount: false,
		refetchOnWindowFocus: false
	});
	return (
		<ActivityList
			items={data?.items || []}
			isFetching={isFetching}
			noActivityText={t('nodiscussionposts')}
			viewAllUrl='/discussions'
		/>
	);
}

export default DiscussionsTab;
