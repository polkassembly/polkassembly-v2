// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { EPostOrigin } from '@/_shared/types';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { Separator } from '@/app/_shared-components/Separator';
import { Skeleton } from '@/app/_shared-components/Skeleton';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import ProposalsCreated from '@assets/icons/proposals-created.svg';
import ActiveProposals from '@assets/icons/active-proposals.svg';
import { ArrowUp } from 'lucide-react';
import { useTranslations } from 'next-intl';

function TrackStats({ origin }: { origin?: EPostOrigin }) {
	const t = useTranslations('TrackAnalytics');

	const fetchStats = async () => {
		const { data, error } = await NextApiClientService.getTrackAnalyticsStats({ origin: origin || 'all' });
		if (error || !data) {
			console.error(error?.message || 'Failed to fetch data');
			return null;
		}

		return data;
	};

	const { data, isFetching } = useQuery({
		queryKey: ['track-analytics-stats', origin],
		queryFn: fetchStats,
		retry: false,
		refetchOnMount: false,
		refetchOnWindowFocus: false
	});

	return (
		<div className='flex w-full flex-col gap-12 sm:flex-row sm:items-center'>
			<div className='flex items-start gap-x-2'>
				<Image
					src={ProposalsCreated}
					alt='Proposals Created'
					width={70}
					height={70}
					className='h-[70px] w-[70px]'
				/>
				<div className='flex flex-col gap-y-1'>
					<p className='text-xs text-wallet_btn_text'>{t('proposalsCreated')}</p>
					{isFetching ? <Skeleton className='h-4 w-20' /> : <p className='text-lg font-semibold text-text_primary'>{data?.totalProposalCount}</p>}
				</div>
			</div>
			<Separator
				className='hidden h-20 sm:block'
				orientation='vertical'
			/>
			<Separator className='w-full sm:hidden' />
			<div className='flex items-start gap-x-2'>
				<Image
					src={ActiveProposals}
					alt='Active Proposals'
					width={70}
					height={70}
					className='h-[70px] w-[70px]'
				/>
				<div className='flex flex-col'>
					<p className='text-xs text-wallet_btn_text'>{t('activeProposals')}</p>
					{isFetching ? <Skeleton className='mb-1 h-4 w-20' /> : <p className='text-lg font-semibold text-text_primary'>{data?.totalActiveProposals}</p>}
					{isFetching ? (
						<Skeleton className='h-2 w-16' />
					) : (
						<div className='flex items-center gap-x-[2px] text-xs'>
							<ArrowUp className='text-success' />
							<span className='font-medium text-success'>{data?.changeInActiveProposals?.toFixed(0)}%</span>
							<span className='text-wallet_btn_text'>{t('thisWeek')}</span>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

export default TrackStats;
