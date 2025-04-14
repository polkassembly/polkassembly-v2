// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import { Progress } from '@/app/_shared-components/Progress/Progress';
import { EPeriodType, EPostOrigin } from '@/_shared/types';
import { calculatePeriodProgress } from '@/app/_client-utils/calculatePeriodProgress';
import { Info } from 'lucide-react';
import { useTranslations } from 'next-intl';
import PeriodProgressLabel from './PeriodProgressLabel';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../Tooltip';

interface Props {
	periodEndsAt?: Date;
	periodName: string;
	periodType: EPeriodType;
	trackName: EPostOrigin;
}

function PeriodProgress({ periodEndsAt, periodName, trackName, periodType }: Props) {
	const t = useTranslations('PostDetails');
	const progress = calculatePeriodProgress({ endAt: periodEndsAt, trackName, periodType });

	const getTooltipText = (type: EPeriodType) => {
		switch (type) {
			case EPeriodType.DECISION:
				return t('decisionPeriodInfo');
			case EPeriodType.CONFIRM:
				return t('confirmPeriodInfo');
			case EPeriodType.ENACTMENT:
				return t('enactmentPeriodInfo');
			default:
				return null;
		}
	};

	const tooltipText = getTooltipText(periodType);

	return (
		<div className='flex flex-col gap-y-2'>
			<Progress
				className='bg-progress_pink_bg'
				indicatorClassName='bg-bg_pink'
				value={progress}
			/>
			<div className='flex items-center justify-between text-sm text-text_primary'>
				<div className='flex items-center justify-between gap-x-1'>
					<span>{periodName}</span>
					{tooltipText && (
						<TooltipProvider>
							<Tooltip>
								<TooltipTrigger>
									<Info className='text-text-grey h-[14px] w-[14px]' />
								</TooltipTrigger>
								<TooltipContent className='max-w-48 bg-tooltip_background p-2 text-white'>
									<p>{tooltipText}</p>
								</TooltipContent>
							</Tooltip>
						</TooltipProvider>
					)}
				</div>
				<span className='text-xs text-basic_text'>
					<PeriodProgressLabel
						endAt={periodEndsAt}
						trackName={trackName}
						periodType={periodType}
					/>
				</span>
			</div>
		</div>
	);
}

export default PeriodProgress;
