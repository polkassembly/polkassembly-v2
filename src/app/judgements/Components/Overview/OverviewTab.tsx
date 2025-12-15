// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useIdentityService } from '@/hooks/useIdentityService';
import { useQuery } from '@tanstack/react-query';
import LoaderGif from '@/app/_shared-components/LoaderGif/LoaderGif';
import OverviewStats from './OverviewStats';
import IdentitiesListingTable from './IdentitiesListingTable';

function OverviewTab() {
	const { identityService } = useIdentityService();

	const { data: overviewData, isLoading: isStatsLoading } = useQuery({
		queryKey: ['identityOverview', identityService],
		queryFn: async () => {
			if (!identityService) return null;
			return identityService.getIdentityOverviewStats();
		},
		enabled: !!identityService,
		staleTime: 60000
	});

	const { data: allIdentities, isLoading: isIdentitiesLoading } = useQuery({
		queryKey: ['allIdentities', identityService],
		queryFn: async () => {
			if (!identityService) return [];
			return identityService.getAllIdentities();
		},
		enabled: !!identityService,
		staleTime: 60000
	});

	const isLoading = isStatsLoading || isIdentitiesLoading || !identityService;

	if (isLoading) {
		return <LoaderGif />;
	}

	return (
		<div className='flex flex-col gap-y-4'>
			<OverviewStats overviewData={overviewData} />
			<IdentitiesListingTable allIdentities={allIdentities} />
		</div>
	);
}

export default OverviewTab;
