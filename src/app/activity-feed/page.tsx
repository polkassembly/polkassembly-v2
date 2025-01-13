// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { EActivityFeedTab } from '@/_shared/types';
import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import ActivityFeeToggleButton from '../_shared-components/ActivityFeed/ActivityFeeToggleButton/ActivityFeeToggleButton';
import LatestActivity from '../_shared-components/ActivityFeed';
import ActivityFeedSidebar from '../_shared-components/ActivityFeed/ActivityFeedSidebar';

function Page() {
	const [activeTab, setActiveTab] = useState<EActivityFeedTab>(EActivityFeedTab.EXPLORE as EActivityFeedTab);
	const t = useTranslations();

	return (
		<div>
			<div className='min-h-screen w-full bg-page_background px-10 pt-5'>
				<div className='flex w-full justify-between xl:items-center'>
					<div className='flex flex-col lg:flex-row xl:h-12 xl:gap-2'>
						<div>
							<h1 className='mx-2 text-xl font-semibold leading-9 text-text_primary dark:text-white lg:mt-3 lg:text-2xl'>{t('ActivityFeed.title')}</h1>
						</div>
						<ActivityFeeToggleButton
							activeTab={activeTab}
							setActiveTab={setActiveTab}
						/>
					</div>
				</div>

				<div className='flex flex-col justify-between gap-5 pt-5 xl:flex-row'>
					<div className='mx-1 w-3/4 flex-grow'>
						<div>
							{activeTab === EActivityFeedTab.EXPLORE ? <LatestActivity currentTab={EActivityFeedTab.EXPLORE} /> : <LatestActivity currentTab={EActivityFeedTab.FOLLOWING} />}
						</div>
					</div>
					<div className='w-1/4'>
						<ActivityFeedSidebar />
					</div>
				</div>
			</div>
		</div>
	);
}

export default Page;
