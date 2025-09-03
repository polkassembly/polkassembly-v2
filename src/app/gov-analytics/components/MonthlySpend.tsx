// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useTranslations } from 'next-intl';
import { Skeleton } from '@/app/_shared-components/Skeleton';
import TreasuryStats from '@/app/_shared-components/TreasuryStats/TreasuryStats';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { useQuery } from '@tanstack/react-query';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { dayjs } from '@/_shared/_utils/dayjsInit';

function MonthlySpend() {
	const t = useTranslations('GovAnalytics');
	const network = getCurrentNetwork();

	const { data, isLoading } = useQuery({
		queryKey: ['monthlySpend', network],
		queryFn: async () => {
			const { data: treasuryStatsData, error: treasuryStatsError } = await NextApiClientService.getTreasuryStats({
				from: dayjs().subtract(1, 'month').toDate(),
				to: dayjs().toDate()
			});
			return treasuryStatsError ? [] : treasuryStatsData || [];
		},
		enabled: !!network
	});

	if (isLoading) {
		return (
			<div className='flex flex-col gap-4 rounded-lg border border-border_grey p-4'>
				<h3 className='text-blue-light-high dark:text-blue-dark-high text-base font-semibold'>{t('monthlySpend')}</h3>
				<div className='flex flex-col gap-2'>
					<Skeleton className='h-8 w-full' />
					<Skeleton className='h-8 w-full' />
					<Skeleton className='h-8 w-full' />
				</div>
			</div>
		);
	}

	return (
		<div className='flex flex-col gap-4 rounded-lg border border-border_grey p-3 lg:p-4'>
			<h3 className='text-blue-light-high dark:text-blue-dark-high text-base font-semibold'>{t('monthlySpend')}</h3>
			<div className='flex flex-col gap-2'>
				<TreasuryStats data={data || []} />
			</div>
		</div>
	);
}

export default MonthlySpend;
