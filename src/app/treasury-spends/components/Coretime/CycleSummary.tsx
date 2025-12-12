// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import classes from './Coretime.module.scss';
import { CoretimeCycle } from './mockCycles';

const TOTAL_SEGMENTS = 30;
function calculateFilledSegments(progress: number): number {
	const clampedProgress = Math.max(0, Math.min(100, progress));
	return Math.floor((clampedProgress * TOTAL_SEGMENTS) / 100);
}

function CycleSummary({ cycle }: { cycle: CoretimeCycle }) {
	const percentageFilled = calculateFilledSegments(cycle.progressPercent);

	return (
		<div className='flex justify-between gap-10 pl-2 pr-10'>
			<div className='flex flex-col gap-1'>
				<span className='mb-2 text-sm text-basic_text'>CURRENT PRICE</span>
				<p className='text-xl font-semibold text-text_primary'>{cycle.currentPrice}</p>
				<p className='text-sm text-basic_text'>
					Floor Price <span className='font-semibold text-text_primary'>{cycle.floorPrice}</span>
				</p>
				<p className='text-sm text-basic_text'>
					Revenue <span className='font-semibold text-text_primary'>{cycle.revenue}</span>
				</p>
				<ul className='list-inside list-disc pl-2 text-sm text-basic_text'>
					<li>
						Renewal <span className='font-semibold text-text_primary'>{cycle.renewal}</span>
					</li>
					<li>
						Purchase <span className='font-semibold text-text_primary'>{cycle.purchase}</span>
					</li>
				</ul>
			</div>
			<div className='flex flex-col gap-1'>
				<span className='mb-2 text-sm text-basic_text'>AVAILABLE CORES</span>
				<p className='text-xl font-semibold text-text_primary'>
					{cycle.availableCores}/{cycle.totalCores}
				</p>
				<p className='text-sm text-basic_text'>
					Sold <span className='font-semibold text-text_primary'>{cycle.sold}</span>
				</p>
				<ul className='list-inside list-disc pl-2 text-sm text-basic_text'>
					<li>
						Renewal <span className='font-semibold text-text_primary'>{cycle.renewal}</span>
					</li>
					<li>
						Purchase <span className='font-semibold text-text_primary'>{cycle.purchase}</span>
					</li>
				</ul>
			</div>
			<div className='flex flex-col gap-1'>
				<span className='mb-2 text-sm text-basic_text'>CURRENT PHASE</span>
				<p className='text-xl font-semibold text-text_primary'>{cycle.currentPhase}</p>
				<p className='text-sm text-basic_text'>
					Ends in <span className='font-semibold text-text_primary'>{cycle.endsIn}</span>
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
				<p className='text-xl font-semibold text-text_primary'>{cycle.totalPeriod}</p>
				<p className='text-sm text-basic_text'>{cycle.fullPeriod}</p>
				<p className='text-sm text-basic_text'>
					Starts at <span className='font-semibold text-text_primary'>{cycle.startsAt}</span>
				</p>
				<p className='text-sm text-basic_text'>
					Ends at <span className='font-semibold text-text_primary'>{cycle.endsAt}</span>
				</p>
			</div>
		</div>
	);
}

export default CycleSummary;
