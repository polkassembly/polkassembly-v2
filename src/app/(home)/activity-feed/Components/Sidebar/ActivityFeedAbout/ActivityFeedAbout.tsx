// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { MdOpenInNew } from '@react-icons/all-files/md/MdOpenInNew';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import styles from './ActivityFeedAbout.module.scss';

function ActivityFeedAbout() {
	const t = useTranslations();
	const network = getCurrentNetwork();
	const { socialLinks } = NETWORKS_DETAILS[`${network}`];

	return (
		<div className={styles.aboutContainer}>
			<span className={`${styles.aboutTitle} dark:text-white`}>{t('ActivityFeed.About')}</span>
			<div className={styles.aboutDescription}>
				<span className='dark:text-white'>{t('ActivityFeed.AboutDescription')} </span>
				<span className='hover:underline'>
					<Link
						href='https://polkadot.network/about'
						className={styles.knowMoreLink}
					>
						{t('ActivityFeed.KnowMore')} <MdOpenInNew />
					</Link>
				</span>
			</div>
			<div className={styles.aboutSocialContainer}>
				{socialLinks?.map((link) => (
					<Link
						key={link.id}
						href={link.href}
						target='_blank'
						rel='noopener noreferrer'
						className={styles.aboutSocialLink}
						title={link.label}
					>
						<link.icon />
					</Link>
				))}
			</div>
		</div>
	);
}

export default ActivityFeedAbout;
