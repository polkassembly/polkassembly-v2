// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useEffect } from 'react';
import { useProfileViews } from '@/hooks/useProfileViews';
import ProfileViewsCard from './ProfileViewsCard';

interface ProfileViewsTrackerProps {
	userId?: number;
	timePeriod?: 'today' | 'week' | 'month' | 'all';
}

function ProfileViewsTracker({ userId, timePeriod = 'month' }: ProfileViewsTrackerProps) {
	const { profileViewsData, isProfileViewsLoading, incrementProfileView } = useProfileViews(userId, { timePeriod });

	// Track profile view when component mounts
	useEffect(() => {
		if (userId) {
			// Increment profile view when the profile is viewed
			incrementProfileView();
		}
	}, [userId]);

	return (
		<ProfileViewsCard
			profileViewsData={profileViewsData}
			isLoading={isProfileViewsLoading}
		/>
	);
}

export default ProfileViewsTracker;
