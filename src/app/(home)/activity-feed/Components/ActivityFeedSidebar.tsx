// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';
import { useUser } from '@/hooks/useUser';
import TreasuryStats from '@/app/_shared-components/TreasuryStats/TreasuryStats';
import { ITreasuryStats } from '@/_shared/types';
import ActivityFeedAbout from './Sidebar/ActivityFeedAbout/ActivityFeedAbout';
import ActivityFeedActiveProposal from './Sidebar/ActivityFeedActiveProposal/ActivityFeedActiveProposal';
import ActivityFeedRankCard from './Sidebar/ActivityFeedRankCard';
import ActivityFeedFeaturesSection from './Sidebar/ActivityFeedFeaturesSection/ActivityFeedFeaturesSection';

function ActivityFeedSidebar({ treasuryStatsData }: { treasuryStatsData: ITreasuryStats[] }) {
	const { user } = useUser();

	return (
		<div className='flex flex-col gap-5'>
			<ActivityFeedAbout />
			{user?.id && <ActivityFeedActiveProposal />}
			<TreasuryStats
				data={treasuryStatsData}
				isActivityFeed
			/>
			<ActivityFeedRankCard />
			<ActivityFeedFeaturesSection />
		</div>
	);
}

export default ActivityFeedSidebar;
