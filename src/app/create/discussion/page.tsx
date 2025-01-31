// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { useEffect } from 'react';
import CreateDiscussionComponent from '@/app/create/discussion/Component/CreateDiscussion/CreateDiscussion';
import { useRouter } from 'next/navigation';
import { useUser } from '@/hooks/useUser';
import classes from './Component/CreateDiscussion/CreateDiscussion.module.scss';

function Discussion() {
	const router = useRouter();
	const { user } = useUser();

	useEffect(() => {
		if (!user?.id) {
			router.replace('/');
		}
	}, [user, router]);

	return (
		<div className={classes.rootClass}>
			<div className={classes.createDiscussionComp}>
				<CreateDiscussionComponent />
			</div>
		</div>
	);
}

export default Discussion;
