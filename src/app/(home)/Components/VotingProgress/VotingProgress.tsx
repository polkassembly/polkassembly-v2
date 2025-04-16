// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@ui/Tooltip';
import { IPost, IPostListing } from '@/_shared/types';
import { Progress } from '@/app/_shared-components/Progress/Progress';
import styles from './VotingProgress.module.scss';
import VotingMetrics from '../VotingMetrics/VotingMetrics';

interface VotingProgressProps {
	timeRemaining: { days: number; hours: number; minutes: number } | null;
	decisionPeriodPercentage: number;
	formattedTime: string;
	ayePercent: number;
	nayPercent: number;
	postData: IPostListing | IPost;
}

function VotingProgress({ timeRemaining, decisionPeriodPercentage, formattedTime, ayePercent, nayPercent, postData }: VotingProgressProps) {
	return (
		<div className='hidden items-center gap-2 sm:flex'>
			{timeRemaining && (
				<Tooltip>
					<TooltipTrigger asChild>
						<div className='flex items-center gap-1'>
							<div className='w-8'>
								<Progress
									value={decisionPeriodPercentage}
									className='h-1.5 bg-decision_bar_bg'
								/>
							</div>
						</div>
					</TooltipTrigger>
					<TooltipContent
						side='top'
						align='center'
					>
						<div className={styles.timeBarContainer}>
							<p>{formattedTime}</p>
						</div>
					</TooltipContent>
				</Tooltip>
			)}
			{ayePercent > 0 && nayPercent > 0 && (
				<VotingMetrics
					postData={postData}
					ayePercent={ayePercent}
					nayPercent={nayPercent}
				/>
			)}
		</div>
	);
}

export default VotingProgress;
