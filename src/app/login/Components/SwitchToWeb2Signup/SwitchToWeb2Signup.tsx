// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import { Button } from '@ui/Button';
import { cn } from '@/lib/utils';
import classes from './SwitchToWeb2Signup.module.scss';

function SwitchToWeb2Signup({ switchToSignup, className }: { switchToSignup: () => void; className?: string }) {
	return (
		<p className={cn(classes.switchToWeb2Signup, className)}>
			Don&apos;t have an account?{' '}
			<Button
				onClick={switchToSignup}
				variant='ghost'
				className='p-0 text-xs text-text_pink sm:text-sm'
			>
				Sign Up
			</Button>
		</p>
	);
}

export default SwitchToWeb2Signup;
