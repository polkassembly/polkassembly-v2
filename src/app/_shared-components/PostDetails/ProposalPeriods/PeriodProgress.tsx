// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import { Progress } from '@/app/_shared-components/Progress/Progress';
import { EPeriodType, EPostOrigin } from '@/_shared/types';
import { getPeriodProgressLabel } from '@/app/_client-utils/getPeriodProgressLabel';
import { calculatePeriodProgress } from '@/app/_client-utils/calculatePeriodProgress';
import { useTranslations } from 'next-intl';

interface Props {
	periodEndsAt?: Date;
	periodName: string;
	periodType: EPeriodType;
	trackName: EPostOrigin;
}

function PeriodProgress({ periodEndsAt, periodName, trackName, periodType }: Props) {
	const t = useTranslations('timeUnits');

	const progress = calculatePeriodProgress({ endAt: periodEndsAt, trackName, periodType });
	const label = getPeriodProgressLabel({
		endAt: periodEndsAt,
		trackName,
		periodType,
		minutes: t('minutes'),
		hours: t('hours'),
		days: t('days')
	});

	return (
		<div className='flex flex-col gap-y-2'>
			<Progress
				className='bg-progress_pink_bg'
				indicatorClassName='bg-bg_pink'
				value={progress}
			/>
			<div className='flex items-center justify-between text-sm text-text_primary'>
				<span>{periodName}</span>
				<span className='text-xs text-basic_text'>{label}</span>
			</div>
		</div>
	);
}

export default PeriodProgress;
