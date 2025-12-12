// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { ArrowUpRightFromSquareIcon } from 'lucide-react';
import { TabsList, TabsTrigger } from '@ui/Tabs';
import { ETreasurySpendsTabs } from '@/_shared/types';
import { useRouter, usePathname } from 'next/navigation';
import styles from './Header.module.scss';

export function TreasurySpendsHeader({ activeTab }: { activeTab: ETreasurySpendsTabs }) {
	const t = useTranslations();
	const router = useRouter();
	const pathname = usePathname();

	const onTabChange = (value: ETreasurySpendsTabs) => {
		if (value !== activeTab) {
			const queryParams = new URLSearchParams(window.location.search);
			queryParams.set('tab', value);
			router.push(`${pathname}?${queryParams.toString()}`);
		}
	};
	const spendsTabs = [
		{ label: t('TreasuryAnalytics.spends'), value: ETreasurySpendsTabs.SPENDS },
		{ label: t('TreasuryAnalytics.coretime'), value: ETreasurySpendsTabs.CORETIME }
	];
	return (
		<div className={styles.header}>
			<div className={styles.header_container}>
				<div className={styles.header_content}>
					<h1 className={styles.header_title}>{t('Sidebar.treasurySpendsAndCoretime')}</h1>
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
					{spendsTabs.map((tab) => (
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
