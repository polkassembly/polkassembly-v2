// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import { calculateDecisionProgress } from '@/app/_client-utils/calculateDecisionProgress';
import { Progress } from '../../Progress';

function PeriodProgress({ periodEndsAt, periodName }: { periodEndsAt?: Date; periodName: string }) {
	return (
		<div className='flex flex-col gap-y-2'>
			<Progress
				className='bg-progress_pink_bg'
				indicatorClassName='bg-bg_pink'
				value={calculateDecisionProgress(periodEndsAt || '')}
			/>
			<p className='text-sm text-text_primary'>{periodName}</p>
		</div>
	);
}

export default PeriodProgress;
