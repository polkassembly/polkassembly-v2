// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { EReactQueryKeys } from '@/_shared/types';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { STALE_TIME } from '@/_shared/_constants/listingLimit';
import { ExternalLink } from 'lucide-react';
import OGLogo from '@assets/icons/og.png';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { ValidatorService } from '@/_shared/_services/validator_service';
import { Skeleton } from '../../Skeleton';

interface OGTrackerInfoProps {
	refNum: string;
	trackName?: string;
}

const getOGTrackerTrackName = (trackName?: string): string => {
	if (!trackName) return '';
	switch (trackName) {
		case 'Root':
			return 'root';
		case 'Whitelisted Caller':
			return 'whitelistedCaller';
		case 'Staking Admin':
			return 'stakingAdmin';
		case 'Treasurer':
			return 'treasurer';
		case 'Lease Admin':
			return 'leaseAdmin';
		case 'Fellowship Admin':
			return 'fellowshipAdmin';
		case 'General Admin':
			return 'generalAdmin';
		case 'Auction Admin':
			return 'auctionAdmin';
		case 'Referendum Killer':
			return 'referendumKiller';
		case 'Referendum Canceller':
			return 'referendumCanceller';
		case 'Big Tipper':
			return 'bigTipper';
		case 'Big Spender':
			return 'bigSpender';
		case 'Medium Spender':
			return 'mediumSpender';
		case 'Small Spender':
			return 'smallSpender';
		case 'Small Tipper':
			return 'smallTipper';
		default:
			return trackName.replace(/ ([a-zA-Z])/g, (g) => g[1].toUpperCase()).replace(/^./, (g) => g.toLowerCase());
	}
};

function OGTrackerInfo({ refNum, trackName }: OGTrackerInfoProps) {
	const t = useTranslations();
	const { data, isLoading, error } = useQuery({
		queryKey: [EReactQueryKeys.OGTRACKER_DATA, refNum],
		queryFn: async () => {
			const { data: ogData, error: ogError } = await NextApiClientService.getOGTrackerData({ refNum });

			if (ogError || !ogData) {
				throw new Error(ogError?.message || 'Failed to fetch OGTracker data');
			}

			return ogData;
		},
		enabled: !!refNum,
		retry: 1,
		staleTime: STALE_TIME
	});

	if (isLoading) {
		return (
			<div className='flex flex-col gap-4 rounded-lg border border-border_grey bg-bg_modal p-4'>
				<Skeleton className='h-6 w-40' />
				<Skeleton className='h-4 w-full' />
				<Skeleton className='h-4 w-3/4' />
				<Skeleton className='h-20 w-full' />
			</div>
		);
	}

	if (error || !data) {
		return null;
	}

	const { tasks, proofOfWork } = data;

	if ((!tasks || tasks.length === 0) && (!proofOfWork || proofOfWork.length === 0)) {
		return null;
	}

	const formattedTrackName = getOGTrackerTrackName(trackName);
	const ogTrackerUrl = formattedTrackName ? `https://app.ogtracker.io/${formattedTrackName}/${refNum}` : `https://ogtracker.io/proposal/${refNum}`;

	const deliveredTasksCount = tasks?.filter((task) => task.status === 'A').length || 0;
	const totalTasksCount = tasks?.length || 0;

	return (
		<div className='flex max-h-[300px] flex-col overflow-hidden rounded-xl border border-border_grey bg-bg_modal shadow-sm'>
			<div className='sticky top-0 z-10 flex items-center justify-between border-b border-border_grey bg-bg_modal/95 px-4 py-3 backdrop-blur-sm'>
				<div className='flex items-center gap-2'>
					<Image
						src={OGLogo}
						alt='OGTracker'
						width={20}
						height={20}
						className='rounded-full'
					/>
					<h3 className='text-sm font-semibold text-text_primary'>{t('PostDetails.OGTracker.heading')}</h3>
				</div>
				<a
					href={ogTrackerUrl}
					target='_blank'
					rel='noopener noreferrer'
					className='text-pink_primary hover:text-pink_secondary flex items-center gap-1 text-xs font-medium transition-colors hover:underline'
				>
					{t('PostDetails.OGTracker.viewOnApp')}
					<ExternalLink className='h-3 w-3' />
				</a>
			</div>
			<div className='custom-scroll flex flex-col gap-4 overflow-y-auto p-4'>
				{tasks && tasks.length > 0 && (
					<div className='flex flex-col gap-2.5'>
						<div className='flex items-center justify-between'>
							<div className='text-text_secondary text-xs font-medium uppercase tracking-wide'>{t('PostDetails.OGTracker.tasks')}</div>
							<span className='bg-bg_secondary text-text_secondary rounded-full px-2 py-0.5 text-xs font-medium'>
								{t('PostDetails.OGTracker.tasksDelivered', {
									delivered: deliveredTasksCount,
									total: totalTasksCount
								})}
							</span>
						</div>
						<div className='flex flex-col gap-2'>
							{tasks.map((task, index) => {
								const statusMap: Record<string, string> = {
									A: t('PostDetails.OGTracker.status.Delivered'),
									B: t('PostDetails.OGTracker.status.InProgress'),
									C: t('PostDetails.OGTracker.status.Flagged'),
									D: t('PostDetails.OGTracker.status.Remodel')
								};
								const statusLabel = statusMap[task.status] || task.status;
								const getStatusColor = (status: string) => {
									if (status === t('PostDetails.OGTracker.status.Delivered')) return 'text-green-500 bg-green-500/10 border-green-500/20';
									if (status === t('PostDetails.OGTracker.status.InProgress')) return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
									if (status === t('PostDetails.OGTracker.status.Flagged')) return 'text-red-500 bg-red-500/10 border-red-500/20';
									return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
								};

								return (
									<div
										key={task.id || index}
										className='bg-bg_secondary hover:bg-bg_tertiary group flex flex-col gap-2 rounded-lg border border-border_grey p-3 transition-all'
									>
										<div className='text-sm font-medium leading-snug text-text_primary'>{task.title}</div>
										{statusLabel && (
											<div className='flex items-center gap-2'>
												<span className={cn('rounded-md border px-2 py-0.5 text-xs font-medium', getStatusColor(statusLabel))}>{statusLabel}</span>
											</div>
										)}
									</div>
								);
							})}
						</div>
					</div>
				)}

				{proofOfWork && proofOfWork.length > 0 && (
					<div className='flex flex-col gap-2.5'>
						<div className='flex items-center justify-between'>
							<div className='text-xs font-medium uppercase tracking-wide text-text_primary'>{t('PostDetails.OGTracker.proofOfWork')}</div>
							<span className='bg-bg_secondary rounded-full px-2 py-0.5 text-xs font-medium text-text_primary'>{proofOfWork.length}</span>
						</div>
						<div className='flex flex-col gap-2'>
							{proofOfWork.map((pow) =>
								ValidatorService.isUrl(pow.content) ? (
									<a
										key={pow.id}
										href={pow.content}
										target='_blank'
										rel='noopener noreferrer'
										className='bg-bg_secondary hover:border-pink_primary/50 hover:bg-bg_tertiary group flex items-center justify-between gap-3 rounded-lg border border-border_grey p-3 transition-all'
									>
										<div className='flex min-w-0 flex-1 flex-col gap-0.5'>
											<div className='text-pink_primary truncate text-sm font-medium group-hover:underline'>{pow.content}</div>
											{pow.task_id && <div className='text-[10px] text-text_primary'>{t('PostDetails.OGTracker.linkedToTask')}</div>}
										</div>
										<ExternalLink className='group-hover:text-pink_primary h-3.5 w-3.5 flex-shrink-0 text-wallet_btn_text transition-colors' />
									</a>
								) : (
									<div
										key={pow.id}
										className='bg-bg_secondary flex items-center justify-between gap-3 rounded-lg border border-border_grey p-3'
									>
										<div className='flex min-w-0 flex-1 flex-col gap-0.5'>
											<div className='truncate text-sm font-medium text-text_primary'>{pow.content}</div>
											{pow.task_id && <div className='text-[10px] text-text_primary'>{t('PostDetails.OGTracker.linkedToTask')}</div>}
										</div>
									</div>
								)
							)}
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
export default OGTrackerInfo;
