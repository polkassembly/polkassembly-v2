// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { EActivityFeedTab } from '@/_shared/types';
import React, { useState } from 'react';
import ActivityFeeToggleButton from '../_shared-components/ActivityFeed/ActivityFeeToggleButton';

function Page() {
	const [activeTab, setActiveTab] = useState<EActivityFeedTab>(EActivityFeedTab.EXPLORE as EActivityFeedTab);

	return (
		<div>
			<div className='w-full'>
				<div className='flex w-full justify-between lg:mt-3 xl:items-center'>
					<div className='flex flex-col lg:flex-row xl:h-12 xl:gap-2'>
						<div>
							<h1 className='dark:text-blue-dark-high mx-2 text-xl font-semibold leading-9 text-text_primary lg:mt-3 lg:text-2xl'>Activity Feed</h1>
						</div>
						<ActivityFeeToggleButton
							activeTab={activeTab}
							setActiveTab={setActiveTab}
						/>
					</div>
				</div>

				<div className='flex flex-col justify-between gap-5 xl:flex-row'>
					<div className='mx-1 mt-[26px] flex-grow'>
						<div className=''>
							{/* {activeTab === EActivityFeedTab.EXPLORE ? <LatestActivity currentTab={EActivityFeedTab.EXPLORE} /> : <LatestActivity currentTab={EActivityFeedTab.FOLLOWING} />} */}
						</div>
					</div>
					{/* <ActivityFeedSidebar networkSocialsData={networkSocialsData || { data: null, error: '', status: 500 }} /> */}
				</div>
			</div>
		</div>
	);
}

export default Page;
