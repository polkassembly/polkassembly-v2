// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Separator } from '@/app/_shared-components/Separator';
import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronDown, ChevronRight, Pencil, ScanLine } from 'lucide-react';
import ShieldUser from '@assets/icons/shield-user.svg';
import AccountPin from '@assets/icons/account-pin.svg';
import DeleteIcon from '@assets/icons/delete-icon.svg';
import Image from 'next/image';
import { IPublicUser } from '@/_shared/types';
import { THEME_COLORS } from '@/app/_style/theme';
import { useUser } from '@/hooks/useUser';
import classes from './Settings.module.scss';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../../Collapsible';
import { Button } from '../../Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../Dialog/Dialog';
import ActivateTfa from './EnableTFA';
import EditUsername from './EditUsername';
import LinkAddress from '../Overview/LinkAddress/LinkAddress';
import EditEmail from './EditEmail';
import DeleteAccount from './DeleteAccount';
import AppQrLogin from './AppQrLogin';

function Settings({ userProfileData, setUserProfileData }: { userProfileData: IPublicUser; setUserProfileData: (data: IPublicUser) => void }) {
	const t = useTranslations();
	const { user, setUser } = useUser();
	const [openEditUsernameDialog, setOpenEditUsernameDialog] = useState(false);
	const [openEditEmailDialog, setOpenEditEmailDialog] = useState(false);
	const [openDeleteAccountDialog, setOpenDeleteAccountDialog] = useState(false);

	return (
		<div className={classes.accountsWrapper}>
			<div className={classes.accountsHeader}>
				<p className={classes.accountsHeaderText}>{t('Profile.Settings.settings')}</p>
			</div>
			<Separator className='mb-4' />
			<div className={classes.settingsContent}>
				<Collapsible
					defaultOpen
					className={classes.settingsCollapsible}
				>
					<CollapsibleTrigger className='w-full'>
						<div className={classes.collapsibleTrigger}>
							<p className={classes.collapsibleTriggerText}>
								<Image
									src={ShieldUser}
									alt='shield-user'
								/>
								{t('Profile.Settings.profileSettings')}
							</p>
							<ChevronDown className={classes.collapsibleTriggerIcon} />
						</div>
					</CollapsibleTrigger>
					<CollapsibleContent>
						<Separator />
						<div className={classes.collapsibleContent}>
							<div className={classes.collapsibleContentItem}>
								<div className='text-sm'>
									<p className='mb-1 text-wallet_btn_text'>{t('Profile.Settings.username')}</p>
									<p className='font-medium text-text_primary'>{userProfileData.username}</p>
								</div>
								<Dialog
									open={openEditUsernameDialog}
									onOpenChange={setOpenEditUsernameDialog}
								>
									<DialogTrigger>
										<Button
											variant='ghost'
											leftIcon={
												<Pencil
													size={16}
													fill={THEME_COLORS.light.text_pink}
												/>
											}
											className='text-sm font-medium text-text_pink'
										>
											{t('Profile.Settings.edit')}
										</Button>
									</DialogTrigger>
									<DialogContent className='max-w-xl p-3 sm:p-6'>
										<DialogHeader>
											<DialogTitle>{t('Profile.Settings.editUsername')}</DialogTitle>
										</DialogHeader>
										<EditUsername
											oldUsername={userProfileData.username}
											onSuccess={(newUsername) => {
												setUserProfileData({ ...userProfileData, username: newUsername });
											}}
											onClose={() => {
												setOpenEditUsernameDialog(false);
											}}
											userId={userProfileData.id}
										/>
									</DialogContent>
								</Dialog>
							</div>
							<Separator />
							{user?.id === userProfileData.id && user.email && (
								<div className='flex items-center justify-between'>
									<div className='text-sm'>
										<p className='mb-1 text-wallet_btn_text'>{t('Profile.Settings.email')}</p>
										<p className='font-medium text-text_primary'>{user.email}</p>
									</div>
									<Dialog
										open={openEditEmailDialog}
										onOpenChange={setOpenEditEmailDialog}
									>
										<DialogTrigger>
											<Button
												variant='ghost'
												leftIcon={
													<Pencil
														size={16}
														fill={THEME_COLORS.light.text_pink}
													/>
												}
												className='text-sm font-medium text-text_pink'
											>
												{t('Profile.Settings.edit')}
											</Button>
										</DialogTrigger>
										<DialogContent className='max-w-xl p-3 sm:p-6'>
											<DialogHeader>
												<DialogTitle>{t('Profile.Settings.editEmail')}</DialogTitle>
											</DialogHeader>
											<EditEmail
												oldEmail={user.email}
												onSuccess={(newEmail) => {
													setUser({ ...user, email: newEmail });
												}}
												onClose={() => {
													setOpenEditEmailDialog(false);
												}}
												userId={userProfileData.id}
											/>
										</DialogContent>
									</Dialog>
								</div>
							)}
							<Dialog>
								<DialogTrigger className='rounded-md border border-border_grey bg-page_background p-4'>
									<p className='mb-1 flex items-center gap-x-1 font-medium text-text_primary'>
										{t('Profile.Settings.enableTfa')}
										<ChevronRight size={24} />
									</p>
									<p className='text-left text-sm text-text_primary'>{t('Profile.Settings.enableTfaDescription')}</p>
								</DialogTrigger>
								<DialogContent className='max-w-xl p-3 sm:p-6'>
									<DialogHeader className='text-xl font-semibold text-text_primary'>
										<DialogTitle>{t('Profile.Settings.tfaAuth')}</DialogTitle>
									</DialogHeader>
									<ActivateTfa />
								</DialogContent>
							</Dialog>
						</div>
					</CollapsibleContent>
				</Collapsible>

				{/* App QR login */}
				<Collapsible className={classes.settingsCollapsible}>
					<CollapsibleTrigger className='w-full'>
						<div className={classes.collapsibleTrigger}>
							<p className={classes.collapsibleTriggerText}>
								<ScanLine
									size={24}
									className='text-text_primary'
								/>
								{t('Profile.Settings.appQrLogin')}
							</p>
							<ChevronDown className={classes.collapsibleTriggerIcon} />
						</div>
					</CollapsibleTrigger>
					<CollapsibleContent>
						<Separator />
						<div className={classes.collapsibleContent}>
							<div className='flex items-center gap-x-2'>
								<Dialog>
									<DialogTrigger>
										<Button
											variant='ghost'
											className='text-sm font-medium text-text_pink'
										>
											{t('Profile.Settings.generateQr')}
										</Button>
									</DialogTrigger>
									<DialogContent className='max-w-xl p-3 sm:p-6'>
										<DialogHeader>
											<DialogTitle>{t('Profile.Settings.scanToLoginInApp')}</DialogTitle>
										</DialogHeader>
										<AppQrLogin />
									</DialogContent>
								</Dialog>
								<p className='text-xs text-text_primary'>{t('Profile.Settings.appQrLoginDescription')}</p>
							</div>
						</div>
					</CollapsibleContent>
				</Collapsible>

				<Collapsible className={classes.settingsCollapsible}>
					<CollapsibleTrigger className='w-full'>
						<div className={classes.collapsibleTrigger}>
							<p className={classes.collapsibleTriggerText}>
								<Image
									src={AccountPin}
									alt='account-pin'
								/>
								{t('Profile.Settings.accountSettings')}
							</p>
							<ChevronDown className={classes.collapsibleTriggerIcon} />
						</div>
					</CollapsibleTrigger>
					<CollapsibleContent>
						<Separator />
						<div className={classes.collapsibleContent}>
							<div className='flex items-center gap-x-2'>
								<Dialog>
									<DialogTrigger>
										<Button
											variant='ghost'
											className='text-sm font-medium text-text_pink'
										>
											{t('Profile.Settings.linkAddress')}
										</Button>
									</DialogTrigger>
									<DialogContent className='max-w-xl p-3 sm:p-6'>
										<DialogHeader>
											<DialogTitle>{t('Profile.Settings.linkAddress')}</DialogTitle>
										</DialogHeader>
										<LinkAddress />
									</DialogContent>
								</Dialog>
								<p className='text-xs text-text_primary'>{t('Profile.Settings.linkAddressDescription')}</p>
							</div>
						</div>
					</CollapsibleContent>
				</Collapsible>
				<Collapsible className={classes.settingsCollapsible}>
					<CollapsibleTrigger className='w-full'>
						<div className={classes.collapsibleTrigger}>
							<p className={classes.collapsibleTriggerText}>
								<Image
									src={DeleteIcon}
									alt='delete-icon'
								/>
								{t('Profile.Settings.deleteAccount')}
							</p>
							<ChevronDown className={classes.collapsibleTriggerIcon} />
						</div>
					</CollapsibleTrigger>
					<CollapsibleContent>
						<Separator />
						<div className={classes.collapsibleContent}>
							<p className='font-medium text-text_primary'>{t('Profile.Settings.deleteAccountDescription')}</p>
							<div className='flex'>
								<Dialog
									open={openDeleteAccountDialog}
									onOpenChange={setOpenDeleteAccountDialog}
								>
									<DialogTrigger>
										<Button variant='destructive'>{t('Profile.Settings.deleteMyAccount')}</Button>
									</DialogTrigger>
									<DialogContent className='max-w-xl p-3 sm:p-6'>
										<DialogHeader>
											<DialogTitle>{t('Profile.Settings.deleteAccount')}</DialogTitle>
										</DialogHeader>
										<DeleteAccount
											userId={userProfileData.id}
											onSuccess={() => {
												setOpenDeleteAccountDialog(false);
											}}
											onClose={() => {
												setOpenDeleteAccountDialog(false);
											}}
										/>
									</DialogContent>
								</Dialog>
							</div>
						</div>
					</CollapsibleContent>
				</Collapsible>
			</div>
		</div>
	);
}

export default Settings;
