// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { CookieService } from '@/_shared/_services/cookie_service';
import { redirect } from 'next/navigation';
import classes from './SetIdentity.module.scss';
import SetIdentity from '../_shared-components/SetIdentity/SetIdentity';
import HeaderTitle from './HeaderTitle';
import { Separator } from '../_shared-components/Separator';

async function Discussion() {
	const user = await CookieService.getUserFromCookie();
	if (!user) {
		redirect('/');
	}

	return (
		<div className={classes.rootClass}>
			<div className='w-full rounded-lg bg-bg_modal p-6 shadow-lg'>
				<HeaderTitle />
				<Separator className='my-4' />
				<SetIdentity />
			</div>
		</div>
	);
}

export default Discussion;
