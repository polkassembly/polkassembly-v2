// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ESocial, IUserSocialDetails } from '@/_shared/types';
import { IoMdMail } from 'react-icons/io';
import { FaTwitter, FaTelegramPlane } from 'react-icons/fa';
import { FaDiscord } from 'react-icons/fa6';
import { SiElement } from 'react-icons/si';

const SocialIcons = {
	[ESocial.EMAIL]: IoMdMail,
	[ESocial.TWITTER]: FaTwitter,
	[ESocial.TELEGRAM]: FaTelegramPlane,
	[ESocial.DISCORD]: FaDiscord,
	[ESocial.RIOT]: SiElement
};

function SocialLinks({ socialLinks }: { socialLinks: IUserSocialDetails[] }) {
	return (
		<div className='mt-4 flex items-center gap-x-4'>
			{socialLinks.map((social) => {
				const IconComponent = SocialIcons[social.platform];
				return (
					<a
						key={social.platform}
						href={social.platform === ESocial.EMAIL ? `mailto:${social.url}` : social.url}
						target='_blank'
						className='flex h-8 w-8 items-center justify-center rounded-full bg-social_green'
						rel='noreferrer'
					>
						<IconComponent className='text-white' />
					</a>
				);
			})}
		</div>
	);
}

export default SocialLinks;
