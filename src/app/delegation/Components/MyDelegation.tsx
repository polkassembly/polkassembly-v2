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
import DelegationPopupCard from './DelegationPopupCard';
import SocialLinks from './SocialLinks';
import MyDelegateTracks from './MyDelegateTracks';

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
			<div className='mt-5 flex flex-col items-center justify-center rounded-lg bg-bg_modal p-6 shadow-lg md:flex-row md:gap-x-5'>
				<Image
					src={profileImage}
					alt='user icon'
					className='h-20 w-20 rounded-full'
					width={100}
					height={100}
				/>
				<div className='mt-2 flex w-full flex-col items-center justify-center gap-y-5 sm:flex-row sm:gap-x-5 md:mt-0 md:justify-between'>
					<div>
						<Address address={user.defaultAddress} />
						<SocialLinks socialLinks={socialLinks} />
					</div>
					<div className='mt-5 hidden sm:mt-0 md:block'>
						<Button variant='secondary'>{t('becomeDelegate')}</Button>
					</div>
				</div>
			</div>
			<MyDelegateTracks />
		</div>
	);
}

export default MyDelegation;
