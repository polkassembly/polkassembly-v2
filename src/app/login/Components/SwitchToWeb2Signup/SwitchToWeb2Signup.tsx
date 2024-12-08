// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import { Button } from '@ui/Button';
import classes from './SwitchToWeb2Signup.module.scss';

function SwitchToWeb2Signup({ switchToSignup }: { switchToSignup: () => void }) {
	return (
		<p className={classes.switchToWeb2Signup}>
			Don&apos;t have an account?{' '}
			<Button
				onClick={switchToSignup}
				variant='ghost'
				className='p-0 text-text_pink'
			>
				Sign Up
			</Button>
		</p>
	);
}

export default SwitchToWeb2Signup;
