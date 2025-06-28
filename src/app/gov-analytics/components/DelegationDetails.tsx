// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import { useTheme } from 'next-themes';
import { IGovAnalyticsDelegationStats } from '@/_shared/types';
import { formatUSDWithUnits } from '@/app/_client-utils/formatUSDWithUnits';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ChartOptions } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface IDelegationCapitalDetails {
	[key: string]: IGovAnalyticsDelegationStats;
}

function DelegationDetails({ delegationData }: { delegationData: IDelegationCapitalDetails }) {
	const { resolvedTheme: theme } = useTheme();

	const trackNames = Object.keys(delegationData || {}).map((key) =>
		key
			.split(' ')
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(' ')
	);

	const data = {
		labels: trackNames,
		datasets: [
			{
				label: 'Delegator',
				data: Object.keys(delegationData || {}).map((key) => delegationData[key].totalDelegators || 0),
				backgroundColor: '#B6B0FB'
			},
			{
				label: 'Delegatee',
				data: Object.keys(delegationData || {}).map((key) => delegationData[key].totalDelegates || 0),
				backgroundColor: '#796EEC'
			}
		]
	};

	const options: ChartOptions<'bar'> = {
		responsive: true,
		maintainAspectRatio: false,
		backgroundColor: 'transparent',
		plugins: {
			legend: {
				display: false
			},
			tooltip: {
				callbacks: {
					label: (context) => {
						const value = context.raw as number;
						const formattedValue = new Intl.NumberFormat('en-US', {
							maximumFractionDigits: 0,
							useGrouping: false
						}).format(value);
						return `${formatUSDWithUnits(formattedValue, 1)} ${context.dataset.label}`;
					}
				},
				borderWidth: 0
			}
		},
		scales: {
			x: {
				grid: {
					display: false
				},
				stacked: true
			},
			y: {
				grid: {
					display: true,
					color: theme === 'dark' ? '#333' : '#ddd'
				},
				border: {
					display: false
				},
				ticks: {
					display: false
				},
				stacked: true
			}
		},
		datasets: {
			bar: {
				barPercentage: 0.6,
				categoryPercentage: 0.6
			}
		}
	};

	return (
		<div className='max-h-[500px] w-full flex-1 rounded-lg border border-border_grey p-5'>
			<div className='flex items-center justify-between'>
				<h2 className='text-base font-semibold sm:text-xl'>Track Delegation</h2>
				<div className='flex gap-x-4'>
					<div className='flex items-center gap-x-1'>
						<div className='h-[5px] w-[5px] rounded-full bg-bar_chart_purple_light' />
						<p className='m-0 p-0 text-xs font-normal'>Delegator</p>
					</div>
					<div className='flex items-center gap-x-1'>
						<div className='h-[5px] w-[5px] rounded-full bg-bar_chart_purple' />
						<p className='m-0 p-0 text-xs font-normal'>Delegatee</p>
					</div>
				</div>
			</div>
			<div className='mt-8 flex h-[300px] justify-start'>
				<Bar
					data={data}
					options={options}
				/>
			</div>
		</div>
	);
}

export default DelegationDetails;
