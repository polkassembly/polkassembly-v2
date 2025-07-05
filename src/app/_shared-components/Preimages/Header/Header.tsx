// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useTranslations } from 'next-intl';
import { TabsList, TabsTrigger } from '@ui/Tabs';
import { EPreImageTabs } from '@/_shared/types';
import styles from './Header.module.scss';

function Header({ data }: { data: { totalCount: number } }) {
	const t = useTranslations();

	return (
		<div className={styles.header}>
			<div className={styles.header_container}>
				<p className={styles.header_title}>{t('Sidebar.preimages')}</p>
				<TabsList className={`w-fit max-w-full items-start overflow-auto pl-4 font-bold md:pl-0 ${styles.hideScrollbar}`}>
					<TabsTrigger
						className={styles.header_tab}
						value={EPreImageTabs.ALL}
					>
						{t('Preimages.all')} ({data?.totalCount})
					</TabsTrigger>
					<TabsTrigger
						className={styles.header_tab}
						value={EPreImageTabs.USER}
					>
						{t('Preimages.myPreimages')}
					</TabsTrigger>
				</TabsList>
			</div>
		</div>
	);
}

export default Header;
