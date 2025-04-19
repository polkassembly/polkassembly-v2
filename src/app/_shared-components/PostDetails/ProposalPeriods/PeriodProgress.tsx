// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useState } from 'react';
import { Progress } from '@/app/_shared-components/Progress/Progress';
import { EPeriodType, EPostOrigin } from '@/_shared/types';
import { getPeriodProgressLabel } from '@/app/_client-utils/getPeriodProgressLabel';
import { calculatePeriodProgress } from '@/app/_client-utils/calculatePeriodProgress';
import { InfoIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../../Popover/Popover';

interface Props {
	periodEndsAt?: Date;
	periodName: string;
	periodType: EPeriodType;
	trackName: EPostOrigin;
	popoverContent?: string;
}

function PeriodProgress({ periodEndsAt, periodName, trackName, periodType, popoverContent }: Props) {
	const progress = calculatePeriodProgress({ endAt: periodEndsAt, trackName, periodType });
	const label = getPeriodProgressLabel({ endAt: periodEndsAt, trackName, periodType });
	const [isOpen, setIsOpen] = useState(false);

	return (
		<div className='flex flex-col gap-y-2'>
			<Progress
				className='bg-progress_pink_bg'
				indicatorClassName='bg-bg_pink'
				value={progress}
			/>
			<div className='flex justify-between text-sm text-text_primary'>
				<p className='flex items-center gap-x-1'>
					{periodName}{' '}
					{popoverContent && (
						<Popover
							open={isOpen}
							onOpenChange={setIsOpen}
						>
							<PopoverTrigger asChild>
								<InfoIcon
									className='h-4 w-4 cursor-pointer'
									onMouseEnter={() => setIsOpen(true)}
									onMouseLeave={() => setIsOpen(false)}
								/>
							</PopoverTrigger>
							<PopoverContent
								side='top'
								className='m-0 w-64 border-border_grey bg-bg_popover p-2'
								onMouseEnter={() => setIsOpen(true)}
								onMouseLeave={() => setIsOpen(false)}
							>
								<p className='text-sm text-btn_primary_text'>{popoverContent}</p>
							</PopoverContent>
						</Popover>
					)}
				</p>
				<p>{label}</p>
			</div>
		</div>
	);
}

export default PeriodProgress;
