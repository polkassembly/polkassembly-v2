// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import WritePost from '@/app/_shared-components/Create/WritePost/WritePost';
import classes from './CreateDiscussion.module.scss';
import HeaderLabel from '../HeaderLabel';

function CreateDiscussion() {
	return (
		<div className={classes.container}>
			<div className={classes.header}>
				<HeaderLabel />
			</div>
			<div className='px-6 py-6 sm:px-12'>
				<WritePost />
			</div>
		</div>
	);
}

export default CreateDiscussion;
