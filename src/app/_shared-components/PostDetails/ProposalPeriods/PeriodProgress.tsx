// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { EPeriodType, EPostOrigin } from '@shared/types';
import { calculatePeriodProgress } from '@/app/_client-utils/calculatePeriodProgress';
import { getPeriodProgressLabel } from '@/app/_client-utils/getPeriodProgressLabel';
import classes from './ProposalPeriods.module.scss';

interface PeriodProgressProps {
	periodEndsAt?: Date;
	periodName?: string;
	periodType: EPeriodType;
	trackName: EPostOrigin;
}

const TOTAL_SEGMENTS = 30;
function calculateFilledSegments(progress: number): number {
	const clampedProgress = Math.max(0, Math.min(100, progress));
	return Math.floor((clampedProgress * TOTAL_SEGMENTS) / 100);
}

export function PeriodProgress({ periodEndsAt, trackName, periodType, periodName }: PeriodProgressProps) {
	const progress = calculatePeriodProgress({ endAt: periodEndsAt, trackName, periodType });
	const label = getPeriodProgressLabel({ endAt: periodEndsAt, trackName, periodType });
	const percentageFilled = calculateFilledSegments(progress);

	return (
		<div className={classes.progressSection}>
			<div className={classes.progressBars}>
				{Array.from({ length: TOTAL_SEGMENTS }, (_, index) => (
					<div
						key={index}
						className={`${classes.progressBar} ${index < percentageFilled ? classes.filled : classes.empty}`}
					/>
				))}
			</div>
			{periodName && (
				<div className={classes.progressLabel}>
					<p>{periodName}</p>
					<p>{label}</p>
				</div>
			)}
		</div>
	);
}
