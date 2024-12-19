// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { cn } from '@/lib/utils';
import { Button } from '@ui/Button';
import React from 'react';
import { ESignupSteps } from '@/_shared/types';
import classes from './SignupStepHeader.module.scss';

function SignupStepHeader({ step, setStep }: { step: ESignupSteps; setStep: React.Dispatch<React.SetStateAction<ESignupSteps>> }) {
	return (
		<div className={classes.wrapper}>
			<Button
				variant='ghost'
				onClick={() => setStep(ESignupSteps.USERNAME)}
				className={classes.btn}
			>
				<div className={cn(classes.tagWrapper, 'border-navbar_border', step === ESignupSteps.PASSWORD && 'border-success')}>
					<span className={cn(classes.tag, 'bg-bg_pink text-btn_primary_text', step === ESignupSteps.PASSWORD && 'bg-success')}>01</span>
				</div>
				<div className={cn(classes.username, 'border-border_grey', step === ESignupSteps.PASSWORD && 'border-success')}>{ESignupSteps.USERNAME}</div>
			</Button>
			<Button
				variant='ghost'
				className={classes.btn}
			>
				<div className={cn(classes.tagWrapper, 'border-border_grey', step === ESignupSteps.PASSWORD && 'border-navbar_border')}>
					<span className={cn(classes.tag, 'bg-border_grey text-text_grey', step === ESignupSteps.PASSWORD && 'bg-bg_pink text-btn_primary_text')}>02</span>
				</div>
				<div className={classes.password}>{ESignupSteps.PASSWORD}</div>
			</Button>
		</div>
	);
}

export default SignupStepHeader;
