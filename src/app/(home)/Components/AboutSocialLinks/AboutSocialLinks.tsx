// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Tooltip, TooltipContent, TooltipTrigger } from '@/app/_shared-components/Tooltip';
import Link from 'next/link';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import styles from '../Overview.module.scss';

function AboutSocialLinks() {
	const network = getCurrentNetwork();
	const { socialLinks } = NETWORKS_DETAILS[`${network}`];

	return (
		<div className={styles.about_social_links_container}>
			{socialLinks?.map((link) => (
				<Tooltip key={link.id}>
					<TooltipTrigger asChild>
						<Link
							href={link.href}
							target='_blank'
							rel='noopener noreferrer'
						>
							<link.icon />
						</Link>
					</TooltipTrigger>
					<TooltipContent className='bg-social_tooltip_background text-btn_primary_text'>
						<p>{link.label}</p>
					</TooltipContent>
				</Tooltip>
			))}
		</div>
	);
}

export default AboutSocialLinks;
