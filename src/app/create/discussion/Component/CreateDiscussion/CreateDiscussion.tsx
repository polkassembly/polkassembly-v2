// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import React, { useEffect } from 'react';
import WritePost from '@/app/_shared-components/Create/WritePost/WritePost';
import { useRouter } from 'next/navigation';
import { useUser } from '@/hooks/useUser';
import classes from './CreateDiscussion.module.scss';
import HeaderLabel from '../HeaderLabel';

function CreateDiscussion({ isModal }: { isModal?: boolean }) {
	const router = useRouter();
	const { user } = useUser();

	useEffect(() => {
		if (!user) {
			router.replace('/');
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [router]);

	return (
		<div className={classes.container}>
			{!isModal && (
				<div className={classes.header}>
					<HeaderLabel />
				</div>
			)}
			<div className={!isModal ? 'px-6 py-6 sm:px-12' : ''}>
				<WritePost />
			</div>
		</div>
	);
}

export default CreateDiscussion;
