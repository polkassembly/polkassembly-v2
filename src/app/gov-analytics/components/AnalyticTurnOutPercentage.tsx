// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useTranslations } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { Skeleton } from '@/app/_shared-components/Skeleton';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip } from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip);

function AnalyticTurnOutPercentage() {
	const t = useTranslations('GovAnalytics');
	const network = getCurrentNetwork();

	const { data, isLoading } = useQuery({
		queryKey: ['gov-analytics-turnout-percentage', network],
		queryFn: async () => {
			const response = await NextApiClientService.getGovAnalyticsTurnoutPercentage();
			return response.data;
		}
	});

	console.log('data', data);

	const chartData = {
		labels: Object.keys(data?.averageSupportPercentages || {}),
		datasets: [
			{
				label: 'Turnout Percentage',
				data: Object.values(data?.averageSupportPercentages || {}),
				fill: false,
				borderColor: 'rgba(151, 143, 237, 1)',
				tension: 0.1
			}
		]
	};

	if (isLoading) {
		return (
			<div className='flex flex-col gap-4 rounded-lg border border-border_grey p-4'>
				<h3 className='text-blue-light-high dark:text-blue-dark-high text-base font-semibold'>{t('averageTurnoutPercentage')}</h3>
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
			<h3 className='text-blue-light-high dark:text-blue-dark-high text-base font-semibold'>{t('averageTurnoutPercentage')}</h3>
			<div className='flex flex-col gap-2'>
				<Line
					data={chartData}
					options={{
						responsive: true,
						maintainAspectRatio: false,
						plugins: {
							legend: {
								display: false
							}
						},
						elements: {
							line: {
								tension: 0.2,
								borderWidth: 2,
								borderJoinStyle: 'round',
								cubicInterpolationMode: 'monotone'
							},
							point: {
								borderWidth: 2,
								backgroundColor: 'transparent',
								radius: 4.5,
								hitRadius: 8,
								hoverRadius: 8
							}
						},
						scales: {
							x: {
								display: false,
								grid: {
									display: false
								}
							},
							y: {
								grid: {
									display: false
								},
								border: {
									display: false
								},
								ticks: {
									padding: 0,
									maxTicksLimit: 6,
									font: {
										size: 10,
										weight: 500
									},
									callback: (value: string | number) => `${value}%`
								}
							}
						}
					}}
					height={100}
				/>
			</div>
		</div>
	);
}

export default AnalyticTurnOutPercentage;
