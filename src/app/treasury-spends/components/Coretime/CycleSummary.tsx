// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import classes from './Coretime.module.scss';

const TOTAL_SEGMENTS = 30;
const progress = 70; // Example: 50% progress
function calculateFilledSegments(progress: number): number {
	const clampedProgress = Math.max(0, Math.min(100, progress));
	return Math.floor((clampedProgress * TOTAL_SEGMENTS) / 100);
}

function CycleSummary() {
	const percentageFilled = calculateFilledSegments(progress);

	return (
		<div className='flex justify-between gap-10 pl-2 pr-10'>
			<div className='flex flex-col gap-1'>
				<span className='mb-2 text-sm text-basic_text'>CURRENT PRICE</span>
				<p className='text-xl font-semibold text-text_primary'>~ 1.34k DOT</p>
				<p className='text-sm text-basic_text'>
					Floor Price <span className='font-semibold text-text_primary'>10 DOT</span>
				</p>
				<p className='text-sm text-basic_text'>
					Revenue <span className='font-semibold text-text_primary'>~ 950 DOT</span>
				</p>
				<ul className='list-inside list-disc pl-2 text-sm text-basic_text'>
					<li>
						Renewal <span className='font-semibold text-text_primary'>~ 950 DOT</span>
					</li>
					<li>
						Purchase <span className='font-semibold text-text_primary'>~ 950 DOT</span>
					</li>
				</ul>
			</div>
			<div className='flex flex-col gap-1'>
				<span className='mb-2 text-sm text-basic_text'>AVAILABLE CORES</span>
				<p className='text-xl font-semibold text-text_primary'>49/65</p>
				<p className='text-sm text-basic_text'>
					Sold <span className='font-semibold text-text_primary'>16</span>
				</p>
				<ul className='list-inside list-disc pl-2 text-sm text-basic_text'>
					<li>
						Renewal <span className='font-semibold text-text_primary'>~ 950 DOT</span>
					</li>
					<li>
						Purchase <span className='font-semibold text-text_primary'>~ 950 DOT</span>
					</li>
				</ul>
			</div>
			<div className='flex flex-col gap-1'>
				<span className='mb-2 text-sm text-basic_text'>CURRENT PHASE</span>
				<p className='text-xl font-semibold text-text_primary'>Interlude</p>
				<p className='text-sm text-basic_text'>
					Ends in <span className='font-semibold text-text_primary'>2d 15hrs</span>
				</p>
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
			<div className='flex flex-col gap-1'>
				<span className='mb-2 text-sm text-basic_text'>TOTAL PERIOD</span>
				<p className='text-xl font-semibold text-text_primary'>22d 20hrs</p>
				<p className='text-sm text-basic_text'>/27d 5hrs</p>
				<p className='text-sm text-basic_text'>
					Starts at <span className='font-semibold text-text_primary'>2025-09-19</span>
				</p>
				<p className='text-sm text-basic_text'>
					Ends at <span className='font-semibold text-text_primary'>2025-09-19</span>
				</p>
			</div>
		</div>
	);
}

export default CycleSummary;
