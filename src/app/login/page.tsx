// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import LoginComponent from './Components/Login';
import classes from './Components/Login.module.scss';
import { CookieService } from '../_client-services/cookie_service';

async function Login() {
	const user = await CookieService.getUserFromCookie();

	return (
		<div className={classes.rootClass}>
			<div className={classes.loginComp}>
				<LoginComponent userId={user?.id?.toString()} />
			</div>
		</div>
	);
}

export default Login;
