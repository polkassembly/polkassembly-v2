// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useIdentityService } from '@/hooks/useIdentityService';
import { useQuery } from '@tanstack/react-query';
import { IJudgementStats } from '@/_shared/types';
import { FIVE_MIN_IN_MILLI } from '@/app/api/_api-constants/timeConstants';
import { getJudgementStats } from '@/app/_client-utils/identityUtils';
import LoaderGif from '@/app/_shared-components/LoaderGif/LoaderGif';
import DashboardSummary from '../TabSummary/DashboardSummary';
import JudgementListingTable from './JudgementListingTable';

function JudgementsTab() {
	const { identityService } = useIdentityService();

	const {
		data: stats,
		isLoading: isStatsLoading,
		isError
	} = useQuery<IJudgementStats>({
		queryKey: ['judgementStats'],
		queryFn: async () => {
			const allJudgements = await identityService!.getAllIdentityJudgements();
			return getJudgementStats(allJudgements);
		},
		staleTime: FIVE_MIN_IN_MILLI,
		retry: 3,
		refetchOnWindowFocus: false,
		enabled: !!identityService
	});

	const { data: allJudgements, isLoading: isJudgementsLoading } = useQuery({
		queryKey: ['allJudgementRequests', identityService],
		queryFn: async () => {
			if (!identityService) return [];
			return identityService.getAllIdentityJudgements();
		},
		enabled: !!identityService,
		staleTime: 60000
	});

	const isLoading = isStatsLoading || isJudgementsLoading || !identityService;

	if (isLoading) {
		return <LoaderGif />;
	}

	return (
		<div className='flex flex-col gap-y-4'>
			<DashboardSummary
				stats={stats}
				isError={isError}
			/>
			<JudgementListingTable allJudgements={allJudgements} />
		</div>
	);
}

export default JudgementsTab;
