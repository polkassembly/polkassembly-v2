// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { ArrowUpRightFromSquareIcon } from 'lucide-react';
import { TabsList, TabsTrigger } from '@ui/Tabs';
import { ETreasuryAnalyticsTabs } from '@/_shared/types';
import styles from './Header.module.scss';

export function TreasuryAnalyticsHeader() {
	const t = useTranslations();
	return (
		<div className={styles.header}>
			<div className={styles.header_container}>
				<div className={styles.header_content}>
					<h1 className={styles.header_title}>{t('Sidebar.treasuryAnalytics')}</h1>
					<p className={styles.header_description}>{t('TreasuryAnalytics.description')}</p>
					<Link
						href='https://wiki.polkadot.com/general/glossary/#referendum'
						target='_blank'
						rel='noopener noreferrer'
						className='flex items-center gap-x-1 text-sm font-medium text-text_pink underline'
					>
						{t('ActivityFeed.PostItem.readMore')} <ArrowUpRightFromSquareIcon className='h-3.5 w-3.5' />
					</Link>
				</div>
				<TabsList className={`w-fit max-w-full items-start overflow-auto pl-4 font-bold md:pl-0 ${styles.hideScrollbar}`}>
					<TabsTrigger
						className={styles.header_tab}
						value={ETreasuryAnalyticsTabs.OVERVIEW}
					>
						{t('TreasuryAnalytics.overview')}
					</TabsTrigger>
					<TabsTrigger
						className={styles.header_tab}
						value={ETreasuryAnalyticsTabs.SPENDS}
					>
						{t('TreasuryAnalytics.spends')}
					</TabsTrigger>
					<TabsTrigger
						className={styles.header_tab}
						value={ETreasuryAnalyticsTabs.CORETIME}
					>
						{t('TreasuryAnalytics.coretime')}
					</TabsTrigger>
				</TabsList>
			</div>
		</div>
	);
}
