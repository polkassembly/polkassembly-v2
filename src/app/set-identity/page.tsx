// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import classes from './SetIdentity.module.scss';
import SetIdentity from '../_shared-components/SetIdentity/SetIdentity';
import HeaderTitle from './HeaderTitle';
import { Separator } from '../_shared-components/Separator';

async function SetIdentityPage() {
	return (
		<div className={classes.rootClass}>
			<div className='mx-auto w-full max-w-3xl rounded-2xl bg-bg_modal p-3 shadow-lg sm:p-6'>
				<HeaderTitle />
				<Separator className='my-4' />
				<SetIdentity />
			</div>
		</div>
	);
}

export default SetIdentityPage;
