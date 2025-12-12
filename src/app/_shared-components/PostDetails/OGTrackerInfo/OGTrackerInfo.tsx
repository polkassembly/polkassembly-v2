// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { EReactQueryKeys } from '@/_shared/types';
import { useQuery } from '@tanstack/react-query';
import { STALE_TIME } from '@/_shared/_constants/listingLimit';
import { ExternalLink } from 'lucide-react';
import OGLogo from '@assets/icons/og.png';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { getOGTrackerTrackName } from '@/app/_client-utils/getOGTrackerTrackName';
import { Skeleton } from '../../Skeleton';
import { Button } from '../../Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../Dialog/Dialog';
import TaskItem from './TaskItem';
import PoWItem from './PoWItem';

interface OGTrackerInfoProps {
	refNum: string;
	trackName?: string;
}

const MAX_VISIBLE_ITEMS = 2;

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

	const viewOnAppKey = 'PostDetails.OGTracker.viewOnApp';

	return (
		<div className='flex max-h-[325px] flex-col overflow-hidden rounded-xl border border-border_grey bg-bg_modal shadow-sm'>
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
					className='flex items-center gap-1 text-xs font-medium text-text_pink transition-colors hover:underline'
				>
					{t(viewOnAppKey)}
					<ExternalLink className='h-3 w-3' />
				</a>
			</div>
			<div className='flex flex-col p-4'>
				{tasks && tasks.length > 0 && (
					<div className='flex flex-col gap-2.5'>
						<div className='flex items-center justify-between'>
							<div className='text-xs font-medium uppercase tracking-wide text-wallet_btn_text'>{t('PostDetails.OGTracker.tasks')}</div>
							<span className='bg-bg_secondary rounded-full px-2 py-0.5 text-xs font-medium text-wallet_btn_text'>
								{t('PostDetails.OGTracker.tasksDelivered', {
									delivered: deliveredTasksCount,
									total: totalTasksCount
								})}
							</span>
						</div>
						<div className='custom-scroll flex flex-col gap-2 overflow-y-auto'>
							{tasks.slice(0, MAX_VISIBLE_ITEMS).map((task) => (
								<TaskItem
									key={task.id}
									task={task}
								/>
							))}
							{tasks.length > MAX_VISIBLE_ITEMS && (
								<Dialog>
									<DialogTrigger asChild>
										<Button
											variant='ghost'
											className='flex w-full items-center justify-start p-0 text-xs font-medium text-text_pink'
										>
											{t('PostDetails.BeneficiariesDetails.showMore')}
										</Button>
									</DialogTrigger>
									<DialogContent className='max-w-max px-4 pb-4 pt-3 md:min-w-[400px]'>
										<DialogHeader className='flex flex-row items-center justify-between gap-4'>
											<DialogTitle className='text-text_primary'>{t('PostDetails.OGTracker.tasks')}</DialogTitle>
											<a
												href={ogTrackerUrl}
												target='_blank'
												rel='noopener noreferrer'
												className='flex items-center gap-1 pr-7 text-xs font-medium text-text_pink transition-colors hover:underline'
											>
												{t(viewOnAppKey)}
												<ExternalLink className='h-3 w-3' />
											</a>
										</DialogHeader>
										<div className='flex max-h-[400px] flex-col gap-4 overflow-y-auto pr-2'>
											{tasks.map((task) => (
												<TaskItem
													key={task.id}
													task={task}
												/>
											))}
										</div>
									</DialogContent>
								</Dialog>
							)}
						</div>
					</div>
				)}

				{proofOfWork && proofOfWork.length > 0 && (
					<div className='flex flex-col gap-2.5'>
						<div className='flex items-center justify-between'>
							<div className='text-xs font-medium uppercase tracking-wide text-text_primary'>{t('PostDetails.OGTracker.proofOfWork')}</div>
							<span className='bg-bg_secondary rounded-full px-2 py-0.5 text-xs font-medium text-text_primary'>{proofOfWork.length}</span>
						</div>
						<div className='custom-scroll flex flex-col gap-2 overflow-y-auto'>
							{proofOfWork.slice(0, MAX_VISIBLE_ITEMS).map((pow) => (
								<PoWItem
									key={pow.id}
									pow={pow}
								/>
							))}
							{proofOfWork.length > MAX_VISIBLE_ITEMS && (
								<Dialog>
									<DialogTrigger asChild>
										<Button
											variant='ghost'
											className='flex w-full items-center justify-start p-0 text-xs font-medium text-text_pink'
										>
											{t('PostDetails.BeneficiariesDetails.showMore')}
										</Button>
									</DialogTrigger>
									<DialogContent className='max-w-max px-4 pb-4 pt-3 md:min-w-[400px]'>
										<DialogHeader className='flex flex-row items-center justify-between gap-4'>
											<DialogTitle className='text-text_primary'>{t('PostDetails.OGTracker.proofOfWork')}</DialogTitle>
											<a
												href={ogTrackerUrl}
												target='_blank'
												rel='noopener noreferrer'
												className='flex items-center gap-1 pr-7 text-xs font-medium text-text_pink transition-colors hover:underline'
											>
												{t(viewOnAppKey)}
												<ExternalLink className='h-3 w-3' />
											</a>
										</DialogHeader>
										<div className='flex max-h-[400px] flex-col gap-4 overflow-y-auto pr-2'>
											{proofOfWork.map((pow) => (
												<PoWItem
													key={pow.id}
													pow={pow}
												/>
											))}
										</div>
									</DialogContent>
								</Dialog>
							)}
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
export default OGTrackerInfo;
