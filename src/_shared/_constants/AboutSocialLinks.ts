// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { TiHome } from 'react-icons/ti';
import { FaTwitter, FaYoutube, FaRedditAlien } from 'react-icons/fa6';
import { RiDiscordFill } from 'react-icons/ri';
import { TbBrandGithubFilled } from 'react-icons/tb';
import { FaTelegramPlane } from 'react-icons/fa';
import { IoIosCube } from 'react-icons/io';
import { AboutSocialLink } from '@/app/overview/Components/AboutSocialLinks/AboutSocialLinks';
import { ENetwork } from '../types';

type NetworkSocialLinks = {
	[key in ENetwork]: AboutSocialLink[];
};

export const aboutSocialLinks: NetworkSocialLinks = {
	[ENetwork.POLKADOT]: [
		{
			icon: TiHome,
			name: 'HomePage',
			url: 'https://polkadot.com/'
		},
		{
			icon: FaTwitter,
			name: 'Twitter',
			url: 'https://x.com/Polkadot'
		},
		{
			icon: RiDiscordFill,
			name: 'Discord',
			url: 'https://discord.gg/polkadot'
		},
		{
			icon: TbBrandGithubFilled,
			name: 'Github',
			url: 'https://github.com/paritytech/polkadot-sdk'
		},
		{
			icon: FaYoutube,
			name: 'Youtube',
			url: 'https://www.youtube.com/channel/UCB7PbjuZLEba_znc7mEGNgw'
		},
		{
			icon: FaRedditAlien,
			name: 'Reddit',
			url: 'https://reddit.com/r/polkadot'
		},
		{
			icon: FaTelegramPlane,
			name: 'Telegram',
			url: 'https://t.me/PolkadotOfficial'
		},
		{
			icon: IoIosCube,
			name: 'Block Explorer',
			url: 'https://polkadot.subscan.io/'
		}
	],
	[ENetwork.KUSAMA]: [],
	[ENetwork.WESTEND]: []
};
