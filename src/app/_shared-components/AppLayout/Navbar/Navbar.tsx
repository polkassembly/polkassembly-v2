// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@ui/Button';
import { useUser } from '@/hooks/useUser';
import { useTranslations } from 'next-intl';
import { AuthClientService } from '@/app/_client-services/auth_client_service';
import dynamic from 'next/dynamic';
import classes from './Navbar.module.scss';

const ToggleButton = dynamic(() => import('../../ToggleButton'), { ssr: false });

function Navbar() {
	const { user, setUser } = useUser();
	const t = useTranslations();
	return (
		<nav className={classes.navbar}>
			<p className='ml-10 md:ml-0'>Polkassembly</p>
			<div className='flex items-center gap-x-4'>
				{user?.id ? (
					<div className='flex items-center gap-x-4'>
						<Link href='/settings'>
							<Button variant='secondary'>{t('Profile.settings')}</Button>
						</Link>
						<Button onClick={() => AuthClientService.logout(() => setUser(null))}>{t('Profile.logout')}</Button>
					</div>
				) : (
					<Link href='/login'>
						<Button>{t('Profile.login')}</Button>
					</Link>
				)}
				<ToggleButton />
			</div>
		</nav>
	);
}

export default Navbar;
