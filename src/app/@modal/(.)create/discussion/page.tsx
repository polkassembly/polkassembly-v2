// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@ui/Dialog/Dialog';
import React from 'react';
import { useRouter } from 'next/navigation';
import HeaderLabel from '@/app/create/discussion/Component/HeaderLable';
import CreateDiscussion from '@/app/create/discussion/Component/CreateDiscussion/CreateDiscussion';
import classes from './discussion.module.scss';

function Discussion() {
	const router = useRouter();

	const handleOpenChange = () => {
		router.back();
	};

	return (
		<Dialog
			defaultOpen
			open
			onOpenChange={handleOpenChange}
		>
			<DialogContent className={classes.content}>
				<DialogHeader>
					<DialogTitle>
						<HeaderLabel />
					</DialogTitle>
				</DialogHeader>
				<div className='px-4'>
					<CreateDiscussion isModal />
				</div>
			</DialogContent>
		</Dialog>
	);
}

export default Discussion;
