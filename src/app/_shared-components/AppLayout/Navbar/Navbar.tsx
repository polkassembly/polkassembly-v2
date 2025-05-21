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
import { FaBars } from '@react-icons/all-files/fa/FaBars';
import { IoMdClose } from '@react-icons/all-files/io/IoMdClose';
import { useState } from 'react';
import TranslateIcon from '@assets/icons/translate.svg';
import Image from 'next/image';
import classes from './Navbar.module.scss';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../DropdownMenu';
import Address from '../../Profile/Address/Address';
import NetworkDropdown from '../../NetworkDropdown/NetworkDropdown';
import RPCSwitchDropdown from '../RpcSwitch/RPCSwitchDropdown';
import PaLogo from '../PaLogo';
import ThemeToggleButton from '../../ThemeToggleButton';
import Search from '../Search/Search';

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
	const [isModalOpen, setModalOpen] = useState(false);

	const handleLocaleChange = async (locale: ELocales) => {
		setLocaleCookie(locale);
		setUserPreferences({ ...userPreferences, locale });
	};

	const handleModalOpen = () => {
		document.body.classList.add('no-scroll');
	};

	const handleModalClose = () => {
		document.body.classList.remove('no-scroll');
	};

	const closeModal = () => {
		setModalOpen(false);
		handleModalClose();
	};
	return (
		<nav className={classes.navbar}>
			<div className='flex items-center pl-12 md:pl-0'>
				<Link href='/'>
					<PaLogo
						variant='full'
						className='w-[120px] md:hidden'
					/>
				</Link>
				<div className='border-l-[1px] border-bg_pink pl-2 font-medium text-navbar_title md:border-none md:pl-0'>OpenGov</div>
			</div>

			<div className='flex items-center gap-x-2 md:hidden'>
				<Search />
				<div
					aria-hidden
					className='block rounded-md border border-border_grey bg-network_dropdown_bg p-2 md:hidden'
					onClick={() => {
						setModalOpen(!isModalOpen);
						if (!isModalOpen) {
							handleModalOpen();
						} else {
							handleModalClose();
						}
					}}
				>
					{isModalOpen ? <IoMdClose className='text-text_primary' /> : <FaBars className='text-text_primary' />}
				</div>
			</div>

			<div className='hidden items-center gap-x-4 md:flex'>
				<Search />
				<Select
					value={userPreferences.locale}
					onValueChange={handleLocaleChange}
				>
					<SelectTrigger
						className='relative h-8 w-8 border-0 p-0 shadow-none'
						hideChevron
					>
						<Image
							src={TranslateIcon}
							alt='translate'
							width={24}
							height={24}
							className={classes.translateIcon}
						/>
						<span className={classes.translateIconLocale}>{userPreferences.locale}</span>
					</SelectTrigger>
					<SelectContent className='w-20 border-border_grey'>
						{Object.entries(LANGUAGES).map(([locale, label]) => (
							<SelectItem
								key={locale}
								value={locale}
							>
								<div className={classes.languageItem}>
									<span>{label}</span>
									<span className={classes.localeText}>{locale}</span>
								</div>
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				<span>
					<NetworkDropdown />
				</span>
				<span>
					{user?.id ? (
						<DropdownMenu>
							<DropdownMenuTrigger
								className='rounded-3xl border border-border_grey bg-wallet_disabled_bg px-3 py-2 text-sm normal-case text-text_primary'
								asChild
							>
								{user.addresses && user.addresses.length > 0 ? (
									<Address
										address={user.addresses[0]}
										walletAddressName={user.username}
										disableTooltip
									/>
								) : (
									<p>{user.username}</p>
								)}
							</DropdownMenuTrigger>
							<DropdownMenuContent>
								<DropdownMenuItem className='hover:bg-sidebar_menu_hover'>
									<Link
										className='w-full'
										href={`/user/${user.username}`}
									>
										{t('Profile.profile')}
									</Link>
								</DropdownMenuItem>
								<DropdownMenuItem className='hover:bg-sidebar_menu_hover'>
									<Link
										className='w-full'
										href='/set-identity'
									>
										{t('SetIdentity.setIdentity')}
									</Link>
								</DropdownMenuItem>
								<DropdownMenuItem className='hover:bg-sidebar_menu_hover'>
									<Button
										variant='ghost'
										className='flex w-full justify-start p-0 text-sm'
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
				</span>
				<RPCSwitchDropdown />
				<span>
					<ThemeToggleButton />
				</span>
			</div>

			{isModalOpen && (
				<div
					className='fixed inset-0 top-20 bg-black bg-opacity-40 md:hidden'
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

			{isModalOpen && (
				<div className='absolute left-0 top-full z-50 w-full border-t-[3px] border-navbar_border bg-bg_modal p-4 pb-10 shadow-md md:hidden'>
					<div className='flex flex-col gap-5 pt-14'>
						<div>
							<p className='pb-1 text-sm text-text_primary'>{t('Header.network')}</p>
							<NetworkDropdown className='w-full' />
						</div>
						<div>
							<p className='pb-1 text-sm text-text_primary'>{t('Header.node')}</p>
							<RPCSwitchDropdown className='w-full' />
						</div>
						<div className='w-full'>
							<p className='pb-1 text-sm text-text_primary'>{t('Header.language')}</p>
							<Select
								value={userPreferences.locale}
								onValueChange={handleLocaleChange}
							>
								<SelectTrigger className='w-full border-border_grey bg-network_dropdown_bg md:w-[180px]'>
									<SelectValue placeholder='Select Language' />
								</SelectTrigger>
								<SelectContent className='border-border_grey'>
									{Object.entries(LANGUAGES).map(([locale, label]) => (
										<SelectItem
											key={locale}
											value={locale}
											className={classes.languageItem}
										>
											<div className='flex w-full items-center gap-2'>
												<span className={classes.languageText}>{label}</span>
												<span className={classes.languageCode}>{locale}</span>
											</div>
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<ThemeToggleButton className='w-full' />
						<div>
							{user?.id ? (
								<DropdownMenu>
									<DropdownMenuTrigger
										className='rounded-3xl border border-border_grey bg-wallet_disabled_bg px-3 py-2 text-sm normal-case text-text_primary'
										asChild
									>
										{user.addresses && user.addresses.length > 0 ? (
											<Address
												address={user.addresses[0]}
												walletAddressName={user.username}
												disableTooltip
											/>
										) : (
											<p>{user.username}</p>
										)}
									</DropdownMenuTrigger>
									<DropdownMenuContent>
										<DropdownMenuItem>
											<Link
												className='w-full'
												href={`/user/${user.username}`}
											>
												{t('Profile.profile')}
											</Link>
										</DropdownMenuItem>
										<DropdownMenuItem>
											<Link
												className='w-full'
												href='/set-identity'
											>
												{t('SetIdentity.setIdentity')}
											</Link>
										</DropdownMenuItem>
										<DropdownMenuItem>
											<Button
												variant='ghost'
												className='flex w-full justify-start p-0 text-sm'
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
						</div>
					</div>
				</div>
			)}
		</nav>
	);
}

export default Navbar;
