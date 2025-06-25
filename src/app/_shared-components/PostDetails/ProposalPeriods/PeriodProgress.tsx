// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import { EPeriodType, EPostOrigin } from '@/_shared/types';
import { getPeriodProgressLabel } from '@/app/_client-utils/getPeriodProgressLabel';
import { calculatePeriodProgress } from '@/app/_client-utils/calculatePeriodProgress';

interface Props {
	periodEndsAt?: Date;
	periodName: string;
	periodType: EPeriodType;
	trackName: EPostOrigin;
}

const TOTAL_SEGMENTS = 30;
function calculatePercentage(progress: number) {
	return Math.floor((progress * TOTAL_SEGMENTS) / 100);
}
function PeriodProgress({ periodEndsAt, periodName, trackName, periodType }: Props) {
	const progress = calculatePeriodProgress({ endAt: periodEndsAt, trackName, periodType });
	const label = getPeriodProgressLabel({ endAt: periodEndsAt, trackName, periodType });
	const percentage = calculatePercentage(progress);

	return (
		<div className='flex w-full flex-col gap-y-2'>
			{/* Vertical segments representing actual time units */}
			<div className='flex w-full gap-x-1'>
				{Array.from({ length: TOTAL_SEGMENTS }, (_, index) => (
					<div
						key={index}
						className={`h-5 w-full rounded-sm ${index < percentage ? 'bg-bg_pink' : 'bg-border_grey'}`}
					/>
				))}
			</div>

			<div className='flex justify-between text-sm text-text_primary'>
				<p>{periodName}</p>
				<p>{label}</p>
			</div>
		</div>
	);
}

export default PeriodProgress;
