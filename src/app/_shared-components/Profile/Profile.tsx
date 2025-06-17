// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { EProfileTabs, IPublicUser } from '@/_shared/types';
import Image from 'next/image';
import ProfileRect from '@assets/profile/profile-rect.png';
import { useState } from 'react';
import { Tabs, TabsContent } from '../Tabs';
import ProfileHeader from './ProfileHeader/ProfileHeader';
import classes from './Profile.module.scss';
import Accounts from './Accounts/Accounts';
import Overview from './Overview/Overview';
import Settings from './Settings/Settings';
import Posts from './Posts/Posts';

function Profile({ profileData, address }: { profileData?: IPublicUser; address?: string }) {
	const [userProfileData, setUserProfileData] = useState<IPublicUser | undefined>(profileData);
	const handleUserProfileDataChange = (data: IPublicUser) => {
		setUserProfileData((prev) => ({ ...prev, ...data }));
	};

	return (
		<Tabs defaultValue={EProfileTabs.OVERVIEW}>
			<div className='relative'>
				<Image
					src={userProfileData?.profileDetails.coverImage || ProfileRect}
					alt='profile-cover-image'
					className='h-[150px] w-full'
					width={100}
					height={150}
				/>
			</div>
			<div className={classes.headerWrapper}>
				<ProfileHeader
					address={address}
					userProfileData={userProfileData}
					handleUserProfileDataChange={handleUserProfileDataChange}
				/>
			</div>
			<div className={classes.contentWrapper}>
				<TabsContent value={EProfileTabs.OVERVIEW}>
					<Overview
						address={address}
						profileData={profileData}
					/>
				</TabsContent>
				<TabsContent value={EProfileTabs.POSTS}>
					<Posts addresses={address ? [address] : profileData?.addresses || []} />
				</TabsContent>
				{/* <TabsContent value={EProfileTabs.ACTIVITY}>
					<UserActivity userId={profileData.id} />
				</TabsContent> */}
				<TabsContent value={EProfileTabs.ACCOUNTS}>
					<Accounts addresses={profileData?.addresses.length ? profileData.addresses : address ? [address] : []} />
				</TabsContent>
				{userProfileData && (
					<TabsContent value={EProfileTabs.SETTINGS}>
						<Settings
							userProfileData={userProfileData}
							setUserProfileData={handleUserProfileDataChange}
						/>
					</TabsContent>
				)}
			</div>
		</Tabs>
	);
}

export default Profile;
