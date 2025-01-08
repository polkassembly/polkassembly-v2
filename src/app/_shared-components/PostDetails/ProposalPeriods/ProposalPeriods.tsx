// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import { dayjs } from '@shared/_utils/dayjsInit';
import { calculateDecisionProgress } from '@/app/_client-utils/calculateDecisionProgress';
import { EProposalStatus } from '@/_shared/types';
import { Progress } from '../../progress';

function ProposalPeriods({
	confirmationPeriodEndsAt,
	decisionPeriodEndsAt,
	preparePeriodEndsAt,
	status
}: {
	confirmationPeriodEndsAt?: Date;
	decisionPeriodEndsAt?: Date;
	preparePeriodEndsAt?: Date;
	status?: EProposalStatus;
}) {
	const preparePeriodEnded = preparePeriodEndsAt ? dayjs(preparePeriodEndsAt).isBefore(dayjs()) : false;
	const decisionPeriodEnded = decisionPeriodEndsAt ? dayjs(decisionPeriodEndsAt).isBefore(dayjs()) : false;
	const confirmationPeriodEnded = confirmationPeriodEndsAt ? dayjs(confirmationPeriodEndsAt).isBefore(dayjs()) : false;

	const periodsEnded = [preparePeriodEnded, decisionPeriodEnded, confirmationPeriodEnded].filter((period) => period);

	return (
		<div className='flex flex-col gap-y-8 rounded-xl bg-bg_modal p-6 shadow-lg'>
			<div className='flex items-center justify-between'>
				<p className='text-xl font-semibold text-text_primary'>
					{confirmationPeriodEnded
						? status === EProposalStatus.Passed || EProposalStatus.Executed
							? 'Proposal Passed'
							: 'Proposal Failed'
						: decisionPeriodEnded
							? 'Confirmation Period'
							: preparePeriodEnded
								? 'Voting has Started'
								: 'Prepare Period'}
				</p>
				<div className='flex items-center rounded-xl bg-primary_border/[0.2] text-xs text-wallet_btn_text'>
					<p className='h-6 w-6 rounded-full bg-bg_pink p-1 text-center text-white'>{periodsEnded.length + 1 > 3 ? 3 : periodsEnded.length + 1}</p>
					<span className='pl-1 pr-2'>of 3</span>
				</div>
			</div>
			{confirmationPeriodEnded ? null : preparePeriodEnded ? (
				<div className='flex flex-col gap-y-6'>
					<div className='flex flex-col gap-y-2'>
						<Progress
							className='bg-progress_pink_bg'
							indicatorClassName='bg-bg_pink'
							value={calculateDecisionProgress(decisionPeriodEndsAt || '')}
						/>
						<p className='text-sm text-text_primary'>Decision Period</p>
					</div>
					<div className='flex flex-col gap-y-2'>
						<Progress
							className='bg-progress_pink_bg'
							indicatorClassName='bg-bg_pink'
							value={calculateDecisionProgress(confirmationPeriodEndsAt || '')}
						/>
						<p className='text-sm text-text_primary'>Confirmation Period</p>
					</div>
				</div>
			) : (
				<div className='flex flex-col gap-y-2'>
					<Progress
						className='bg-progress_pink_bg'
						indicatorClassName='bg-bg_pink'
						value={calculateDecisionProgress(preparePeriodEndsAt || '')}
					/>
					<p className='text-sm text-text_primary'>Prepare Period</p>
				</div>
			)}
		</div>
	);
}

export default ProposalPeriods;
