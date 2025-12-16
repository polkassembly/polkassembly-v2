// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useIdentityService } from '@/hooks/useIdentityService';
import { useQuery } from '@tanstack/react-query';
import LoaderGif from '@/app/_shared-components/LoaderGif/LoaderGif';
import { FIVE_MIN_IN_MILLI } from '@/app/api/_api-constants/timeConstants';
import { useTranslations } from 'next-intl';
import OverviewStats from './OverviewStats';
import IdentitiesListingTable from './IdentitiesListingTable';

function OverviewTab() {
	const { identityService } = useIdentityService();
	const t = useTranslations();

	const {
		data: overviewData,
		isLoading: isStatsLoading,
		error: statsError
	} = useQuery({
		queryKey: ['identityOverview'],
		queryFn: async () => {
			if (!identityService) return null;
			return identityService.getIdentityOverviewStats();
		},
		enabled: !!identityService,
		staleTime: FIVE_MIN_IN_MILLI,
		retry: 3,
		refetchOnWindowFocus: false
	});

	const {
		data: allIdentities,
		isLoading: isIdentitiesLoading,
		error: identitiesError
	} = useQuery({
		queryKey: ['allIdentities'],
		queryFn: async () => {
			if (!identityService) return [];
			return identityService.getAllIdentities();
		},
		enabled: !!identityService,
		staleTime: FIVE_MIN_IN_MILLI,
		retry: 3,
		refetchOnWindowFocus: false
	});

	const isLoading = isStatsLoading || isIdentitiesLoading || !identityService;

	if (isLoading) {
		return <LoaderGif />;
	}

	if (statsError || identitiesError) {
		return (
			<div className='flex items-center justify-center rounded-3xl border border-primary_border bg-bg_modal p-8'>
				<p className='text-error text-center'>{t('Judgements.failedToLoadData')}</p>
			</div>
		);
	}

	return (
		<div className='flex flex-col gap-y-4'>
			<OverviewStats overviewData={overviewData} />
			<IdentitiesListingTable allIdentities={allIdentities} />
		</div>
	);
}

export default OverviewTab;
