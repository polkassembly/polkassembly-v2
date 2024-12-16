// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import Image from 'next/image';
import homeIcon from '@/_assets/icons/Socials/home-icon.svg';
import twitterIcon from '@/_assets/icons/Socials/twitter-icon.svg';
import discordIcon from '@/_assets/icons/Socials/discord-icon.svg';
import githubIcon from '@/_assets/icons/Socials/github-icon.svg';
import youtubeIcon from '@/_assets/icons/Socials/youtube-icon.svg';
import redditIcon from '@/_assets/icons/Socials/reddit-icon.svg';
import telegramIcon from '@/_assets/icons/Socials/telegram-icon.svg';
import blockExplorerIcon from '@/_assets/icons/Socials/block-explorer-icon.svg';

function Socials() {
	return (
		<div className='flex items-center gap-5'>
			<Image
				src={homeIcon}
				alt='Home'
				width={24}
				height={24}
				className='cursor-pointer'
			/>
			<Image
				src={twitterIcon}
				alt='Twitter'
				width={24}
				height={24}
				className='cursor-pointer'
			/>
			<Image
				src={discordIcon}
				alt='Discord'
				width={24}
				height={24}
				className='cursor-pointer'
			/>
			<Image
				src={githubIcon}
				alt='GitHub'
				width={24}
				height={24}
				className='cursor-pointer'
			/>
			<Image
				src={youtubeIcon}
				alt='YouTube'
				width={24}
				height={24}
				className='cursor-pointer'
			/>
			<Image
				src={redditIcon}
				alt='Reddit'
				width={24}
				height={24}
				className='cursor-pointer'
			/>
			<Image
				src={telegramIcon}
				alt='Telegram'
				width={24}
				height={24}
				className='cursor-pointer'
			/>
			<Image
				src={blockExplorerIcon}
				alt='Block Explorer'
				width={24}
				height={24}
				className='cursor-pointer'
			/>
		</div>
	);
}

export default Socials;
