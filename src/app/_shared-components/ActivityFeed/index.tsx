// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { EActivityFeedTab } from '@/_shared/types';
import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import ActivityFeedToggleButton from './ToggleButton/ToggleButton';
import ActivityFeedSidebar from './ActivityFeedSidebar';
import LatestActivity from './LatestActivity';
import { Tabs, TabsContent } from '../Tabs/Tabs';

function ActivityFeed() {
	const [activeTab, setActiveTab] = useState<EActivityFeedTab>(EActivityFeedTab.EXPLORE as EActivityFeedTab);
	const t = useTranslations();

	return (
		<div>
			<div className='min-h-screen w-full bg-page_background px-10 pt-5'>
				<div className='flex w-full justify-between xl:items-center'>
					<div className='flex flex-row items-center gap-2'>
						<div>
							<h1 className='mx-2 text-xl font-semibold leading-9 text-text_primary dark:text-white lg:text-2xl'>{t('ActivityFeed.title')}</h1>
						</div>
						<ActivityFeedToggleButton
							activeTab={activeTab}
							setActiveTab={setActiveTab}
						/>
					</div>
				</div>

				<div className='flex flex-col justify-between gap-5 pt-5 xl:flex-row'>
					<Tabs
						className='mx-1 xl:w-3/4 xl:flex-grow'
						value={activeTab}
					>
						<TabsContent value={EActivityFeedTab.EXPLORE}>
							<LatestActivity currentTab={EActivityFeedTab.EXPLORE} />
						</TabsContent>
						<TabsContent value={EActivityFeedTab.FOLLOWING}>
							<LatestActivity currentTab={EActivityFeedTab.FOLLOWING} />
						</TabsContent>
					</Tabs>
					<div className='hidden xl:block xl:w-1/4'>
						<ActivityFeedSidebar />
					</div>
				</div>
			</div>
		</div>
	);
}

export default ActivityFeed;
