// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import classes from './Stats.module.scss';

const TOTAL_SEGMENTS = 60;
const progress = 62.5; // Example: 62.5% progress
function calculateFilledSegments(progress: number): number {
	const clampedProgress = Math.max(0, Math.min(100, progress));
	return Math.floor((clampedProgress * TOTAL_SEGMENTS) / 100);
}

function CoretimeMigration() {
	const percentageFilled = calculateFilledSegments(progress);

	return (
		<div className='flex flex-1 flex-col rounded-xl border border-border_grey bg-bg_modal p-4'>
			<h3 className='text-base font-semibold uppercase'>Agile Coretime Migration</h3>
			<span className='mb-3 text-sm font-semibold text-basic_text'>Migration Progress</span>
			<div className='mb-1 mt-auto flex items-center justify-between gap-10'>
				<p className='flex items-center text-sm font-semibold text-[#96A4B6]'>
					<span className='text-text_primary'>15</span>/24 Parachains
				</p>
				<p className='text-xs font-medium text-basic_text'>62.5% complete | 9 parachains still on legacy auctions</p>
			</div>
			<div className={classes.progressSection}>
				<div className={classes.progressBars}>
					{Array.from({ length: TOTAL_SEGMENTS }, (_, index) => (
						<div
							key={index}
							className={`${classes.progressBar} ${index < percentageFilled ? classes.filled : classes.empty}`}
						/>
					))}
				</div>
			</div>
		</div>
	);
}

export default CoretimeMigration;
