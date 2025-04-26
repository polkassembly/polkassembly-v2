// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { EActivityFeedTab } from '@/_shared/types';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import styles from './ActivityFeedToggleButton.module.scss';

interface IToggleButtonProps {
	activeTab: EActivityFeedTab;
}

function ActivityFeedToggleButton({ activeTab }: IToggleButtonProps) {
	const t = useTranslations();

	return (
		<div className={styles.container}>
			<Link
				href={`/activity-feed?tab=${EActivityFeedTab.EXPLORE}`}
				className={`${styles.button} ${activeTab === EActivityFeedTab.EXPLORE ? 'bg-section_dark_overlay font-semibold text-navbar_border' : 'font-medium text-sidebar_text'}`}
			>
				{t('ActivityFeed.ExploreTab')}
			</Link>
			<Link
				href={`/activity-feed?tab=${EActivityFeedTab.SUBSCRIBED}`}
				className={`${styles.button} ${activeTab === EActivityFeedTab.SUBSCRIBED ? 'bg-section_dark_overlay font-semibold text-navbar_border' : 'font-medium text-sidebar_text'}`}
			>
				{t('ActivityFeed.SubscribedTab')}
			</Link>
		</div>
	);
}

export default ActivityFeedToggleButton;
