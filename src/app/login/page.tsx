// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import LoginComponent from './Components/Login';
import { getUserFromCookie } from '../_client-utils/getUserFromCookie';
import classes from './Components/Login.module.scss';

async function Login() {
	const user = await getUserFromCookie();

	return (
		<div className={classes.rootClass}>
			<div className={classes.loginComp}>
				<LoginComponent userId={user?.id?.toString()} />
			</div>
		</div>
	);
}

export default Login;
