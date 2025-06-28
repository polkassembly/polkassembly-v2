// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import { useTheme } from 'next-themes';
import { BN } from '@polkadot/util';
import { IGovAnalyticsDelegationStats } from '@/_shared/types';
import { formatBnBalance } from '@/app/_client-utils/formatBnBalance';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { formatUSDWithUnits } from '@/app/_client-utils/formatUSDWithUnits';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ChartOptions } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ZERO = new BN(0);

interface IDelegationCapitalDetails {
	[key: string]: IGovAnalyticsDelegationStats;
}

function DelegationCapitalDetails({ delegationData }: { delegationData: IDelegationCapitalDetails }) {
	const network = getCurrentNetwork();
	const { resolvedTheme: theme } = useTheme();

	const bnToIntBalance = (bnValue: string | number | BN): number => {
		const bn = BN.isBN(bnValue) ? bnValue : new BN(bnValue && bnValue.toString());
		return Number(formatBnBalance(bn, { numberAfterComma: 6, withThousandDelimitor: false }, network));
	};

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
				label: 'Votes',
				data: Object.keys(delegationData || {}).map((key) => bnToIntBalance(delegationData[key].totalVotesBalance || ZERO) || 0),
				backgroundColor: '#B6B0FB'
			},
			{
				label: 'Capital',
				data: Object.keys(delegationData || {}).map((key) => bnToIntBalance(delegationData[key].totalCapital || ZERO) || 0),
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
						<p className='m-0 p-0 text-xs font-normal'>Votes</p>
					</div>
					<div className='flex items-center gap-x-1'>
						<div className='h-[5px] w-[5px] rounded-full bg-bar_chart_purple' />
						<p className='m-0 p-0 text-xs font-normal'>Capital</p>
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

export default DelegationCapitalDetails;
