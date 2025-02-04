// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { EProfileTabs } from '@/_shared/types';
import Identicon from '@polkadot/react-identicon';
import { ShieldPlus, UserPlus } from 'lucide-react';
import { THEME_COLORS } from '@/app/_style/theme';
import { useTranslations } from 'next-intl';
import { dayjs } from '@shared/_utils/dayjsInit';
import Image from 'next/image';
import CalendarIcon from '@assets/icons/calendar-icon.svg';
import UserIcon from '@assets/profile/user-icon.svg';
import { useUser } from '@/hooks/useUser';
import { TabsList, TabsTrigger } from '../../Tabs';
import { Button } from '../../Button';
import classes from './ProfileHeader.module.scss';

function ProfileHeader({
	address,
	username,
	createdAt,
	rank,
	image,
	bio,
	userId
}: {
	address: string;
	username: string;
	createdAt?: Date;
	rank?: number;
	image?: string;
	bio?: string;
	userId: number;
}) {
	const t = useTranslations();
	const { user } = useUser();
	return (
		<div>
			<div className={classes.profileHeaderWrapper}>
				<div className='relative'>
					{image ? (
						<div className='w-[90px]'>
							<Image
								src={image}
								alt='profile'
							/>
						</div>
					) : address ? (
						<Identicon
							size={90}
							value={address}
							theme='polkadot'
						/>
					) : (
						<div className='w-[90px]'>
							<Image
								src={UserIcon}
								alt='profile'
							/>
						</div>
					)}
					<div className={classes.rankBadge}>
						<span className={classes.rankBadgeText}>
							{t('Profile.rank')}: {rank}
						</span>
					</div>
				</div>
				<div className='flex w-full flex-col gap-y-2'>
					<div className='flex items-start justify-between gap-x-2'>
						<div className='flex flex-col gap-y-1'>
							<p className={classes.profileHeaderTextTitle}>{username}</p>
							{createdAt && (
								<p className={classes.profileHeaderTextSince}>
									<span>{t('Profile.userSince')}: </span>{' '}
									<span className='flex items-center gap-x-1 text-xs'>
										<Image
											src={CalendarIcon}
											alt='calendar'
											width={20}
											height={20}
										/>
										{dayjs(createdAt).format("Do MMM 'YY")}
									</span>
								</p>
							)}
						</div>
						<div className={classes.profileHeaderButtons}>
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
						</div>
					</div>
					{bio && <p className='text-text_primary'>{bio}</p>}
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
				{user?.id === userId && (
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
