// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { EActivityFeedTab, IGenericListingResponse, IPostListing } from '@/_shared/types';
import ActivityFeedComp from './ActivityFeedComp/ActivityFeedComp';

function ActivityFeed({ initialData, activeTab }: { initialData: IGenericListingResponse<IPostListing>; activeTab?: EActivityFeedTab | EActivityFeedTab.EXPLORE }) {
	return (
		<ActivityFeedComp
			initialData={initialData}
			activeTab={activeTab ?? EActivityFeedTab.EXPLORE}
		/>
	);
}

export default ActivityFeed;
