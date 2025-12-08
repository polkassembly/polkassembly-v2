// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { EReactQueryKeys } from '@/_shared/types';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { STALE_TIME } from '@/_shared/_constants/listingLimit';
import { Skeleton } from '../../Skeleton';

interface OGTrackerInfoProps {
	refNum: string;
}

function OGTrackerInfo({ refNum }: OGTrackerInfoProps) {
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

	const { proposal, tasks, proofOfWork } = data;

	return (
		<div className='flex flex-col gap-4 rounded-lg border border-border_grey bg-bg_modal p-4'>
			<div className='flex items-center justify-between border-b border-border_grey pb-3'>
				<h3 className='text-lg font-semibold text-text_primary'>OGTracker Information</h3>
				<a
					href={`https://ogtracker.io/proposal/${refNum}`}
					target='_blank'
					rel='noopener noreferrer'
					className='text-pink_primary text-sm hover:underline'
				>
					View on OGTracker →
				</a>
			</div>

			{proposal && (
				<div className='flex flex-col gap-2'>
					<div className='text-text_secondary text-sm font-medium'>Proposal Status</div>
					<div className='text-base text-text_primary'>{proposal.status || 'Active'}</div>
				</div>
			)}

			{tasks && tasks.length > 0 && (
				<div className='flex flex-col gap-3'>
					<div className='text-text_secondary text-sm font-medium'>Tasks ({tasks.length})</div>
					<div className='flex flex-col gap-2'>
						{tasks.map((task, index) => {
							const statusMap: Record<string, string> = {
								A: 'Delivered',
								B: 'In Progress',
								C: 'Flagged',
								D: 'Remodel'
							};
							const statusLabel = statusMap[task.status] || task.status;
							return (
								<div
									key={task.id || index}
									className='bg-bg_secondary flex items-start gap-2 rounded-md border border-border_grey p-3'
								>
									<div className='flex-1'>
										<div className='text-sm font-medium text-text_primary'>{task.title}</div>
										{statusLabel && (
											<div className='text-text_secondary mt-1 text-xs'>
												Status: <span className={cn('font-medium', statusLabel === 'Delivered' ? 'text-green-500' : 'text-orange-500')}>{statusLabel}</span>
											</div>
										)}
									</div>
								</div>
							);
						})}
					</div>
				</div>
			)}

			{proofOfWork && proofOfWork.length > 0 && (
				<div className='flex flex-col gap-3'>
					<div className='text-text_secondary text-sm font-medium'>Proof of Work ({proofOfWork.length})</div>
					<div className='flex flex-col gap-2'>
						{proofOfWork.map((pow, index) => (
							<a
								key={pow.id || index}
								href={pow.content}
								target='_blank'
								rel='noopener noreferrer'
								className='bg-bg_secondary hover:bg-bg_tertiary flex items-center gap-2 rounded-md border border-border_grey p-3 transition-colors'
							>
								<div className='flex-1'>
									<div className='text-pink_primary text-sm hover:underline'>{pow.content}</div>
									{pow.task_id && <div className='text-text_secondary mt-1 text-xs'>Linked to task</div>}
								</div>
								<svg
									className='text-text_secondary h-4 w-4'
									fill='none'
									stroke='currentColor'
									viewBox='0 0 24 24'
								>
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										strokeWidth={2}
										d='M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14'
									/>
								</svg>
							</a>
						))}
					</div>
				</div>
			)}

			{(!tasks || tasks.length === 0) && (!proofOfWork || proofOfWork.length === 0) && (
				<div className='text-text_secondary py-6 text-center text-sm'>No tasks or proof of work found for this proposal on OGTracker</div>
			)}
		</div>
	);
}

export default OGTrackerInfo;
