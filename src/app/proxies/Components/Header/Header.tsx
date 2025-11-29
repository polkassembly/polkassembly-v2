// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useProxyData } from '@/hooks/useProxyData';
import { useTranslations } from 'next-intl';
import { TabsList, TabsTrigger } from '@ui/Tabs';
import { EProxyDashboardTabs } from '@/_shared/types';
import styles from './Header.module.scss';

function Header() {
	const t = useTranslations();

	const { totalCount } = useProxyData({});

	return (
		<div className={styles.header}>
			<div className={styles.header_container}>
				<div className={styles.header_title_container}>
					<p className={styles.header_title}>{t('Proxies.proxyExplorer')}</p>
				</div>
				<p className={styles.header_subtitle}>{t('Proxies.proxyExplorerDescription')}</p>
				<TabsList className={`w-fit max-w-full items-start overflow-auto pl-4 font-bold md:pl-0 ${styles.hideScrollbar}`}>
					<TabsTrigger
						className={styles.header_tab}
						value={EProxyDashboardTabs.ALL}
					>
						{t('Proxies.all')} ({totalCount})
					</TabsTrigger>
					<TabsTrigger
						className={styles.header_tab}
						value={EProxyDashboardTabs.MY_PROXIES}
					>
						{t('Proxies.myProxies')}
					</TabsTrigger>
				</TabsList>
			</div>
		</div>
	);
}

export default Header;
