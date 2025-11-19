// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { memo } from 'react';

interface StepIndicatorProps {
	currentStep: number;
	totalSteps: number;
	isEditMode?: boolean;
}

function StepIndicator({ currentStep, totalSteps, isEditMode = false }: StepIndicatorProps) {
	if (isEditMode) {
		return null;
	}

	const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);

	return (
		<div className='flex items-center justify-center'>
			{steps.map((step, idx) => (
				<div
					key={step}
					className='flex items-center'
				>
					<span className={`h-2 w-2 rounded-full ${step <= currentStep ? 'bg-aye_color' : 'bg-border_grey'}`} />
					{idx !== steps.length - 1 && <div className={`mx-1 h-[2px] w-12 rounded sm:w-24 md:w-48 ${step < currentStep ? 'bg-aye_color' : 'bg-border_grey'}`} />}
				</div>
			))}
		</div>
	);
}

export default memo(StepIndicator);
