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
import UserActivity from './UserActivity/UserActivity';
import Accounts from './Accounts/Accounts';
import Overview from './Overview/Overview';
import Settings from './Settings/Settings';

function Profile({ profileData }: { profileData: IPublicUser }) {
	const [userProfileData, setUserProfileData] = useState<IPublicUser>(profileData);
	const handleUserProfileDataChange = (data: IPublicUser) => {
		setUserProfileData((prev) => ({ ...prev, ...data }));
	};

	return (
		<Tabs defaultValue={EProfileTabs.OVERVIEW}>
			<div>
				<Image
					src={profileData.profileDetails.coverImage || ProfileRect}
					alt='profile-cover-image'
					className='w-full object-cover'
				/>
			</div>
			<div className={classes.headerWrapper}>
				<ProfileHeader
					address={profileData.addresses[0]}
					username={userProfileData.username}
					createdAt={profileData.createdAt}
					rank={profileData.rank}
					userId={profileData.id}
				/>
			</div>
			<div className={classes.contentWrapper}>
				<TabsContent value={EProfileTabs.OVERVIEW}>
					<Overview profileData={profileData} />
				</TabsContent>
				<TabsContent value={EProfileTabs.ACTIVITY}>
					<UserActivity userId={profileData.id} />
				</TabsContent>
				<TabsContent value={EProfileTabs.ACCOUNTS}>
					<Accounts addresses={profileData.addresses} />
				</TabsContent>
				<TabsContent value={EProfileTabs.SETTINGS}>
					<Settings
						userProfileData={userProfileData}
						setUserProfileData={handleUserProfileDataChange}
					/>
				</TabsContent>
			</div>
		</Tabs>
	);
}

export default Profile;
