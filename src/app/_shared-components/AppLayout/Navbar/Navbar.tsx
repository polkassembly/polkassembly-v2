// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import Link from 'next/link';
import { Button } from '@ui/Button';
import { useUser } from '@/hooks/useUser';
import { useTranslations } from 'next-intl';
import { AuthClientService } from '@/app/_client-services/auth_client_service';
import { ELocales } from '@/_shared/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/_shared-components/Select/Select';
import { setLocaleCookie } from '@/app/_client-utils/setCookieFromServer';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { ChevronDown } from 'lucide-react';
import { useIsMobile } from '@/hooks/useIsMobile';
import classes from './Navbar.module.scss';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../DropdownMenu';
import Address from '../../Profile/Address/Address';
import NetworkDropdown from '../../NetworkDropdown/NetworkDropdown';
import RPCSwitchDropdown from '../RpcSwitch/RPCSwitchDropdown';
import ToggleButton from '../../ToggleButton';

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
	const isMobile = useIsMobile();

	const handleLocaleChange = async (locale: ELocales) => {
		setLocaleCookie(locale);
		setUserPreferences({ ...userPreferences, locale });
	};

	return (
		<nav className={classes.navbar}>
			<p className='pl-8 font-semibold text-navbar_title md:pl-0'>OpenGov</p>

			<div className='flex items-center gap-x-4'>
				<Select
					value={userPreferences.locale}
					onValueChange={(value: ELocales) => handleLocaleChange(value)}
				>
					<SelectTrigger className='w-[180px] border-border_grey bg-network_dropdown_bg'>
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

				<div className='relative'>
					<NetworkDropdown />
				</div>

				{user?.id ? (
					<DropdownMenu>
						<DropdownMenuTrigger>
							<Button
								variant='ghost'
								className='rounded-3xl border border-border_grey bg-wallet_disabled_bg text-sm text-text_primary'
								size='sm'
								rightIcon={<ChevronDown size={12} />}
							>
								{user.addresses && user.addresses.length > 0 ? (
									<Address
										address={user.addresses[0]}
										walletAddressName={user.username}
									/>
								) : (
									<p>{user.username}</p>
								)}
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent>
							<DropdownMenuItem>
								<Link href='/settings'>{t('Profile.settings')}</Link>
							</DropdownMenuItem>
							<DropdownMenuItem>
								<Link href={`/user/id/${user.id}`}>{t('Profile.profile')}</Link>
							</DropdownMenuItem>
							<DropdownMenuItem>
								<Button
									variant='ghost'
									className='p-0'
									onClick={() => AuthClientService.logout(() => setUser(null))}
								>
									{t('Profile.logout')}
								</Button>
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				) : (
					<Link href='/login'>
						<Button>{t('Profile.login')}</Button>
					</Link>
				)}

				<RPCSwitchDropdown className='hidden lg:flex' />
				<ToggleButton className='hidden lg:flex' />
			</div>
		</nav>
	);
}

export default Navbar;
