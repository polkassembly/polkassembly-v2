// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import React from 'react';
import CreateDiscussionComponent from '@/app/create/discussion/Component/CreateDiscussion/CreateDiscussion';
import classes from './Component/CreateDiscussion/CreateDiscussion.module.scss';

function Discussion() {
	return (
		<div className={classes.rootClass}>
			<div className={classes.createDiscussionComp}>
				<CreateDiscussionComponent />
			</div>
		</div>
	);
}

export default Discussion;
