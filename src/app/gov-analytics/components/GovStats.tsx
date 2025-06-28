// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { ENetwork } from '@/_shared/types';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { Separator } from '@/app/_shared-components/Separator';
import { Skeleton } from '@/app/_shared-components/Skeleton';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import ProposalsCreated from '@assets/icons/proposals-created.svg';
import ActiveProposals from '@assets/icons/active-proposals.svg';
import ApprovedProposals from '@assets/icons/approved-proposals.svg';
import { useTranslations } from 'next-intl';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';

function GovStats() {
	const t = useTranslations('GovAnalytics');
	const network = getCurrentNetwork();

	const trackInfo = NETWORKS_DETAILS[network as ENetwork].trackDetails;

	const fetchStats = async () => {
		const response = await NextApiClientService.getGovAnalyticsStats();
		if (!response) {
			console.error('Failed to fetch data');
			return null;
		}

		return response;
	};

	const { data, isFetching } = useQuery({
		queryKey: ['gov-analytics-stats'],
		queryFn: fetchStats,
		retry: false,
		refetchOnMount: false,
		refetchOnWindowFocus: false
	});

	return (
		<div className='flex w-full flex-col gap-12 sm:flex-row sm:items-center sm:justify-between'>
			<div className='flex items-center gap-x-2'>
				<Image
					src={ProposalsCreated}
					alt='Proposals Created'
					width={70}
					height={70}
					className='h-[70px] w-[70px]'
				/>
				<div className='flex flex-col gap-y-1'>
					<p className='text-xs text-wallet_btn_text'>{t('totalProposals')}</p>
					{isFetching ? <Skeleton className='h-4 w-20' /> : <p className='text-lg font-semibold text-text_primary'>{data?.data?.totalProposals}</p>}
				</div>
			</div>
			<Separator
				className='hidden h-20 sm:block'
				orientation='vertical'
			/>
			<Separator className='w-full sm:hidden' />
			<div className='flex items-center gap-x-2'>
				<Image
					src={ApprovedProposals}
					alt='Active Proposals'
					width={70}
					height={70}
					className='h-[70px] w-[70px]'
				/>
				<div className='flex flex-col'>
					<p className='text-xs text-wallet_btn_text'>{t('approvedProposals')}</p>
					{isFetching ? <Skeleton className='mb-1 h-4 w-20' /> : <p className='text-lg font-semibold text-text_primary'>{data?.data?.approvedProposals}</p>}
				</div>
			</div>
			<Separator
				className='hidden h-20 sm:block'
				orientation='vertical'
			/>
			<Separator className='w-full sm:hidden' />
			<div className='flex items-center gap-x-2'>
				<Image
					src={ActiveProposals}
					alt='Active Proposals'
					width={70}
					height={70}
					className='h-[70px] w-[70px]'
				/>
				<div className='flex flex-col'>
					<p className='text-xs text-wallet_btn_text'>{t('monitoredTracks')}</p>
					{isFetching ? <Skeleton className='mb-1 h-4 w-20' /> : <p className='text-lg font-semibold text-text_primary'>{Object.keys(trackInfo).length}</p>}
				</div>
			</div>
		</div>
	);
}
export default GovStats;
