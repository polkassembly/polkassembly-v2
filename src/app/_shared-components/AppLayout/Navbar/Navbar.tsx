// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@ui/Button';
import { useUser } from '@/app/_atoms/user/userAtom';
import { logout } from '@/app/_client-utils/logout';
import classes from './Navbar.module.scss';

function Navbar() {
	const [user, setUser] = useUser();
	return (
		<nav className={classes.navbar}>
			<p>Polkassembly</p>
			{user?.id ? (
				<Button onClick={() => logout(() => setUser(null))}>Logout</Button>
			) : (
				<Link href='/login'>
					<Button>Login</Button>
				</Link>
			)}
		</nav>
	);
}

export default Navbar;
