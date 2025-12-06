// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import classes from './Stats.module.scss';

const TOTAL_SEGMENTS = 60;
const progress = 50; // Example: 50% progress
function calculateFilledSegments(progress: number): number {
	const clampedProgress = Math.max(0, Math.min(100, progress));
	return Math.floor((clampedProgress * TOTAL_SEGMENTS) / 100);
}

function CoretimeProcurementMethods() {
	const percentageFilled = calculateFilledSegments(progress);

	return (
		<div className='flex flex-1 flex-col rounded-xl border border-border_grey bg-bg_modal p-4'>
			<h3 className='text-base font-semibold uppercase'>Procurement Methods</h3>
			<div className='mb-1 mt-2 flex items-center justify-between gap-10'>
				<p className='flex items-center text-xs font-medium text-basic_text'>Bulk Coretime</p>
				<p className='text-sm font-semibold text-text_primary'>85%</p>
			</div>
			<div className={classes.progressSection}>
				<div className={classes.progressBars}>
					{Array.from({ length: TOTAL_SEGMENTS }, (_, index) => (
						<div
							key={index}
							className={`${classes.progressBarSmall} ${index < percentageFilled ? classes.filled : classes.empty}`}
						/>
					))}
				</div>
			</div>

			<div className='mb-1 mt-2 flex items-center justify-between gap-10'>
				<p className='flex items-center text-xs font-medium text-basic_text'>Instantaneous</p>
				<p className='text-sm font-semibold text-text_primary'>15%</p>
			</div>
			<div className={classes.progressSection}>
				<div className={classes.progressBars}>
					{Array.from({ length: TOTAL_SEGMENTS }, (_, index) => (
						<div
							key={index}
							className={`${classes.progressBarSmall} ${index < percentageFilled ? classes.filled : classes.empty}`}
						/>
					))}
				</div>
			</div>
		</div>
	);
}

export default CoretimeProcurementMethods;
