// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { EActivityFeedTab } from '@/_shared/types';
import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import ActivityFeedToggleButton from './ToggleButton/ToggleButton';
import ActivityFeedSidebar from './ActivityFeedSidebar';
import LatestActivity from './ActivityFeedTab';
import { Tabs, TabsContent } from '../Tabs/Tabs';
import styles from './ActivityFeed.module.scss';

function ActivityFeed() {
	const [activeTab, setActiveTab] = useState<EActivityFeedTab>(EActivityFeedTab.EXPLORE as EActivityFeedTab);
	const t = useTranslations();

	return (
		<div className='min-h-screen bg-page_background px-10 pt-5'>
			<div className='container mx-auto grid grid-cols-12 gap-5'>
				<div className='col-span-12'>
					<div className={styles.activityFeedContainer}>
						<div className={styles.activityFeedToggleButton}>
							<div>
								<h1 className={styles.activityFeedTitle}>{t('ActivityFeed.title')}</h1>
							</div>
							<ActivityFeedToggleButton
								activeTab={activeTab}
								setActiveTab={setActiveTab}
							/>
						</div>
					</div>
				</div>

				<div className={styles.activityFeedTabs}>
					<Tabs
						className={styles.activityFeedTabsContent}
						value={activeTab}
					>
						<TabsContent value={EActivityFeedTab.EXPLORE}>
							<LatestActivity currentTab={EActivityFeedTab.EXPLORE} />
						</TabsContent>
						<TabsContent value={EActivityFeedTab.FOLLOWING}>
							<LatestActivity currentTab={EActivityFeedTab.FOLLOWING} />
						</TabsContent>
					</Tabs>
				</div>

				<div className='hidden xl:col-span-3 xl:block'>
					<ActivityFeedSidebar />
				</div>
			</div>
		</div>
	);
}

export default ActivityFeed;
