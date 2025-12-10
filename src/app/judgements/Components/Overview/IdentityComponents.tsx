// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import Image from 'next/image';
import { IoMdMail } from '@react-icons/all-files/io/IoMdMail';
import { FaTwitter } from '@react-icons/all-files/fa/FaTwitter';
import { FaDiscord } from '@react-icons/all-files/fa/FaDiscord';
import { FaGlobe } from '@react-icons/all-files/fa/FaGlobe';
import { FaGithub } from '@react-icons/all-files/fa/FaGithub';
import RiotIcon from '@assets/icons/riot_icon.svg';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/app/_shared-components/Tooltip';
import { ESocial } from '@/_shared/types';

interface Socials {
	email?: string;
	twitter?: string;
	discord?: string;
	matrix?: string;
	github?: string;
	web?: string;
}

interface SocialLinksDisplayProps {
	socials: Socials;
	size?: 'sm' | 'md';
}

export function SocialLinksDisplay({ socials, size = 'md' }: SocialLinksDisplayProps) {
	const iconClass = size === 'sm' ? 'size-3' : 'size-4';
	const containerClass = size === 'sm' ? 'h-6 w-6' : 'h-7 w-7';

	return (
		<div className='flex gap-2'>
			{socials.email && (
				<a
					key={ESocial.EMAIL}
					href={`mailto:${socials.email}`}
					target='_blank'
					className={`flex ${containerClass} items-center justify-center rounded-full bg-social_green`}
					rel='noreferrer'
				>
					<IoMdMail className={`${iconClass} text-white`} />
				</a>
			)}
			{socials.twitter && (
				<a
					key={ESocial.TWITTER}
					href={`https://x.com/${socials.twitter}`}
					target='_blank'
					className={`flex ${containerClass} items-center justify-center rounded-full bg-social_green`}
					rel='noreferrer'
				>
					<FaTwitter className={`${iconClass} text-white`} />
				</a>
			)}
			{socials.discord && (
				<a
					key={ESocial.DISCORD}
					href={`https://discord.com/users/${socials.discord}`}
					target='_blank'
					className={`flex ${containerClass} items-center justify-center rounded-full bg-social_green`}
					rel='noreferrer'
				>
					<FaDiscord className={`${iconClass} text-white`} />
				</a>
			)}
			{socials.github && (
				<a
					key={ESocial.GITHUB}
					href={`https://github.com/${socials.github}`}
					target='_blank'
					className={`flex ${containerClass} items-center justify-center rounded-full bg-primary_border/40`}
					rel='noreferrer'
				>
					<FaGithub className={`${iconClass} text-delegation_card_text`} />
				</a>
			)}
			{socials.web && (
				<a
					key='web_url'
					href={socials.web.startsWith('http://') || socials.web.startsWith('https://') ? socials.web : `https://${socials.web}`}
					target='_blank'
					className={`flex ${containerClass} items-center justify-center rounded-full bg-primary_border/40`}
					rel='noreferrer'
				>
					<FaGlobe className={`${iconClass} text-delegation_card_text`} />
				</a>
			)}
			{socials.matrix && (
				<a
					key='matrix'
					href={`https://matrix.to/#/${socials.matrix}`}
					target='_blank'
					className={`flex ${containerClass} items-center justify-center rounded-full bg-primary_border/40`}
					rel='noreferrer'
				>
					<Image
						src={RiotIcon}
						alt='Riot'
						width={20}
						height={20}
						className={`${size === 'sm' ? 'size-4' : 'size-5'} dark:grayscale dark:invert dark:filter`}
					/>
				</a>
			)}
		</div>
	);
}

interface JudgementDisplayProps {
	count: number;
	labels: string[];
	size?: 'sm' | 'md';
}

export function JudgementDisplay({ count, labels, size = 'md' }: JudgementDisplayProps) {
	if (count === 0 || labels.length === 0) {
		return <span className='px-4 text-center font-semibold text-text_primary'>-</span>;
	}

	const badgeClass = size === 'sm' ? 'text-xs' : 'text-sm';

	return (
		<div className='flex items-center gap-1'>
			<span className={`rounded px-2 py-1 ${badgeClass} font-semibold text-text_primary`}>{labels[0]}</span>
			{count > 1 && labels.length > 1 && (
				<Tooltip>
					<TooltipTrigger asChild>
						<span className='flex !size-6 items-center justify-center rounded-full border border-primary_border bg-poll_option_bg p-2 text-xs font-medium text-text_primary'>
							+{count - 1}
						</span>
					</TooltipTrigger>
					<TooltipContent
						side='top'
						align='center'
						className='bg-tooltip_background'
					>
						<div className='flex flex-col gap-2 p-2'>
							<span className='text-xs text-white'>{labels.join(', ')}</span>
						</div>
					</TooltipContent>
				</Tooltip>
			)}
		</div>
	);
}
