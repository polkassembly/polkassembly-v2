// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { EActivityFeedTab, IGenericListingResponse, IActivityFeedPostListing, ESidebarState } from '@/_shared/types';
import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import ActivityFeedToggleButton from './ActivityFeedToggleButton/ActivityFeedToggleButton';
import ActivityFeedSidebar from './ActivityFeedSidebar';
import { Tabs, TabsContent } from '../Tabs/Tabs';
import styles from './ActivityFeed.module.scss';
import ActivityFeedPostList from './ActivityFeedPostList/ActivityFeedPostList';
import SubscribedPostList from './ActivityFeedPostList/SubscribedPostList';
import { useSidebar } from '../Sidebar/Sidebar';

function ActivityFeed({ initialData }: { initialData: IGenericListingResponse<IActivityFeedPostListing> }) {
	const [activeTab, setActiveTab] = useState<EActivityFeedTab>(EActivityFeedTab.EXPLORE as EActivityFeedTab);
	const t = useTranslations();
	const { state } = useSidebar();

	return (
		<div className={cn('min-h-screen bg-page_background pt-5', state === ESidebarState.EXPANDED ? 'px-10 lg:px-16' : 'px-10 lg:px-20')}>
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
						defaultValue={activeTab}
					>
						<TabsContent value={EActivityFeedTab.EXPLORE}>
							<ActivityFeedPostList initialData={initialData} />
						</TabsContent>
						<TabsContent value={EActivityFeedTab.FOLLOWING}>
							{/* TODO: add subscribed post list */}
							<SubscribedPostList postData={initialData} />
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
