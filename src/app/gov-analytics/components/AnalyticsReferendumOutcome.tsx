// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useTranslations } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, TooltipItem } from 'chart.js';
import { Skeleton } from '@/app/_shared-components/Skeleton';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { ENetwork } from '@/_shared/types';
import { useTheme } from 'next-themes';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

function AnalyticsReferendumOutcome() {
	const t = useTranslations('GovAnalytics');
	const network = getCurrentNetwork();
	const { theme } = useTheme();
	const [selectedTrack, setSelectedTrack] = useState<number | null>(null);
	const trackInfo = NETWORKS_DETAILS[network as ENetwork].trackDetails;
	const trackIds = Object.entries(trackInfo)
		.filter(([, value]) => !value?.fellowshipOrigin)
		.map(([, value]) => value.trackId);

	const { data, isLoading } = useQuery({
		queryKey: ['referendumOutcome', network, selectedTrack],
		queryFn: () => NextApiClientService.getGovAnalyticsReferendumOutcome({ trackNo: selectedTrack ? Number(selectedTrack) : undefined }),
		enabled: !!network
	});

	const chartLabels = ['Approved', 'Rejected', 'Timeout', 'Ongoing', 'Cancelled'];
	const chartValues = [data?.data?.approved || 0, data?.data?.rejected || 0, data?.data?.timeout || 0, data?.data?.ongoing || 0, data?.data?.cancelled || 0];
	const chartColors = ['#27d941', '#6800ff', '#ff0000', '#ff6000', '#fdcc4a'];

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
				<h3 className='text-blue-light-high dark:text-blue-dark-high text-base font-semibold'>{t('referendumCountByStatus')}</h3>
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
			<div className='flex flex-col items-start justify-between lg:flex-row lg:items-center'>
				<h3 className='text-blue-light-high dark:text-blue-dark-high text-base font-semibold'>{t('referendumCountByStatus')}</h3>
				<div className='relative'>
					<select
						className='appearance-none rounded-md border border-border_grey bg-transparent px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
						value={selectedTrack ?? ''}
						onChange={(e) => setSelectedTrack(e.target.value ? Number(e.target.value) : null)}
						aria-label='Select track'
					>
						<option value=''>All Tracks</option>
						{trackIds.map((trackId) => {
							const track = Object.values(trackInfo).find((t) => t.trackId === trackId);
							return (
								<option
									key={trackId}
									value={trackId}
								>
									{track?.name?.split('_').join(' ')}
								</option>
							);
						})}
					</select>
					<ChevronDown className='absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 transform text-lg font-semibold text-text_primary' />
				</div>
			</div>
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

export default AnalyticsReferendumOutcome;
