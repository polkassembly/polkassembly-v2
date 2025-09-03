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
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { useTheme } from 'next-themes';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

interface IReferendumCount {
	[key: string]: number;
}

function LegendRow({ items, totalProposals }: { items: { label: string; value: number; color: string }[]; totalProposals: number }) {
	return (
		<div className='flex flex-wrap justify-between gap-x-10 gap-y-2 lg:w-full lg:gap-x-4'>
			{items.map(({ label, value, color }) => (
				<div
					key={`${label}`}
					className='flex items-center text-xs'
				>
					<div
						className='mr-2 h-2 w-2 rounded-full'
						style={{ background: color }}
					/>
					<p className='m-0 p-0'>
						{label} [{value}]: {totalProposals ? ((value / totalProposals) * 100).toFixed(2) : '0.00'}%
					</p>
				</div>
			))}
		</div>
	);
}

function ReferendumCount() {
	const t = useTranslations('GovAnalytics');
	const network = getCurrentNetwork();
	const { theme } = useTheme();
	const { data, isLoading } = useQuery({
		queryKey: ['gov-analytics-track-proposals', network],
		queryFn: async () => {
			const response = await NextApiClientService.getTrackLevelProposalsAnalytics();
			return response.data;
		}
	});

	const trackInfo: IReferendumCount = {};
	if (data?.data) {
		Object.entries(data.data).forEach(([key, value]) => {
			const trackId = parseInt(key, 10);
			const trackName = Object.entries(NETWORKS_DETAILS[network].trackDetails).find(([, details]) => details?.trackId === trackId)?.[1]?.name;
			if (trackName) {
				trackInfo[trackName] = value;
			}
		});
	}

	const chartLabels = Object.entries(trackInfo).map(([key]) =>
		key
			.split('_')
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
			.join(' ')
	);

	const chartValues = Object.values(trackInfo);

	const chartData = {
		labels: chartLabels,
		datasets: [
			{
				data: chartValues,
				backgroundColor: chartLabels.map((_, index) => `hsl(${index * 30}, 70%, 50%)`),
				borderColor: theme === 'dark' ? '#000000' : '#ffffff',
				borderWidth: 2, // Add spacing between segments
				hoverBackgroundColor: chartLabels.map((_, index) => `hsl(${index * 30}, 70%, 55%)`),
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
		cutout: '75%', // Increased cutout for thinner arc width
		plugins: {
			legend: {
				display: false // We'll use our custom legend
			},
			tooltip: {
				callbacks: {
					label: (tooltipItem: TooltipItem<'doughnut'>) => {
						const value = tooltipItem.raw as number;
						const total = (tooltipItem.dataset.data as number[]).reduce((sum: number, val: number) => sum + val, 0);
						const percentage = ((value / total) * 100).toFixed(2);
						return `${value} proposals [${percentage}%]`;
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

	// Split chart data into three sections for legend
	const legendData = chartLabels.map((label, index) => ({
		label,
		value: chartValues[index],
		color: `hsl(${index * 30}, 70%, 50%)`
	}));

	const firstRowData = legendData.slice(0, 6);
	const secondRowData = legendData.slice(6, 11);
	const thirdRowData = legendData.slice(11);

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
		<div className='flex flex-col gap-4 rounded-lg border border-border_grey p-3 lg:p-4'>
			<h3 className='text-blue-light-high dark:text-blue-dark-high text-base font-semibold'>{t('referendumCount')}</h3>
			<div className='flex flex-col items-center justify-center gap-x-10 xl:flex-row xl:justify-around'>
				<div className='mx-10 my-5 h-[200px] w-full max-w-[400px]'>
					<Doughnut
						data={chartData}
						options={chartOptions}
					/>
				</div>
				<div className='flex flex-col gap-x-10 lg:flex-row'>
					<div className='flex flex-col gap-y-2'>
						<LegendRow
							items={firstRowData}
							totalProposals={data?.totalProposals ?? 0}
						/>
					</div>
					<div className='flex flex-col gap-y-2'>
						<LegendRow
							items={secondRowData}
							totalProposals={data?.totalProposals ?? 0}
						/>
					</div>
					<div className='flex flex-col gap-y-2'>
						<LegendRow
							items={thirdRowData}
							totalProposals={data?.totalProposals ?? 0}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}

export default ReferendumCount;
