// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import NotificationChannelsSection from './sections/NotificationChannelsSection';
import ParachainsSection from './sections/ParachainsSection';
import PostsNotificationsSection from './sections/PostsNotificationsSection';
import CommentsNotificationsSection from './sections/CommentsNotificationsSection';
import BountiesNotificationsSection from './sections/BountiesNotificationsSection';
import AdvancedSettingsSection from './sections/AdvancedSettingsSection';

function Notifications() {
	const currentNetwork = getCurrentNetwork();

	return (
		<div className='flex flex-col gap-5'>
			<NotificationChannelsSection />
			<ParachainsSection />
			<PostsNotificationsSection network={currentNetwork} />
			<CommentsNotificationsSection network={currentNetwork} />
			<BountiesNotificationsSection network={currentNetwork} />
			<AdvancedSettingsSection network={currentNetwork} />
		</div>
	);
}

export default Notifications;
