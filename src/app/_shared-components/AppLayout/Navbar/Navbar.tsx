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
import { FaBars } from 'react-icons/fa';
import { IoMdClose } from 'react-icons/io';
import { useState, useEffect } from 'react';
import classes from './Navbar.module.scss';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../DropdownMenu';
import Address from '../../Profile/Address/Address';
import NetworkDropdown from '../../NetworkDropdown/NetworkDropdown';
import RPCSwitchDropdown from '../RpcSwitch/RPCSwitchDropdown';
import ToggleButton from '../../ToggleButton';
import PaLogo from '../PaLogo';

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
	const [isModalOpen, setModalOpen] = useState(false);

	const handleLocaleChange = async (locale: ELocales) => {
		setLocaleCookie(locale);
		setUserPreferences({ ...userPreferences, locale });
	};

	useEffect(() => {
		if (isModalOpen) {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = 'auto';
		}
		return () => {
			document.body.style.overflow = 'auto';
		};
	}, [isModalOpen]);

	const closeModal = () => setModalOpen(false);

	return (
		<nav className={classes.navbar}>
			<div className='flex items-center pl-8 md:pl-0'>
				<PaLogo
					variant='full'
					className='sm:hidden'
				/>
				<div className='border-l-[1px] border-bg_pink pl-3 font-semibold text-navbar_title sm:border-none sm:pl-0'>OpenGov</div>
			</div>

			{isMobile ? (
				<div
					aria-hidden
					className='rounded-md border border-border_grey bg-network_dropdown_bg p-2'
					onClick={() => setModalOpen(!isModalOpen)}
				>
					{isModalOpen ? <IoMdClose className='text-text_primary' /> : <FaBars className='text-text_primary' />}
				</div>
			) : (
				<div className='flex items-center gap-x-4'>
					<Select
						value={userPreferences.locale}
						onValueChange={handleLocaleChange}
					>
						<SelectTrigger className='w-[180px] border-border_grey bg-network_dropdown_bg'>
							<SelectValue placeholder='Select Language' />
						</SelectTrigger>
						<SelectContent className='border-border_grey'>
							{Object.entries(LANGUAGES).map(([locale, label]) => (
								<SelectItem
									key={locale}
									value={locale}
									className='cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800'
								>
									{label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<span>
						<NetworkDropdown />
					</span>
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
					<RPCSwitchDropdown />
					<span>
						<ToggleButton />
					</span>
				</div>
			)}

			{isMobile && isModalOpen && (
				<div
					className='fixed inset-0 top-20 bg-black bg-opacity-40'
					onClick={closeModal}
					role='button'
					tabIndex={0}
					onKeyDown={(e) => {
						if (e.key === 'Enter' || e.key === ' ') {
							closeModal();
						}
					}}
				/>
			)}

			{isMobile && isModalOpen && (
				<div className='absolute left-0 top-full z-50 w-full border-t-[3px] border-navbar_border bg-bg_modal p-4 pb-10 shadow-md'>
					<div className='flex flex-col gap-5'>
						<div>
							<p className='pb-1 text-sm text-text_primary'>Network</p>
							<NetworkDropdown className='w-full' />
						</div>
						<div>
							<p className='pb-1 text-sm text-text_primary'>Node</p>
							<RPCSwitchDropdown className='w-full' />
						</div>
						<ToggleButton className='w-full' />
						<div>
							<Link href='/login'>
								<Button className='w-full'>{t('Profile.login')}</Button>
							</Link>
						</div>
					</div>
				</div>
			)}
		</nav>
	);
}

export default Navbar;
