// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { EActivityFeedTab, IGenericListingResponse, IPostListing, ITreasuryStats } from '@/_shared/types';
import ActivityFeedComp from './ActivityFeedComp/ActivityFeedComp';

function ActivityFeed({
	initialData,
	activeTab = EActivityFeedTab.EXPLORE,
	treasuryStatsData
}: {
	initialData: IGenericListingResponse<IPostListing>;
	activeTab?: EActivityFeedTab;
	treasuryStatsData: ITreasuryStats[];
}) {
	return (
		<ActivityFeedComp
			initialData={initialData}
			activeTab={activeTab}
			treasuryStatsData={treasuryStatsData}
		/>
	);
}

export default ActivityFeed;
