// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useTranslations } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { Skeleton } from '@/app/_shared-components/Skeleton';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, TooltipItem } from 'chart.js';
import { useTheme } from 'next-themes';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

interface ICategoryCounts {
	governance: number | null;
	main: number | null;
	treasury: number | null;
	whiteList: number | null;
}

function AnalyticsReferendumCount() {
	const t = useTranslations('GovAnalytics');
	const network = getCurrentNetwork();
	const { theme } = useTheme();

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

	const chartLabels = ['Governance', 'Main', 'Treasury', 'Whitelist'];
	const chartValues = [categoryCounts.governance ?? 0, categoryCounts.main ?? 0, categoryCounts.treasury ?? 0, categoryCounts.whiteList ?? 0];
	const chartColors = ['#dcc359', '#384d6c', '#da6087', '#e18d57'];

	const chartData = {
		labels: chartLabels,
		datasets: [
			{
				data: chartValues,
				backgroundColor: chartColors,
				borderColor: theme === 'dark' ? '#000000' : '#ffffff',
				borderWidth: 2, // Add spacing between segments
				hoverBackgroundColor: chartColors.map((color) => {
					// Slightly brighten colors on hover
					const hex = color.replace('#', '');
					const r = Math.min(255, parseInt(hex.substr(0, 2), 16) + 20);
					const g = Math.min(255, parseInt(hex.substr(2, 2), 16) + 20);
					const b = Math.min(255, parseInt(hex.substr(4, 2), 16) + 20);
					return `rgb(${r}, ${g}, ${b})`;
				}),
				hoverBorderColor: '#ffffff',
				hoverBorderWidth: 3,
				borderRadius: 8, // Rounded edges for segments
				borderSkipped: false // Ensure all borders are rounded
			}
		]
	};

	const chartOptions = {
		responsive: true,
		maintainAspectRatio: false,
		cutout: '75%', // Thin arc width
		plugins: {
			legend: {
				display: false // We'll use our custom legend
			},
			tooltip: {
				callbacks: {
					label: (tooltipItem: TooltipItem<'doughnut'>) => {
						const value = tooltipItem.raw as number;
						return `${value} proposals`;
					}
				},
				backgroundColor: 'rgba(0, 0, 0, 0.8)',
				titleColor: 'white',
				bodyColor: 'white',
				borderColor: 'rgba(255, 255, 255, 0.1)',
				borderWidth: 1,
				cornerRadius: 8,
				displayColors: true
			}
		},
		animation: {
			animateRotate: true,
			animateScale: false
		}
	};

	const legendData = chartLabels.map((label, index) => ({
		title: label,
		value: chartValues[index],
		color: chartColors[index]
	}));

	if (isLoading) {
		return (
			<div className='flex flex-col gap-4 rounded-lg border border-border_grey p-4'>
				<h3 className='text-blue-light-high dark:text-blue-dark-high text-base font-semibold'>{t('referendumCountByCategory')}</h3>
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
			<h3 className='text-blue-light-high dark:text-blue-dark-high text-base font-semibold'>{t('referendumCountByCategory')}</h3>
			<div className='flex flex-col items-center justify-center gap-10 xl:flex-row xl:justify-around'>
				<div className='h-[200px] w-full max-w-[400px]'>
					<Doughnut
						data={chartData}
						options={chartOptions}
					/>
				</div>
				<div>
					{legendData.map((item) => (
						<div
							key={item.title}
							className='mb-2 flex w-full items-center justify-between text-xs lg:mr-10'
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
