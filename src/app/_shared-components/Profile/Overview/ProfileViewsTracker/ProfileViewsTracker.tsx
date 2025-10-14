// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useEffect, useCallback } from 'react';
import { useProfileViews } from '@/hooks/useProfileViews';
import ProfileViewsCard from './ProfileViewsCard';

interface ProfileViewsTrackerProps {
	userId?: number;
	isProfileOwner?: boolean;
}

function ProfileViewsTracker({ userId, isProfileOwner }: Readonly<ProfileViewsTrackerProps>) {
	const { profileViewsData, isProfileViewsLoading, incrementProfileView } = useProfileViews(userId, {
		enabled: isProfileOwner
	});

	const increment = useCallback(() => {
		if (userId && !isProfileOwner) {
			incrementProfileView();
		}
	}, [userId, isProfileOwner, incrementProfileView]);

	useEffect(() => {
		increment();
	}, [increment]);

	if (!isProfileOwner) {
		return null;
	}

	return (
		<ProfileViewsCard
			profileViewsData={profileViewsData}
			isLoading={isProfileViewsLoading}
		/>
	);
}

export default ProfileViewsTracker;
