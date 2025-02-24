// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Tooltip, TooltipContent, TooltipTrigger } from '@/app/_shared-components/Tooltip';
import { ElementType } from 'react';
import Link from 'next/link';

export interface AboutSocialLink {
	icon: ElementType;
	name: string;
	url: string;
}

interface AboutSocialLinksProps {
	links: AboutSocialLink[];
}

function AboutSocialLinks({ links }: AboutSocialLinksProps) {
	return (
		<div className='flex items-center gap-6 text-lg text-wallet_btn_text'>
			{links.map((link) => (
				<Tooltip key={link.name}>
					<TooltipTrigger asChild>
						<Link
							href={link.url}
							target='_blank'
							rel='noopener noreferrer'
						>
							<link.icon className='h-5 w-5 cursor-pointer hover:text-bg_pink' />
						</Link>
					</TooltipTrigger>
					<TooltipContent className='bg-social_tooltip_background text-btn_primary_text'>
						<p>{link.name}</p>
					</TooltipContent>
				</Tooltip>
			))}
		</div>
	);
}

export default AboutSocialLinks;
