// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { ArrowUpRightFromSquareIcon } from 'lucide-react';
import styles from './Header.module.scss';

export function AnalyticsHeader() {
	const t = useTranslations();
	return (
		<div className={styles.header}>
			<div className={styles.header_container}>
				<h1 className={styles.header_title}>{t('GovAnalytics.governanceAnalytics')}</h1>
				<p className={styles.header_description}>{t('GovAnalytics.governanceAnalyticsDescription')}</p>
				<Link
					href='https://wiki.polkadot.com/general/glossary/#referendum'
					target='_blank'
					className='flex items-center gap-x-1 text-sm font-medium text-text_pink underline'
				>
					{t('ActivityFeed.PostItem.readMore')} <ArrowUpRightFromSquareIcon className='h-3.5 w-3.5' />
				</Link>
			</div>
		</div>
	);
}
