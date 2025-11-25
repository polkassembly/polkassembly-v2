// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import delegates from '@assets/delegation/delegates.svg';
import delegatees from '@assets/delegation/delegatees.svg';
import timer from '@assets/icons/timer.svg';
import Image from 'next/image';
import dayjs from 'dayjs';
import { IDVCohort, ECohortStatus } from '@/_shared/types';

interface CohortCardProps {
	cohort: IDVCohort;
}

function formatNumber(num: number): string {
	if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
	if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
	return num.toString();
}

function formatDate(date: Date): { date: string; time: string } {
	const d = dayjs(date);
	return { date: d.format("MMM D 'YY"), time: d.format('HH:mm:ss') };
}

function CohortCard({ cohort }: CohortCardProps) {
	const startDateTime = formatDate(cohort.startTime);
	const endDateTime = cohort.endTime ? formatDate(cohort.endTime) : null;
	const isOngoing = cohort.status === ECohortStatus.ONGOING;

	return (
		<div className='rounded-xxl my-4 w-full rounded-3xl border border-border_grey bg-bg_modal p-6'>
			<div className='grid grid-cols-1 gap-6 md:grid-cols-4'>
				<div className='flex items-start gap-4'>
					<Image
						src={delegatees}
						alt='Delegatees'
						className='h-10 w-10'
					/>
					<div>
						<p className='text-xs font-medium uppercase text-community_text'>TOTAL DAOS</p>
						<p className='text-2xl font-semibold text-text_primary'>{cohort.delegatesCount}</p>
						<p className='text-xs text-wallet_btn_text'>{formatNumber(cohort.delegationPerDelegate)} delegations each</p>
					</div>
				</div>

				{cohort.guardiansCount > 0 && (
					<div className='flex items-start gap-4'>
						<Image
							src={delegates}
							alt='Delegates'
							className='h-10 w-10'
						/>
						<div>
							<p className='text-xs font-medium uppercase text-community_text'>GUARDIANS</p>
							<p className='text-2xl font-semibold text-text_primary'>{cohort.guardiansCount}</p>
							<p className='text-xs text-wallet_btn_text'>{cohort.guardiansCount > 0 ? `${formatNumber(cohort.delegationPerGuardian)} delegations each` : 'N/A'}</p>
						</div>
					</div>
				)}

				<div className='flex items-start gap-4'>
					<Image
						src={timer}
						alt='Timer'
						className='h-10 w-10'
					/>
					<div>
						<p className='text-xs font-medium uppercase text-community_text'>START TIME</p>
						<p className='text-lg font-semibold text-text_primary'>
							{startDateTime.date} <span className='text-wallet_btn_text'>{startDateTime.time}</span>
						</p>
						<p className='text-xs text-wallet_btn_text'>#{cohort.startBlock.toLocaleString()}</p>
					</div>
				</div>

				{!isOngoing && endDateTime && (
					<div className='flex items-start gap-4'>
						<Image
							src={timer}
							alt='Timer'
							className='h-10 w-10'
						/>
						<div>
							<p className='text-xs font-medium uppercase text-community_text'>END TIME</p>
							<p className='whitespace-nowrap text-lg font-semibold text-text_primary'>
								{endDateTime.date} <span className='text-wallet_btn_text'>{endDateTime.time}</span>
							</p>
							<p className='text-xs text-wallet_btn_text'>#{cohort.endBlock?.toLocaleString()}</p>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}

export default CohortCard;
