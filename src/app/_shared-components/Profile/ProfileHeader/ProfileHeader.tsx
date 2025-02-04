// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { EProfileTabs, ESocial, IPublicUser } from '@/_shared/types';
import Identicon from '@polkadot/react-identicon';
import { Pencil, ShieldPlus, UserPlus } from 'lucide-react';
import { THEME_COLORS } from '@/app/_style/theme';
import { useTranslations } from 'next-intl';
import { dayjs } from '@shared/_utils/dayjsInit';
import Image from 'next/image';
import CalendarIcon from '@assets/icons/calendar-icon.svg';
import UserIcon from '@assets/profile/user-icon.svg';
import { useUser } from '@/hooks/useUser';
import { useState } from 'react';
import EmailIcon from '@assets/icons/email-icon.svg';
import TwitterIcon from '@assets/icons/twitter-icon.svg';
import TelegramIcon from '@assets/icons/telegram-icon.svg';
import { TabsList, TabsTrigger } from '../../Tabs';
import { Button } from '../../Button';
import classes from './ProfileHeader.module.scss';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../Dialog/Dialog';
import EditProfile from '../EditProfile/EditProfile';

const SocialIcons = {
	[ESocial.EMAIL]: EmailIcon,
	[ESocial.TWITTER]: TwitterIcon,
	[ESocial.TELEGRAM]: TelegramIcon,
	[ESocial.DISCORD]: TelegramIcon,
	[ESocial.RIOT]: TelegramIcon
};

function ProfileHeader({ userProfileData, handleUserProfileDataChange }: { userProfileData: IPublicUser; handleUserProfileDataChange: (data: IPublicUser) => void }) {
	const t = useTranslations();
	const { user } = useUser();
	const [openEditProfileDialog, setOpenEditProfileDialog] = useState(false);

	return (
		<div>
			<div className={classes.profileHeaderWrapper}>
				<div className='relative'>
					{userProfileData.profileDetails.image ? (
						<div className='w-[90px]'>
							<Image
								src={userProfileData.profileDetails.image}
								alt='profile'
								className='rounded-full border-[5px] border-border_blue'
								width={90}
								height={90}
							/>
						</div>
					) : userProfileData.addresses[0] ? (
						<Identicon
							size={90}
							value={userProfileData.addresses[0]}
							theme='polkadot'
							className='rounded-full border-[5px] border-border_blue'
						/>
					) : (
						<div className='w-[90px]'>
							<Image
								src={UserIcon}
								alt='profile'
								className='rounded-full border-[5px] border-border_blue'
							/>
						</div>
					)}
					<div className={classes.rankBadge}>
						<span className={classes.rankBadgeText}>
							{t('Profile.rank')}: {userProfileData.rank}
						</span>
					</div>
				</div>
				<div className='flex w-full flex-col gap-y-2'>
					<div className='flex items-start justify-between gap-x-2'>
						<div className='flex flex-col gap-y-1'>
							<p className={classes.profileHeaderTextTitle}>{userProfileData.username}</p>
							{userProfileData.createdAt && (
								<p className={classes.profileHeaderTextSince}>
									<span>{t('Profile.userSince')}: </span>{' '}
									<span className='flex items-center gap-x-1 text-xs'>
										<Image
											src={CalendarIcon}
											alt='calendar'
											width={20}
											height={20}
										/>
										{dayjs(userProfileData.createdAt).format("Do MMM 'YY")}
									</span>
								</p>
							)}
						</div>
						<div className={classes.profileHeaderButtons}>
							<div className='flex items-center gap-x-4'>
								{userProfileData.profileDetails.publicSocialLinks?.map((social) => (
									<a
										key={social.platform}
										href={social.platform === ESocial.EMAIL ? `mailto:${social.url}` : social.url}
										target='_blank'
										className='flex h-8 w-8 items-center justify-center rounded-full bg-social_green'
										rel='noreferrer'
									>
										<Image
											src={SocialIcons[social.platform]}
											alt='social green'
											width={16}
											height={16}
										/>
									</a>
								))}
							</div>
							{user?.id === userProfileData.id ? (
								<Dialog
									open={openEditProfileDialog}
									onOpenChange={setOpenEditProfileDialog}
								>
									<DialogTrigger asChild>
										<Button
											className='rounded-3xl px-6 font-medium'
											size='lg'
											leftIcon={
												<Pencil
													fill={THEME_COLORS.light.btn_primary_text}
													size={16}
												/>
											}
											onClick={() => setOpenEditProfileDialog(true)}
										>
											{t('Profile.edit')}
										</Button>
									</DialogTrigger>
									<DialogContent className='max-w-2xl p-6'>
										<DialogHeader>
											<DialogTitle>{t('Profile.editProfile')}</DialogTitle>
										</DialogHeader>
										<EditProfile
											userProfileData={userProfileData}
											onSuccess={handleUserProfileDataChange}
											onClose={() => setOpenEditProfileDialog(false)}
										/>
									</DialogContent>
								</Dialog>
							) : (
								<>
									<Button
										variant='secondary'
										className='rounded-3xl font-medium'
										size='lg'
										disabled
										leftIcon={<UserPlus fill={THEME_COLORS.light.bg_pink} />}
									>
										{t('Profile.delegate')}
									</Button>
									<Button
										size='lg'
										className='rounded-3xl'
										leftIcon={<ShieldPlus />}
										disabled
									>
										{t('Profile.follow')}
									</Button>
								</>
							)}
						</div>
					</div>
					{userProfileData.profileDetails.bio && <p className='text-text_primary'>{userProfileData.profileDetails.bio}</p>}
				</div>
			</div>
			<TabsList>
				<TabsTrigger
					className='uppercase'
					value={EProfileTabs.OVERVIEW}
				>
					{t('Profile.overview')}
				</TabsTrigger>
				<TabsTrigger
					className='uppercase'
					value={EProfileTabs.ACTIVITY}
				>
					{t('Profile.activity')}
				</TabsTrigger>
				<TabsTrigger
					className='uppercase'
					value={EProfileTabs.ACCOUNTS}
				>
					{t('Profile.accounts')}
				</TabsTrigger>
				{user?.id === userProfileData.id && (
					<TabsTrigger
						className='uppercase'
						value={EProfileTabs.SETTINGS}
					>
						{t('Profile.settings')}
					</TabsTrigger>
				)}
			</TabsList>
		</div>
	);
}

export default ProfileHeader;
