// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';
import { EActivityFeedTab } from '@/_shared/types';
import ActivityFeedPostList from './ActivityFeedPostList/ActivityFeedPostList';
import SubscribedPostList from './ActivityFeedPostList/SubscribedPostList';

function ActivityFeedTab({ currentTab }: { currentTab: EActivityFeedTab }) {
	return <div>{currentTab === EActivityFeedTab.EXPLORE ? <ActivityFeedPostList /> : <SubscribedPostList postData={{ posts: [], totalCount: 0 }} />}</div>;
}

export default ActivityFeedTab;
