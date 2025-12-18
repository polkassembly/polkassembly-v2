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
		data: registrarsData,
		isLoading,
		isError
	} = useQuery({
		queryKey: ['registrarsTabData'],
		queryFn: async () => {
			const [registrars, judgements] = await Promise.all([identityService!.getRegistrars(), identityService!.getAllIdentityJudgements()]);

			const totalJudgementsGranted = judgements.filter((j) => j.status === EJudgementStatus.APPROVED).length;

			return {
				stats: { totalJudgementsGranted, totalRegistrars: registrars.length },
				allRegistrarsData: { registrars, judgements }
			};
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
			<RegistrarsSummary
				stats={registrarsData?.stats}
				isError={isError}
			/>
			<RegistrarsListingTable allRegistrarsData={registrarsData?.allRegistrarsData} />
		</div>
	);
}

export default RegistrarsTab;
