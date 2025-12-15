// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useIdentityService } from '@/hooks/useIdentityService';
import { useQuery } from '@tanstack/react-query';
import { EJudgementStatus } from '@/_shared/types';
import { FIVE_MIN_IN_MILLI } from '@/app/api/_api-constants/timeConstants';
import LoaderGif from '@/app/_shared-components/LoaderGif/LoaderGif';
import RegistrarsSummary from '../TabSummary/RegistrarsSummary';
import RegistrarsListingTable from './RegistrarsListingTable';

function RegistrarsTab() {
	const { identityService } = useIdentityService();

	const {
		data: stats,
		isLoading: isStatsLoading,
		isError
	} = useQuery({
		queryKey: ['judgementStats', identityService],
		queryFn: async () => {
			if (!identityService) return { totalJudgementsGranted: 0, totalRegistrars: 0 };
			const allJudgements = await identityService.getAllIdentityJudgements();
			const registrars = await identityService.getRegistrars();

			const totalJudgementsGranted = allJudgements.filter((j) => j.status === EJudgementStatus.APPROVED).length;
			const totalRegistrars = registrars.length;

			return { totalJudgementsGranted, totalRegistrars };
		},
		staleTime: FIVE_MIN_IN_MILLI,
		retry: 3,
		refetchOnWindowFocus: false,
		enabled: !!identityService
	});

	const { data: allRegistrarsData, isLoading: isRegistrarsLoading } = useQuery({
		queryKey: ['allRegistrarsData', identityService],
		queryFn: async () => {
			if (!identityService) return { registrars: [], judgements: [] };
			const registrarsData = await identityService.getRegistrars();
			const judgements = await identityService.getAllIdentityJudgements();
			return { registrars: registrarsData, judgements };
		},
		enabled: !!identityService,
		staleTime: 60000
	});

	const isLoading = isStatsLoading || isRegistrarsLoading || !identityService;

	if (isLoading) {
		return <LoaderGif />;
	}

	return (
		<div className='flex flex-col gap-y-4'>
			<RegistrarsSummary
				stats={stats}
				isError={isError}
			/>
			<RegistrarsListingTable allRegistrarsData={allRegistrarsData} />
		</div>
	);
}

export default RegistrarsTab;
