// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useTranslations } from 'next-intl';
import { TabsList, TabsTrigger } from '@ui/Tabs';
import { ECommunityRole } from '@/_shared/types';
import { useRouter, usePathname } from 'next/navigation';
import styles from './Header.module.scss';

function Header({ activeTab }: { activeTab: ECommunityRole }) {
	const t = useTranslations();
	const router = useRouter();
	const pathname = usePathname();

	const onTabChange = (value: ECommunityRole) => {
		if (value !== activeTab) {
			router.push(`${pathname}?tab=${value}`);
		}
	};

	const communityTabs = [{ label: t('Community.members'), value: ECommunityRole.MEMBERS }];

	return (
		<div className={styles.header}>
			<div className={styles.header_container}>
				<div className={styles.header_title_container}>
					<p className={styles.header_title}>{t('Sidebar.people')}</p>
					<p className={styles.header_description}>{t('Community.communityDescription')}</p>
				</div>
				<TabsList className={`w-fit max-w-full items-start overflow-auto pl-4 font-bold md:pl-0 ${styles.hideScrollbar}`}>
					{communityTabs.map((tab) => (
						<TabsTrigger
							key={tab.value}
							className={styles.header_tab}
							value={tab.value}
							onClick={() => onTabChange(tab.value)}
						>
							{tab.label}
						</TabsTrigger>
					))}
				</TabsList>
			</div>
		</div>
	);
}

export default Header;
