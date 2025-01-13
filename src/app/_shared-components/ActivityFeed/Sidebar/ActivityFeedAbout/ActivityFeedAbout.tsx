// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { networkSocialLinks } from '@/_shared/_constants/socialNetwork';
import ActivityFeedAboutStyles from './ActivityFeedAbout.module.scss';

function ActivityFeedAbout() {
	const t = useTranslations();
	const network = getCurrentNetwork();
	const socialLinks = networkSocialLinks[network];

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
