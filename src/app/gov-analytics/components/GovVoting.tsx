// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { Separator } from '@/app/_shared-components/Separator';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import { ChevronDown } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/app/_shared-components/Collapsible';
import TimeLineIcon from '@assets/icons/timeline.svg';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { Skeleton } from '@/app/_shared-components/Skeleton';
import { useTranslations } from 'next-intl';
import { getTrackNameFromId } from '@/_shared/_utils/getTrackNameFromId';
import { IGovAnalyticsDelegationStats } from '@/_shared/types';
import DelegationCapitalDetails from './DelegationCapitalDetails';
import DelegationDetails from './DelegationDetails';

interface IDelegationInfo {
	[key: string]: IGovAnalyticsDelegationStats;
}

function GovVoting() {
	const t = useTranslations('GovAnalytics');
	const network = getCurrentNetwork();

	const fetchDelegations = async () => {
		const { data, error } = await NextApiClientService.getTrackDelegationAnalyticsStats();
		if (error || !data) {
			console.error(error?.message || 'Failed to fetch data');
			return null;
		}

		// data processing
		const updatedTrackInfo: IDelegationInfo = {};

		if (data) {
			Object.entries(data).forEach(([key, value]) => {
				const { totalCapital, totalDelegates, totalDelegators, totalVotesBalance } = value;
				const trackName = getTrackNameFromId({ trackId: parseInt(key, 10), network });

				if (trackName) {
					updatedTrackInfo[trackName] = {
						totalCapital,
						totalDelegates,
						totalDelegators,
						totalVotesBalance
					};
				}
			});
		}

		return updatedTrackInfo;
	};

	const { data, isFetching } = useQuery({
		queryKey: ['track-analytics-delegations'],
		queryFn: fetchDelegations,
		retry: false,
		refetchOnMount: false,
		refetchOnWindowFocus: false
	});

	return (
		<Collapsible className='rounded-lg border border-border_grey'>
			<CollapsibleTrigger className='flex w-full items-center gap-x-4 p-3 lg:p-4'>
				<Image
					src={TimeLineIcon}
					alt='Delegation Green Icon'
					width={24}
					height={24}
					className='h-6 w-6'
				/>
				<p className='text-base font-semibold text-text_primary'>{t('voting')}</p>
				<div className='flex-1' />
				<ChevronDown className='text-lg font-semibold text-text_primary' />
			</CollapsibleTrigger>
			<CollapsibleContent>
				<Separator className='my-0' />
				<div className='flex flex-col gap-y-4 p-3 lg:p-4'>
					<div className='flex flex-col gap-y-4'>
						{isFetching ? (
							<>
								<Skeleton className='h-8 w-full' />
								<Skeleton className='h-8 w-full' />
								<Skeleton className='h-8 w-full' />
							</>
						) : (
							<>
								<DelegationCapitalDetails delegationData={data || {}} />
								<DelegationDetails delegationData={data || {}} />
							</>
						)}
					</div>
				</div>
			</CollapsibleContent>
		</Collapsible>
	);
}

export default GovVoting;
