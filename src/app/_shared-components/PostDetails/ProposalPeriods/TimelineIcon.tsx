// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Check } from 'lucide-react';
import classes from './ProposalPeriods.module.scss';

interface TimelineIconProps {
	isActive: boolean;
	isCompleted: boolean;
}

export function TimelineIcon({ isActive, isCompleted }: TimelineIconProps) {
	if (isActive) {
		// Breathing animation for active period
		return (
			<div className={classes.pulseOuter}>
				<div className={classes.pulseInner} />
			</div>
		);
	}

	if (isCompleted) {
		// Completed period with checkmark
		return (
			<div className={classes.periodCompleted}>
				<Check
					className='text-white'
					size={18}
				/>
			</div>
		);
	}

	// Inactive period
	return (
		<div className={classes.periodInactive}>
			<div className={classes.periodInactiveInner} />
		</div>
	);
}
