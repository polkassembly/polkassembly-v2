// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@ui/Button';
import { useUser } from '@/hooks/useUser';
import { AuthClientService } from '@/app/_client-services/auth_client_service';
import classes from './Navbar.module.scss';

function Navbar() {
	const { user, setUser } = useUser();
	return (
		<nav className={classes.navbar}>
			<p className='ml-10 md:ml-0'>Polkassembly</p>
			{user?.id ? (
				<div className='flex items-center gap-x-4'>
					<Link href='/settings'>
						<Button variant='secondary'>Settings</Button>
					</Link>
					<Button onClick={() => AuthClientService.logout(() => setUser(null))}>Logout</Button>
				</div>
			) : (
				<Link href='/login'>
					<Button>Login</Button>
				</Link>
			)}
		</nav>
	);
}

export default Navbar;
