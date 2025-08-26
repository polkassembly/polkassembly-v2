// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/app/_shared-components/Skeleton';
import classes from './ProfileViewsCard.module.scss';

interface ProfileViewsData {
	total: number;
	unique: number;
	period: string;
}

interface ProfileViewsCardProps {
	profileViewsData?: ProfileViewsData;
	isLoading?: boolean;
}

function ProfileViewsCard({ profileViewsData, isLoading = false }: ProfileViewsCardProps) {
	if (isLoading) {
		return (
			<div className={classes.statCard}>
				<div className={classes.statCardHeader}>
					<Eye className={classes.statCardIcon} />
					<span className={classes.statCardTitle}>Profile Views</span>
				</div>
				<div className={classes.profileViewsValue}>
					<Skeleton className='h-8 w-16' />
					<Skeleton className='h-4 w-20' />
				</div>
			</div>
		);
	}

	if (!profileViewsData) {
		return (
			<div className={classes.statCard}>
				<Eye className={classes.statCardIcon} />
				<span className={classes.statCardTitle}>Profile Views</span>
				<div className={classes.profileViewsValue}>
					<span className={cn(classes.value, classes.pinkValue)}>0</span>
					<span className={classes.timePeriod}>All Time</span>
				</div>
			</div>
		);
	}

	return (
		<div className={classes.statCard}>
			<Eye className={classes.statCardIcon} />
			<span className={classes.statCardTitle}>Profile Views</span>
			<div className={classes.profileViewsValue}>
				<span className={cn(classes.value, classes.pinkValue)}>{profileViewsData.unique}</span>
				<span className={classes.timePeriod}>{profileViewsData.period}</span>
			</div>
		</div>
	);
}

export default ProfileViewsCard;
