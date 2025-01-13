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
import { useTranslations } from 'next-intl';
import ActivityFeedAboutStyles from './ActivityFeedAbout.module.scss';

interface SocialLink {
	id: string;
	icon: React.ReactNode;
	href: string;
	label: string;
}

function ActivityFeedAbout() {
	const t = useTranslations();
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
		<div className={ActivityFeedAboutStyles.aboutContainer}>
			<span className={`${ActivityFeedAboutStyles.aboutTitle} dark:text-white`}>{t('ActivityFeed.About')}</span>
			<div className={ActivityFeedAboutStyles.aboutDescription}>
				<span className='dark:text-white'>{t('ActivityFeed.AboutDescription')} </span>
				<Link
					href='https://polkadot.network/about'
					className='cursor-pointer text-text_pink hover:underline'
				>
					{t('ActivityFeed.KnowMore')}
				</Link>
			</div>
			<div className={ActivityFeedAboutStyles.aboutSocialContainer}>
				{socialLinks.map((link) => (
					<Link
						key={link.id}
						href={link.href}
						target='_blank'
						rel='noopener noreferrer'
						className={ActivityFeedAboutStyles.aboutSocialLink}
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
