// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useTranslations } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { Skeleton } from '@/app/_shared-components/Skeleton';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { PieChart } from 'react-minimal-pie-chart';

interface ICategoryCounts {
	governance: number | null;
	main: number | null;
	treasury: number | null;
	whiteList: number | null;
}

function AnalyticsReferendumCount() {
	const t = useTranslations('GovAnalytics');
	const network = getCurrentNetwork();

	const { data, isLoading } = useQuery({
		queryKey: ['gov-analytics-referendum-count', network],
		queryFn: async () => {
			const response = await NextApiClientService.getGovAnalyticsReferendumCount();
			return response.data;
		}
	});

	const categoryCounts: ICategoryCounts = data?.categoryCounts || {
		governance: null,
		main: null,
		treasury: null,
		whiteList: null
	};

	const chartData = [
		{
			title: 'Governance',
			value: categoryCounts.governance ?? 0,
			color: '#dcc359'
		},
		{
			title: 'Main',
			value: categoryCounts.main ?? 0,
			color: '#384d6c'
		},
		{
			title: 'Treasury',
			value: categoryCounts.treasury ?? 0,
			color: '#da6087'
		},
		{
			title: 'Whitelist',
			value: categoryCounts.whiteList ?? 0,
			color: '#e18d57'
		}
	];

	if (isLoading) {
		return (
			<div className='flex flex-col gap-4 rounded-lg border border-border_grey p-4'>
				<h3 className='text-blue-light-high dark:text-blue-dark-high text-base font-semibold'>{t('referendumCount')}</h3>
				<div className='flex flex-col gap-2'>
					<Skeleton className='h-8 w-full' />
					<Skeleton className='h-8 w-full' />
					<Skeleton className='h-8 w-full' />
				</div>
			</div>
		);
	}

	return (
		<div className='flex flex-col gap-4 rounded-lg border border-border_grey p-4'>
			<h3 className='text-blue-light-high dark:text-blue-dark-high text-base font-semibold'>{t('referendumCount')}</h3>
			<div className='flex flex-col items-center justify-center gap-10 sm:flex-row sm:justify-around'>
				<PieChart
					data={chartData}
					className='h-[200px] w-full'
					center={[50, 50]}
					startAngle={0}
					lengthAngle={360}
					rounded
					paddingAngle={13}
					lineWidth={20}
				/>
				<div>
					{chartData.map((item) => (
						<div
							key={item.title}
							className='mb-2 flex w-full items-center justify-between text-xs sm:mr-10'
						>
							<div className='flex items-center gap-x-2'>
								<div
									className='h-2 w-2 rounded-full'
									style={{ background: item.color }}
								/>
								<p className='m-0 p-0'>{item.title}</p> - <p className='m-0 p-0'>{item.value}</p>
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}

export default AnalyticsReferendumCount;
