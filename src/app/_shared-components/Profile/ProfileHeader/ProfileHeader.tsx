// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import { EProfileTabs, ETheme } from '@/_shared/types';
import Identicon from '@polkadot/react-identicon';
import { ShieldPlus, UserPlus } from 'lucide-react';
import { THEME_COLORS } from '@/app/_style/theme';
import { useTheme } from 'next-themes';
import { useTranslations } from 'next-intl';
import { TabsList, TabsTrigger } from '../../Tabs';
import Address from '../Address/Address';
import { Button } from '../../Button';
import classes from './ProfileHeader.module.scss';

function ProfileHeader({ address }: { address: string }) {
	const { resolvedTheme } = useTheme();
	const t = useTranslations();
	return (
		<div>
			<div className={classes.profileHeaderWrapper}>
				<div>
					<Identicon
						size={40}
						value={address}
						theme='polkadot'
					/>
				</div>
				<div className={classes.profileHeaderInner}>
					<Address
						textClassName='text-lg lg:text-2xl font-semibold'
						address={address}
						showIdenticon={false}
					/>
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
