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

const HOVER_SCALE_CLASS = 'transition-transform hover:scale-110';

const SocialIcons = {
	Discord: <FaDiscord className={HOVER_SCALE_CLASS} />,
	Github: <TbBrandGithubFilled className={HOVER_SCALE_CLASS} />,
	Home: <TiHome className={HOVER_SCALE_CLASS} />,
	Reddit: <PiRedditLogoFill className={HOVER_SCALE_CLASS} />,
	Telegram: <FaTelegramPlane className={HOVER_SCALE_CLASS} />,
	Twitter: <FaTwitter className={HOVER_SCALE_CLASS} />,
	Youtube: <FaYoutube className={HOVER_SCALE_CLASS} />,
	Subscan: <RiBox3Line className={HOVER_SCALE_CLASS} />
} as const;

export const networkSocialLinks: Record<ENetwork, ISocialLink[]> = {
	[ENetwork.POLKADOT]: [
		{
			id: 'home',
			icon: SocialIcons.Home,
			href: 'https://polkadot.network/',
			label: 'Polkadot Homepage'
		},
		{
			id: 'twitter',
			icon: SocialIcons.Twitter,
			href: 'https://twitter.com/Polkadot',
			label: 'Twitter'
		},
		{
			id: 'discord',
			icon: SocialIcons.Discord,
			href: 'https://discord.gg/polkadot',
			label: 'Discord'
		},
		{
			id: 'github',
			icon: SocialIcons.Github,
			href: 'https://github.com/polkadot-js',
			label: 'GitHub'
		},
		{
			id: 'youtube',
			icon: SocialIcons.Youtube,
			href: 'https://www.youtube.com/channel/UCB7PbjuZLEba_znc7mEGNgw',
			label: 'YouTube'
		},
		{
			id: 'reddit',
			icon: SocialIcons.Reddit,
			href: 'https://www.reddit.com/r/polkadot',
			label: 'Reddit'
		},
		{
			id: 'telegram',
			icon: SocialIcons.Telegram,
			href: 'https://t.me/PolkadotOfficial',
			label: 'Telegram'
		},
		{
			id: 'subscan',
			icon: SocialIcons.Subscan,
			href: 'https://polkadot.subscan.io/',
			label: 'Subscan'
		}
	],
	[ENetwork.KUSAMA]: [
		{
			id: 'home',
			icon: SocialIcons.Home,
			href: 'https://kusama.network/',
			label: 'Kusama Homepage'
		}
	],
	[ENetwork.WESTEND]: []
} as const;
