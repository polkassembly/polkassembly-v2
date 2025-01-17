// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { Button } from '@ui/Button';
import { useUser } from '@/hooks/useUser';
import { useTranslations } from 'next-intl';
import { AuthClientService } from '@/app/_client-services/auth_client_service';
import { ELocales, ENetwork } from '@/_shared/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/_shared-components/Select/Select';
import dynamic from 'next/dynamic';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { setLocaleCookie } from '@/app/_client-utils/setCookieFromServer';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { Input } from '@/app/_shared-components/Input';
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
	const [searchTerm, setSearchTerm] = useState('');
	const [selectedNetwork, setSelectedNetwork] = useState<ENetwork>(ENetwork.POLKADOT);
	const [isOpen, setIsOpen] = useState(false);
	const searchInputRef = useRef<HTMLInputElement>(null);

	const handleLocaleChange = async (locale: ELocales) => {
		setLocaleCookie(locale);
		setUserPreferences({ ...userPreferences, locale });
	};

	const handleNetworkChange = (network: ENetwork) => {
		setSelectedNetwork(network);
		window.location.href = `https://${network}.polkassembly.io/`;
		setSearchTerm('');
	};

	const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		e.stopPropagation();
		setSearchTerm(e.target.value);
	};

	const filteredNetworks = Object.entries(NETWORKS_DETAILS).filter(([, details]) => details.name.toLowerCase().includes(searchTerm.toLowerCase()));

	return (
		<nav className={classes.navbar}>
			<p className='pl-8 font-semibold text-navbar_title md:pl-0'>OpenGov</p>

			<div className='flex items-center gap-x-4'>
				<div className='relative'>
					<Select
						value={selectedNetwork}
						onValueChange={handleNetworkChange}
						open={isOpen}
						onOpenChange={setIsOpen}
					>
						<SelectTrigger
							className='w-[180px] border-border_grey'
							onClick={() => {
								setIsOpen(true);
								setTimeout(() => {
									searchInputRef.current?.focus();
								}, 0);
							}}
						>
							<SelectValue>
								<div className='flex items-center gap-2'>{NETWORKS_DETAILS[selectedNetwork]?.name}</div>
							</SelectValue>
						</SelectTrigger>
						<SelectContent
							className='max-h-[300px] border-border_grey'
							onCloseAutoFocus={(e) => {
								e.preventDefault();
							}}
						>
							<div className='p-2'>
								<Input
									ref={searchInputRef}
									type='text'
									placeholder='Search networks...'
									value={searchTerm}
									onChange={handleSearchChange}
									className='mb-2'
									onKeyDown={(e) => {
										e.stopPropagation();
									}}
								/>
								<div className='max-h-[200px] overflow-y-auto'>
									{filteredNetworks.map(([network, details]) => (
										<SelectItem
											key={network}
											value={network}
											className='cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800'
										>
											<div className='flex items-center gap-2'>{details.name}</div>
										</SelectItem>
									))}
								</div>
							</div>
						</SelectContent>
					</Select>
				</div>

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

				<RPCSwitchDropdown className='hidden lg:flex' />
				<ToggleButton className='hidden lg:flex' />
			</div>
		</nav>
	);
}

export default Navbar;
