// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import React from 'react';
import UserIcon from '@assets/profile/user-icon.svg';
import Image from 'next/image';
import Address from '@ui/Profile/Address/Address';
import { useUser } from '@/hooks/useUser';
import EmailIcon from '@assets/icons/email-icon.svg';
import TwitterIcon from '@assets/icons/twitter-icon.svg';
import TelegramIcon from '@assets/icons/telegram-icon.svg';
import { ESocial } from '@/_shared/types';
import { Button } from '@ui/Button';
import DelegationPopupCard from './DelegationPopupCard';

const SocialIcons = {
	[ESocial.EMAIL]: EmailIcon,
	[ESocial.TWITTER]: TwitterIcon,
	[ESocial.TELEGRAM]: TelegramIcon,
	[ESocial.DISCORD]: TelegramIcon,
	[ESocial.RIOT]: TelegramIcon
};

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
						<div className='mt-4 flex items-center gap-x-4'>
							{socialLinks.map((social) => (
								<a
									key={social.platform}
									href={social.platform === ESocial.EMAIL ? `mailto:${social.url}` : social.url}
									target='_blank'
									className='flex h-8 w-8 items-center justify-center rounded-full bg-social_green'
									rel='noreferrer'
								>
									<Image
										src={SocialIcons[social.platform]}
										alt={`${social.platform} icon`}
										width={16}
										height={16}
									/>
								</a>
							))}
						</div>
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
