// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import React from 'react';
import UserIcon from '@assets/profile/user-icon.svg';
import Image from 'next/image';
import Address from '@ui/Profile/Address/Address';
import { useUser } from '@/hooks/useUser';
import { Button } from '@ui/Button';
import { useTranslations } from 'next-intl';
import DelegationPopupCard from '../DelegationPopupCard/DelegationPopupCard';
import SocialLinks from '../SocialLinks/SocialLinks';
import MyDelegateTracks from '../MyDelegateTracks/MyDelegateTracks';
import styles from './MyDelegation.module.scss';

function MyDelegation() {
	const { user } = useUser();
	const t = useTranslations('Delegation');

	if (!user) {
		return null;
	}

	const profileImage = user.publicUser?.profileDetails?.image || UserIcon;
	const socialLinks = user.publicUser?.profileDetails?.publicSocialLinks || [];

	return (
		<div>
			<DelegationPopupCard />
			<div className={styles.myDelegationContainer}>
				<Image
					src={profileImage}
					alt='user icon'
					className='h-20 w-20 rounded-full'
					width={100}
					height={100}
				/>
				<div className={styles.myDelegationContainerDiv}>
					<div>
						<Address
							address={user.defaultAddress}
							walletAddressName={user?.username}
						/>
						<SocialLinks socialLinks={socialLinks} />
					</div>
					<div className={styles.myDelegationContainerButton}>
						<Button variant='secondary'>{t('becomeDelegate')}</Button>
					</div>
				</div>
			</div>
			<MyDelegateTracks />
		</div>
	);
}

export default MyDelegation;
