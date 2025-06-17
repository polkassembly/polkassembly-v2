// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ESocial, IOnChainIdentity, IUserSocialDetails } from '@/_shared/types';
import { IoMdMail } from '@react-icons/all-files/io/IoMdMail';
import { FaTwitter } from '@react-icons/all-files/fa/FaTwitter';
import { FaTelegramPlane } from '@react-icons/all-files/fa/FaTelegramPlane';
import { FaDiscord } from '@react-icons/all-files/fa/FaDiscord';
import RiotIcon from '@assets/icons/riot_icon.svg';
import { FaGithub } from '@react-icons/all-files/fa/FaGithub';
import Image from 'next/image';

const SocialIcons = {
	[ESocial.EMAIL]: IoMdMail,
	[ESocial.TWITTER]: FaTwitter,
	[ESocial.TELEGRAM]: FaTelegramPlane,
	[ESocial.DISCORD]: FaDiscord,
	[ESocial.GITHUB]: FaGithub
};

function SocialLinks({ socialLinks = [], identity }: { socialLinks?: IUserSocialDetails[]; identity?: IOnChainIdentity }) {
	return (
		<div className='flex items-center gap-x-4'>
			{socialLinks.map((social) => {
				if (social.platform === ESocial.RIOT) {
					return (
						<a
							key={social.platform}
							href={social.url}
							target='_blank'
							className={`flex h-8 w-8 items-center justify-center rounded-full ${identity?.isGood ? 'bg-social_green' : 'bg-social_link'}`}
							rel='noreferrer'
						>
							<Image
								src={RiotIcon}
								alt='Riot'
								className='text-black'
							/>
						</a>
					);
				}

				const IconComponent = SocialIcons[social.platform];
				return (
					<a
						key={social.platform}
						href={social.platform === ESocial.EMAIL ? `mailto:${social.url}` : social.url}
						target='_blank'
						className={`flex h-8 w-8 items-center justify-center rounded-full ${identity?.isGood ? 'bg-social_green' : 'bg-social_link'}`}
						rel='noreferrer'
					>
						<IconComponent className='text-black' />
					</a>
				);
			})}
		</div>
	);
}

export default SocialLinks;
