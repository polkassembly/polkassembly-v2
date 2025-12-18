// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import Link from 'next/link';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { Separator } from '@/app/_shared-components/Separator';
import { IJob, EProposalType, EProposalStatus, IPostListing } from '@/_shared/types';
import { Skeleton } from '@/app/_shared-components/Skeleton';
import dayjs from 'dayjs';
import { formatBnBalance } from '@/app/_client-utils/formatBnBalance';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { ValidatorService } from '@/_shared/_services/validator_service';
import { MarkdownViewer } from '@/app/_shared-components/MarkdownViewer/MarkdownViewer';
import { FIVE_MIN_IN_MILLI } from '@/app/api/_api-constants/timeConstants';

enum JobType {
	JOB = 'job',
	BOUNTY = 'bounty'
}

const SKELETON_IDS = ['skeleton-1', 'skeleton-2', 'skeleton-3'];

export default function JobsAndBounties() {
	const [activeTab, setActiveTab] = useState<JobType>(JobType.JOB);
	const t = useTranslations();
	const network = getCurrentNetwork();

	const { data: listingData, isLoading } = useQuery({
		queryKey: ['jobs-and-bounties', activeTab],
		queryFn: async () => {
			if (activeTab === JobType.BOUNTY) {
				const { data, error } = await NextApiClientService.fetchListingData({
					proposalType: EProposalType.BOUNTY,
					page: 1,
					limit: 10,
					statuses: [EProposalStatus.Active, EProposalStatus.Extended]
				});
				if (error || !data) throw new Error(error?.message || 'Failed to fetch bounties');
				return { items: data.items, type: JobType.BOUNTY };
			}

			const { data, error } = await NextApiClientService.getExternalJobs({
				page: 1,
				limit: 10,
				sortBy: 'createdAt'
			});
			if (error || !data) throw new Error(error?.message || 'Failed to fetch jobs');
			return { items: data?.data?.job?.data || [], type: JobType.JOB };
		},
		staleTime: FIVE_MIN_IN_MILLI
	});

	const items = listingData?.items || [];
	const isBountyTab = activeTab === JobType.BOUNTY;

	return (
		<div className='flex h-full w-full flex-col rounded-xl border border-border_grey bg-bg_modal p-6 shadow-sm'>
			<div className='mb-6 flex items-center justify-between'>
				<h2 className='text-xl font-semibold text-text_primary'>{t('JobsAndBounties.title')}</h2>
			</div>

			<div className='mb-6 flex w-full rounded-md bg-sidebar_footer p-1'>
				<button
					type='button'
					onClick={() => setActiveTab(JobType.JOB)}
					className={`flex-1 rounded-sm py-1.5 text-sm font-medium transition-all ${activeTab === JobType.JOB ? 'bg-section_dark_overlay text-navbar_border shadow-sm' : 'text-sidebar_text'}`}
				>
					{t('JobsAndBounties.jobsTab')}
				</button>
				<button
					type='button'
					onClick={() => setActiveTab(JobType.BOUNTY)}
					className={`flex-1 rounded-sm py-1.5 text-sm font-medium transition-all ${activeTab === JobType.BOUNTY ? 'bg-section_dark_overlay text-navbar_border shadow-sm' : 'text-sidebar_text'}`}
				>
					{t('JobsAndBounties.bountiesTab')}
				</button>
			</div>

			<div className='flex max-h-[500px] flex-1 flex-col gap-4 overflow-y-auto'>
				{isLoading
					? SKELETON_IDS.map((id) => (
							<div
								key={id}
								className='rounded-xl border border-border_grey p-4'
							>
								<div className='flex items-start gap-3'>
									<Skeleton className='h-10 w-10 shrink-0 rounded' />
									<div className='flex flex-col gap-1'>
										<Skeleton className='h-3 w-24' />
										<Skeleton className='h-4 w-40' />
									</div>
								</div>
								<Skeleton className='mt-4 h-4 w-full' />
								<Skeleton className='mt-2 h-3 w-1/2' />
								<Separator className='my-2' />
								<div className='mt-3 flex items-center justify-between'>
									<div className='flex gap-2'>
										<Skeleton className='h-5 w-16 rounded-full' />
										<Skeleton className='h-5 w-16 rounded-full' />
									</div>
									<Skeleton className='h-4 w-20' />
								</div>
							</div>
						))
					: items.map((item: IJob | IPostListing) => {
							if (isBountyTab) {
								const bounty = item as IPostListing;
								const formattedReward = bounty.onChainInfo?.reward
									? formatBnBalance(bounty.onChainInfo.reward, { withUnit: true, numberAfterComma: 2, compactNotation: true }, network)
									: '';

								return (
									<Link
										key={bounty.index}
										href={`/bounty/${bounty.index}`}
										target='_blank'
										className='hover:bg-section_light rounded-xl border border-border_grey p-4'
									>
										<div className='flex flex-col gap-0.5'>
											<p className='text-xs font-medium leading-none text-wallet_btn_text'>
												{t('PostDetails.ProposalType.bounty')} #{bounty.index}
											</p>
											<h3 className='line-clamp-1 text-base font-semibold text-text_primary'>{bounty.title}</h3>
										</div>
										<MarkdownViewer
											className='mt-1.5 line-clamp-2'
											markdown={bounty.content}
										/>
										<Separator className='my-2' />
										<div className='mt-2 flex items-center justify-between'>
											<span className='text-xs text-wallet_btn_text'>
												{t('PostDetails.OnchainInfo.createdAt')}: {dayjs(bounty.createdAt).format('DD MMM YYYY')}
											</span>
											{formattedReward && (
												<span className='text-xs font-medium text-text_pink'>
													{t('PostDetails.OnchainInfo.reward')}: {formattedReward}
												</span>
											)}
										</div>
									</Link>
								);
							}

							const job = item as IJob;
							const tags = [job.employment_type, job.work_arrangement, job.salary_type].filter(Boolean);
							return (
								<div
									key={`${job.company_name}-${job.title}`}
									className='rounded-xl border border-border_grey p-4'
								>
									<div className='flex items-start gap-2'>
										{job.logo ? (
											<Image
												src={job.logo}
												alt={`${job.company_name} logo`}
												className='h-10 w-10 shrink-0 rounded bg-black object-contain'
												width={40}
												height={40}
												unoptimized
											/>
										) : (
											<div className='flex h-10 w-10 shrink-0 items-center justify-center rounded bg-black'>
												<span className='font-bold text-btn_primary_text'>{job.company_name?.[0] || 'C'}</span>
											</div>
										)}
										<div>
											<p className='text-xs font-medium leading-none text-wallet_btn_text'>{job.company_name}</p>
											<h3 className='text-base font-semibold text-text_primary'>{job.title}</h3>
										</div>
									</div>
									<p className='mt-1.5 truncate text-sm text-wallet_btn_text'>{job.description}</p>
									<p className='mt-1 text-xs text-wallet_btn_text'>
										{job.salary_range?.min && job.salary_range?.max ? (
											<>
												{t('JobsAndBounties.salary')}: {job.salary_range.min} - {job.salary_range.max} {job.salary_token} |{' '}
											</>
										) : null}
										{t('JobsAndBounties.applicants')}: {job.applicantCount}
									</p>{' '}
									<Separator className='my-2' />
									<div className='mt-4 flex flex-col items-center justify-between md:flex-row'>
										<div className='flex gap-2'>
											{tags.slice(0, 2).map((tag: string) => (
												<span
													key={tag}
													className='rounded-full border border-border_grey px-1 py-0.5 text-xs text-wallet_btn_text'
												>
													{tag}
												</span>
											))}
											{tags.length > 2 && <span className='rounded-full border border-border_grey px-1 py-0.5 text-xs text-wallet_btn_text'>+{tags.length - 2}</span>}
										</div>
										{job.company_website && ValidatorService.isUrl(job.company_website) && (
											<a
												href={job.company_website}
												target='_blank'
												rel='noopener noreferrer'
												className='mt-3 h-auto p-0 text-sm font-medium text-text_pink hover:underline md:mt-0'
											>
												{t('JobsAndBounties.applyNow')}
											</a>
										)}
									</div>
								</div>
							);
						})}
				{!isLoading && items.length === 0 && (
					<div className='text-center text-sm text-sidebar_text'>{isBountyTab ? t('JobsAndBounties.noBountiesFound') : t('JobsAndBounties.noJobsFound')}</div>
				)}
			</div>
		</div>
	);
}
