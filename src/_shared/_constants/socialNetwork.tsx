// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { TiHome } from 'react-icons/ti';
import { FaTwitter, FaTelegramPlane, FaYoutube, FaDiscord } from 'react-icons/fa';
import { PiRedditLogoFill } from 'react-icons/pi';
import { TbBrandGithubFilled } from 'react-icons/tb';
import { RiBox3Line } from 'react-icons/ri';
import { ReactElement } from 'react';
import { ENetwork } from '../types';

interface ISocialLink {
	id: string;
	icon: ReactElement;
	href: string;
	label: string;
}

export const networkSocialLinks: Record<ENetwork, ISocialLink[]> = {
	[ENetwork.POLKADOT]: [
		{
			id: 'home',
			icon: <TiHome className='transition-transform hover:scale-110' />,
			href: 'https://polkadot.network/',
			label: 'Polkadot Homepage'
		},
		{
			id: 'twitter',
			icon: <FaTwitter className='transition-transform hover:scale-110' />,
			href: 'https://twitter.com/Polkadot',
			label: 'Twitter'
		},
		{
			id: 'discord',
			icon: <FaDiscord className='transition-transform hover:scale-110' />,
			href: 'https://discord.gg/polkadot',
			label: 'Discord'
		},
		{
			id: 'github',
			icon: <TbBrandGithubFilled className='transition-transform hover:scale-110' />,
			href: 'https://github.com/polkadot-js',
			label: 'GitHub'
		},
		{
			id: 'youtube',
			icon: <FaYoutube className='transition-transform hover:scale-110' />,
			href: 'https://www.youtube.com/channel/UCB7PbjuZLEba_znc7mEGNgw',
			label: 'YouTube'
		},
		{
			id: 'reddit',
			icon: <PiRedditLogoFill className='transition-transform hover:scale-110' />,
			href: 'https://www.reddit.com/r/polkadot',
			label: 'Reddit'
		},
		{
			id: 'telegram',
			icon: <FaTelegramPlane className='transition-transform hover:scale-110' />,
			href: 'https://t.me/PolkadotOfficial',
			label: 'Telegram'
		},
		{
			id: 'subscan',
			icon: <RiBox3Line className='transition-transform hover:scale-110' />,
			href: 'https://polkadot.subscan.io/',
			label: 'Subscan'
		}
	],
	[ENetwork.KUSAMA]: [
		{
			id: 'home',
			icon: <TiHome className='transition-transform hover:scale-110' />,
			href: 'https://kusama.network/',
			label: 'Kusama Homepage'
		}
	]
} as const;
