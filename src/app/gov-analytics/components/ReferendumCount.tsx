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
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';

interface IReferendumCount {
	[key: string]: number;
}

function ReferendumCount() {
	const t = useTranslations('GovAnalytics');
	const network = getCurrentNetwork();

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

	const chartData = Object.entries(trackInfo).map(([key, value], index) => ({
		color: `hsl(${index * 30}, 70%, 50%)`,
		id: key.split('_').join(' '),
		label: key
			.split('_')
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
			.join(' '),
		value
	}));

	// Split chart data into three sections
	const firstRowData = chartData.slice(0, 6);
	const secondRowData = chartData.slice(6, 11);
	const thirdRowData = chartData.slice(11);

	const renderLegendRow = (items: typeof chartData) => (
		<div className='flex w-full flex-wrap gap-x-4 gap-y-2'>
			{items.map((item) => (
				<div
					key={item.id}
					className='flex items-center text-xs'
				>
					<div
						className='mr-2 h-2 w-2 rounded-full'
						style={{ background: item.color }}
					/>
					<p className='m-0 p-0'>
						{item.label} [{item.value}]: {((item.value / (data?.totalProposals ?? 0)) * 100).toFixed(2)}%
					</p>
				</div>
			))}
		</div>
	);

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
			<div className='flex flex-col items-center justify-center gap-x-10 sm:flex-row sm:justify-around'>
				<PieChart
					data={chartData}
					className='mx-10 my-5 h-[200px] w-full'
					center={[50, 50]}
					startAngle={0}
					lengthAngle={360}
					rounded
					paddingAngle={13}
					lineWidth={20}
				/>
				{renderLegendRow(firstRowData)}
				{renderLegendRow(secondRowData)}
				{renderLegendRow(thirdRowData)}
			</div>
		</div>
	);
}

export default ReferendumCount;
