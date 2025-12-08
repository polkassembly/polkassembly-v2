// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useState } from 'react';
import { Button } from '@/app/_shared-components/Button';
import { useTranslations } from 'next-intl';
import { MdSort } from '@react-icons/all-files/md/MdSort';
import { FaFilter } from '@react-icons/all-files/fa/FaFilter';
import { Separator } from '@/app/_shared-components/Separator';

enum JobType {
	JOB = 'job',
	BOUNTY = 'bounty'
}

const JOBS = [
	{
		company: 'Parity Technologies',
		title: 'Infrastructure Security Engineer',
		description: 'This is a crucial role where your understanding of...',
		salary: '0 - 15,000 DOT',
		applicants: 1,
		tags: ['full-time', 'monthly', 'remote'],
		type: 'job'
	},
	{
		company: 'Parity Technologies',
		title: 'Core Developer',
		description: 'As a Core Developer within the Runtime function yo...',
		salary: '0 - 15,000 DOT',
		applicants: 2,
		tags: ['contract', 'monthly', 'remote'],
		type: 'job'
	}
];

export default function JobsAndBounties() {
	const [activeTab, setActiveTab] = useState<JobType>(JobType.JOB);
	const t = useTranslations();

	return (
		<div className='flex w-full flex-col rounded-xl border border-border_grey bg-bg_modal p-6 shadow-sm'>
			<div className='mb-6 flex items-center justify-between'>
				<h2 className='text-xl font-semibold text-text_primary'>{t('JobsAndBounties.title')}</h2>
				<div className='flex gap-2'>
					<button
						type='button'
						className='rounded border border-border_grey p-1'
					>
						<FaFilter className='text-sm text-text_primary' />
					</button>
					<button
						type='button'
						className='rounded border border-border_grey p-1'
					>
						<MdSort className='text-xl text-text_primary' />
					</button>
				</div>
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

			<div className='flex max-h-[400px] flex-col gap-4 overflow-y-auto'>
				{JOBS.filter((job) => job.type === activeTab).map((job) => (
					<div
						key={job.title}
						className='rounded-xl border border-border_grey p-4'
					>
						<div className='flex items-start gap-3'>
							<div className='flex h-10 w-10 shrink-0 items-center justify-center rounded bg-black'>
								<span className='font-bold text-btn_primary_text'>P</span>
							</div>
							<div>
								<p className='text-xs font-medium text-wallet_btn_text'>{job.company}</p>
								<h3 className='text-base font-semibold text-text_primary'>{job.title}</h3>
							</div>
						</div>

						<p className='mt-2 truncate text-sm text-wallet_btn_text'>{job.description}</p>
						<p className='mt-1 text-xs text-wallet_btn_text'>
							{t('JobsAndBounties.salary')}: {job.salary} | {t('JobsAndBounties.applicants')}: {job.applicants}
						</p>
						<Separator className='my-2' />
						<div className='mt-4 flex flex-col items-center justify-between md:flex-row'>
							<div className='flex gap-2'>
								{job.tags.slice(0, 2).map((tag) => (
									<span
										key={tag}
										className='rounded-full border border-border_grey px-3 py-1 text-xs text-wallet_btn_text'
									>
										{tag}
									</span>
								))}
								{job.tags.length > 2 && <span className='rounded-full border border-border_grey px-3 py-1 text-xs text-wallet_btn_text'>+{job.tags.length - 2}</span>}
							</div>
							<Button
								variant='link'
								className='mt-3 h-auto p-0 text-text_pink md:mt-0'
							>
								{t('JobsAndBounties.applyNow')}
							</Button>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
