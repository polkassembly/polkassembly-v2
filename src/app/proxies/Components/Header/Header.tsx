// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useTranslations } from 'next-intl';
import { TabsList, TabsTrigger } from '@ui/Tabs';
import Link from 'next/link';
import { EProxyDashboardTabs } from '@/_shared/types';
import { Button } from '@/app/_shared-components/Button';
import { Pencil } from 'lucide-react';
import styles from './Header.module.scss';

function Header({ data }: { data: { allProxiesCount: number } }) {
	const t = useTranslations();

	return (
		<div className={styles.header}>
			<div className={styles.header_container}>
				<div className={styles.header_title_container}>
					<p className={styles.header_title}>{t('Proxies.proxyExplorer')}</p>
					<div className={styles.header_button_container}>
						<Link href='/create'>
							<Button leftIcon={<Pencil size={16} />}>{t('Proxies.createProxy')}</Button>
						</Link>
					</div>
				</div>
				<TabsList className={`w-fit max-w-full items-start overflow-auto pl-4 font-bold md:pl-0 ${styles.hideScrollbar}`}>
					<TabsTrigger
						className={styles.header_tab}
						value={EProxyDashboardTabs.ALL}
					>
						{t('Proxies.all')} ({data?.allProxiesCount})
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
