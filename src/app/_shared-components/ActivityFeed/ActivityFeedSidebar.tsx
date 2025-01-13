// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';
import ActivityFeedAbout from './Sidebar/ActivityFeedAbout/ActivityFeedAbout';
import ActivityFeedActiveProposal from './Sidebar/ActivityFeedActiveProposal/ActivityFeedActiveProposal';
import ActivityFeedRankCard from './Sidebar/ActivityFeedRankCard';
import ActivityFeedFeaturesSection from './Sidebar/ActivityFeedFeaturesSection/ActivityFeedFeaturesSection';

function ActivityFeedSidebar() {
	return (
		<div className='flex flex-col gap-5'>
			<ActivityFeedAbout />
			<ActivityFeedActiveProposal />
			<ActivityFeedRankCard />
			<ActivityFeedFeaturesSection />
		</div>
	);
}

export default ActivityFeedSidebar;
