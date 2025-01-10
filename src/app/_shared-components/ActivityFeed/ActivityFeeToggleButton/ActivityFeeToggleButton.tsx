// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { useEffect } from 'react';
import { EActivityFeedTab } from '@/_shared/types';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import styles from './ActivityFeeToggleButton.module.scss';

interface IToggleButtonProps {
	activeTab: EActivityFeedTab;
	setActiveTab: (tab: EActivityFeedTab) => void;
}

function ActivityFeeToggleButton({ activeTab, setActiveTab }: IToggleButtonProps) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const pathname = usePathname();
	const queryTab = searchParams.get('tab');
	const t = useTranslations();
	useEffect(() => {
		if (queryTab === 'subscribed') {
			setActiveTab(EActivityFeedTab.FOLLOWING);
		} else {
			setActiveTab(EActivityFeedTab.EXPLORE);
		}
	}, [queryTab, setActiveTab]);

	const handleTabClick = (tab: EActivityFeedTab) => {
		setActiveTab(tab);
		router.push(`${pathname}?tab=${tab === EActivityFeedTab.EXPLORE ? 'explore' : 'subscribed'}`);
	};

	return (
		<div className={styles.container}>
			<button
				type='button'
				onClick={() => handleTabClick(EActivityFeedTab.EXPLORE)}
				className={`${styles.button} ${activeTab === EActivityFeedTab.EXPLORE ? 'bg-[#FFFFFF] text-navbar_border dark:bg-[#0D0D0D]' : 'text-sidebar_text dark:text-[#DADADA]'}`}
			>
				{t('ActivityFeed.ExploreTab')}
			</button>
			<button
				type='button'
				onClick={() => handleTabClick(EActivityFeedTab.FOLLOWING)}
				className={`${styles.button} ${activeTab === EActivityFeedTab.FOLLOWING ? 'bg-[#FFFFFF] text-navbar_border dark:bg-[#0D0D0D]' : 'text-sidebar_text dark:text-[#DADADA]'}`}
			>
				{t('ActivityFeed.SubscribedTab')}
			</button>
		</div>
	);
}

export default ActivityFeeToggleButton;
