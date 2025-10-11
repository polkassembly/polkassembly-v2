// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { IPublicUser } from '@/_shared/types';
import { BarChart3 } from 'lucide-react';
import { useUserBalanceData } from '@/hooks/useUserBalanceData';
import { useUser } from '@/hooks/useUser';
import classes from './ProfileOverview.module.scss';
import VotingPowerCard from './VotingPowerCard/VotingPowerCard';
import BalanceCard from './BalanceCard/BalanceCard';
import ProfileViewsTracker from './ProfileViewsTracker/ProfileViewsTracker';

interface ProfileOverviewProps {
	profileData?: IPublicUser;
	address?: string;
}

function ProfileOverview({ profileData, address }: ProfileOverviewProps) {
	// Get the primary address to use for data fetching
	const primaryAddress = address || profileData?.addresses?.[0];

	// Fetch user balance data using the custom hook
	const { user } = useUser();

	const isProfileOwner = Boolean(profileData?.id && user?.id === profileData?.id);

	const { userBalanceData, isLoading } = useUserBalanceData(primaryAddress);

	return (
		<div className={classes.profileOverview}>
			{/* Header */}
			<div className={classes.header}>
				<div className={classes.headerContent}>
					<BarChart3 className={classes.headerIcon} />
					<h2 className={classes.headerTitle}>Overview</h2>
				</div>
			</div>

			{/* Stats Cards */}
			<div className={classes.statsGrid}>
				<VotingPowerCard
					votingPowerData={userBalanceData.votingPower}
					isProfileOwner={isProfileOwner}
					isLoading={isLoading}
				/>
				<BalanceCard
					availableBalance={userBalanceData.available}
					delegatedBalance={userBalanceData.delegated}
					isLoading={isLoading}
				/>
				<ProfileViewsTracker
					isProfileOwner={isProfileOwner}
					userId={profileData?.id}
				/>
			</div>
		</div>
	);
}

export default ProfileOverview;
