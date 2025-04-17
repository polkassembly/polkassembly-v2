// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@ui/Dialog/Dialog';
import LoginComponent from '@/app/login/Components/Login';
import React from 'react';
import { useRouter } from 'next/navigation';
import HeaderLabel from '@/app/login/Components/HeaderLabel';
import classes from './Login.module.scss';

function Login() {
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
				<div className='sm:px-4'>
					<LoginComponent isModal />
				</div>
			</DialogContent>
		</Dialog>
	);
}

export default Login;
