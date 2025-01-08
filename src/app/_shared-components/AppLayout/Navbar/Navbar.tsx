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
import { ELocales } from '@/_shared/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/_shared-components/Select/Select';
import dynamic from 'next/dynamic';
import { setLocaleCookie } from '@/app/_client-utils/setCookieFromServer';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import classes from './Navbar.module.scss';

const RPCSwitchDropdown = dynamic(() => import('../RpcSwitch/RPCSwitchDropdown'), { ssr: false });
const ToggleButton = dynamic(() => import('../../ToggleButton'), { ssr: false });

const LANGUAGES = {
	[ELocales.ENGLISH]: '🇺🇸 English',
	[ELocales.SPANISH]: '🇪🇸 Español',
	[ELocales.CHINESE]: '🇨🇳 中文',
	[ELocales.GERMAN]: '🇩🇪 Deutsch',
	[ELocales.JAPANESE]: '🇯🇵 日本語'
};

function Navbar() {
	const { user, setUser } = useUser();
	const t = useTranslations();
	const { userPreferences, setUserPreferences } = useUserPreferences();

	const handleLocaleChange = async (locale: ELocales) => {
		setLocaleCookie(locale);
		setUserPreferences({ ...userPreferences, locale });
	};

	return (
		<nav className={classes.navbar}>
			<p className='ml-10 md:ml-0'>Polkassembly</p>
			<div className='flex items-center gap-x-4'>
				<Select
					value={userPreferences.locale}
					onValueChange={(value: ELocales) => handleLocaleChange(value)}
				>
					<SelectTrigger className='w-[180px] border-border_grey'>
						<SelectValue placeholder='Select Language' />
					</SelectTrigger>
					<SelectContent className='border-border_grey'>
						<div>
							{Object.entries(LANGUAGES).map(([locale, label]) => (
								<SelectItem
									key={locale}
									value={locale}
									className='cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800'
								>
									{label}
								</SelectItem>
							))}
						</div>
					</SelectContent>
				</Select>

				{user?.id ? (
					<>
						<Link href='/settings'>
							<Button variant='secondary'>{t('Profile.settings')}</Button>
						</Link>
						<Button onClick={() => AuthClientService.logout(() => setUser(null))}>{t('Profile.logout')}</Button>
					</>
				) : (
					<Link href='/login'>
						<Button>{t('Profile.login')}</Button>
					</Link>
				)}

				<RPCSwitchDropdown />
				<ToggleButton />
			</div>
		</nav>
	);
}

export default Navbar;
