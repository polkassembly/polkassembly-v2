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
import DelegationPopupCard from './DelegationPopupCard';
import SocialLinks from './SocialLinks';

function MyDelegation() {
	const { user } = useUser();

	if (!user) {
		return null;
	}

	const profileImage = user.publicUser?.profileDetails?.image || UserIcon;
	const socialLinks = user.publicUser?.profileDetails?.publicSocialLinks || [];

	return (
		<div>
			<DelegationPopupCard />
			<div className='mt-5 flex w-full gap-x-5 rounded-lg bg-bg_modal p-6 shadow-lg'>
				<Image
					src={profileImage}
					alt='user icon'
					className='h-20 w-20 rounded-full'
					width={100}
					height={100}
				/>
				<div className='flex w-full justify-between'>
					<div>
						<Address address={user.defaultAddress} />
						<SocialLinks socialLinks={socialLinks} />
					</div>
					<div>
						<Button>Become a Delegate</Button>
					</div>
				</div>
			</div>
		</div>
	);
}

export default MyDelegation;
