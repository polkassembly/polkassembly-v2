// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { EProfileTabs, ETheme } from '@/_shared/types';
import Identicon from '@polkadot/react-identicon';
import { ShieldPlus, UserPlus } from 'lucide-react';
import { THEME_COLORS } from '@/app/_style/theme';
import { useTheme } from 'next-themes';
import { useTranslations } from 'next-intl';
import { dayjs } from '@shared/_utils/dayjsInit';
import Image from 'next/image';
import CalendarIcon from '@assets/icons/calendar-icon.svg';
import { TabsList, TabsTrigger } from '../../Tabs';
import { Button } from '../../Button';
import classes from './ProfileHeader.module.scss';

function ProfileHeader({ address, username, createdAt, rank }: { address: string; username: string; createdAt?: Date; rank?: number }) {
	const { resolvedTheme } = useTheme();
	const t = useTranslations();
	return (
		<div>
			<div className={classes.profileHeaderWrapper}>
				<div className='relative'>
					<Identicon
						size={60}
						value={address}
						theme='polkadot'
					/>
					<div className={classes.rankBadge}>
						<span className={classes.rankBadgeText}>
							{t('Profile.rank')}: {rank}
						</span>
					</div>
				</div>
				<div className={classes.profileHeaderInner}>
					<div className={classes.profileHeaderText}>
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
							leftIcon={<UserPlus fill={THEME_COLORS[`${resolvedTheme || ETheme.LIGHT}` as ETheme].bg_pink} />}
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
			</TabsList>
		</div>
	);
}

export default ProfileHeader;
