// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { IGenericListingResponse, IPostListing } from '@/_shared/types';
import ActivityFeed from './ActivityFeed/ActivityFeed';

function ActivityFeedComponent({ initialData }: { initialData: IGenericListingResponse<IPostListing> }) {
	return <ActivityFeed initialData={initialData} />;
}

export default ActivityFeedComponent;
