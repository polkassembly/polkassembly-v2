// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import React, { useEffect } from 'react';
import { EActivityFeedTab } from '@/_shared/types';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import styles from './ToggleButton.module.scss';

interface IToggleButtonProps {
	activeTab: EActivityFeedTab;
	setActiveTab: (tab: EActivityFeedTab) => void;
}

function ToggleButton({ activeTab, setActiveTab }: IToggleButtonProps) {
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
				className={`${styles.button} ${activeTab === EActivityFeedTab.EXPLORE ? 'bg-section_dark_overlay text-navbar_border' : 'text-sidebar_text'}`}
			>
				{t('ActivityFeed.ExploreTab')}
			</button>
			<button
				type='button'
				onClick={() => handleTabClick(EActivityFeedTab.FOLLOWING)}
				className={`${styles.button} ${activeTab === EActivityFeedTab.FOLLOWING ? 'bg-section_dark_overlay text-navbar_border' : 'text-sidebar_text'}`}
			>
				{t('ActivityFeed.SubscribedTab')}
			</button>
		</div>
	);
}

export default ToggleButton;
