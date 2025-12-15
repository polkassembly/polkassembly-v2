// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useIdentityService } from '@/hooks/useIdentityService';
import { useQuery } from '@tanstack/react-query';
import { IJudgementStats, IJudgementRequest } from '@/_shared/types';
import { FIVE_MIN_IN_MILLI } from '@/app/api/_api-constants/timeConstants';
import { getJudgementStats } from '@/app/_client-utils/identityUtils';
import LoaderGif from '@/app/_shared-components/LoaderGif/LoaderGif';
import DashboardSummary from '../TabSummary/DashboardSummary';
import JudgementListingTable from './JudgementListingTable';

function JudgementsTab() {
	const { identityService } = useIdentityService();

	const {
		data: judgementsData,
		isLoading,
		isError
	} = useQuery<{ stats: IJudgementStats; allJudgements: IJudgementRequest[] }>({
		queryKey: ['judgementsTabData'],
		queryFn: async () => {
			const allJudgements = await identityService!.getAllIdentityJudgements();
			const stats = getJudgementStats(allJudgements);
			return { stats, allJudgements };
		},
		staleTime: FIVE_MIN_IN_MILLI,
		retry: 3,
		refetchOnWindowFocus: false,
		enabled: !!identityService
	});

	if (isLoading || !identityService) {
		return <LoaderGif />;
	}

	return (
		<div className='flex flex-col gap-y-4'>
			<DashboardSummary
				stats={judgementsData?.stats}
				isError={isError}
			/>
			<JudgementListingTable allJudgements={judgementsData?.allJudgements} />
		</div>
	);
}

export default JudgementsTab;
