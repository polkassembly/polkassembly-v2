// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';
import { TiHome } from 'react-icons/ti';
import { FaTwitter, FaTelegramPlane, FaYoutube, FaDiscord } from 'react-icons/fa';
import { PiRedditLogoFill } from 'react-icons/pi';
import { TbBrandGithubFilled } from 'react-icons/tb';
import { RiBox3Line } from 'react-icons/ri';
import Link from 'next/link';

interface SocialLink {
	id: string;
	icon: React.ReactNode;
	href: string;
	label: string;
}

function ActivityFeedAbout() {
	const socialLinks: SocialLink[] = [
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
	];

	return (
		<div className='flex flex-col gap-3 rounded-xl border-[1px] border-primary_border bg-white p-5 text-text_primary'>
			<span className='text-xl font-semibold'>About</span>
			<div className='text-sm'>
				<span>Polkadot is the all-in-one DeFi hub of Polkadot. </span>
				<Link
					href='https://polkadot.network/about'
					className='cursor-pointer text-text_pink hover:underline'
				>
					Know More
				</Link>
			</div>
			<div className='flex flex-wrap gap-5 text-xl text-wallet_btn_text'>
				{socialLinks.map((link) => (
					<Link
						key={link.id}
						href={link.href}
						target='_blank'
						rel='noopener noreferrer'
						className='transition-colors duration-200 hover:text-text_pink'
						title={link.label}
					>
						{link.icon}
					</Link>
				))}
			</div>
		</div>
	);
}

export default ActivityFeedAbout;
