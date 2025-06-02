// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useTranslations } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { PieChart } from 'react-minimal-pie-chart';
import { Skeleton } from '@/app/_shared-components/Skeleton';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { ENetwork } from '@/_shared/types';

function AnalyticsReferendumOutcome() {
	const t = useTranslations('GovAnalytics');
	const network = getCurrentNetwork();
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

	const chartData = [
		{
			title: 'Approved',
			value: data?.data?.approved || 0,
			color: '#27d941'
		},
		{
			title: 'Rejected',
			value: data?.data?.rejected || 0,
			color: '#6800ff'
		},
		{
			title: 'Timeout',
			value: data?.data?.timeout || 0,
			color: '#ff0000'
		},
		{
			title: 'Ongoing',
			value: data?.data?.ongoing || 0,
			color: '#ff6000'
		},
		{
			title: 'Cancelled',
			value: data?.data?.cancelled || 0,
			color: '#fdcc4a'
		}
	];

	if (isLoading) {
		return (
			<div className='flex flex-col gap-4 rounded-lg border border-border_grey p-4'>
				<h3 className='text-blue-light-high dark:text-blue-dark-high text-base font-semibold'>{t('referendumOutcome')}</h3>
				<div className='flex h-[200px] items-center justify-center'>
					<Skeleton className='h-full w-full' />
				</div>
			</div>
		);
	}

	return (
		<div className='flex flex-col gap-4 rounded-lg border border-border_grey p-4'>
			<div className='flex items-center justify-between'>
				<h3 className='text-blue-light-high dark:text-blue-dark-high text-base font-semibold'>{t('referendumOutcome')}</h3>
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

export default AnalyticsReferendumOutcome;
