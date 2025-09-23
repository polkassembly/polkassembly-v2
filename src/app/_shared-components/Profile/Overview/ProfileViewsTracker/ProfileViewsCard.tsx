// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { Skeleton } from '@/app/_shared-components/Skeleton';
import { dayjs } from '@/_shared/_utils/dayjsInit';
import { useTranslations } from 'next-intl';
import classes from './ProfileViewsCard.module.scss';

function getHumanReadableDateRange(startDate: string, endDate: string): string {
	const start = dayjs(startDate);
	const end = dayjs(endDate);
	const diffDays = end.diff(start, 'days');

	if (diffDays === 0) return 'Today';
	if (diffDays === 1) return 'Last 24 hours';
	if (diffDays === 7) return 'Last 7 days';
	if (diffDays === 30) return 'Last 30 days';
	if (diffDays >= 365) {
		const years = Math.floor(diffDays / 365);
		return `Last ${years} ${years === 1 ? 'year' : 'years'}`;
	}
	if (diffDays >= 30) {
		const months = Math.floor(diffDays / 30);
		return `Last ${months} ${months === 1 ? 'month' : 'months'}`;
	}
	return `Last ${diffDays} days`;
}

interface ProfileViewsData {
	total: number;
	unique: number;
	startDate: string;
	endDate: string;
}

interface ProfileViewsCardProps {
	profileViewsData?: ProfileViewsData;
	isLoading?: boolean;
}

function ProfileViewsCard({ profileViewsData, isLoading = false }: Readonly<ProfileViewsCardProps>) {
	const t = useTranslations();
	if (isLoading) {
		return (
			<div className={classes.statCard}>
				<div className={classes.statCardHeader}>
					<span className={classes.statCardTitle}>{t('Profile.profileViews')}</span>
				</div>
				<div className={classes.profileViewsValue}>
					<Skeleton className='h-8 w-16' />
				</div>
			</div>
		);
	}

	return (
		<div className={classes.statCard}>
			<span className={classes.statCardTitle}>{t('Profile.profileViews')}</span>
			<div className={classes.profileViewsValue}>
				<span className={classes.value}>{profileViewsData?.unique || 0}</span>
				<span className={classes.timePeriod}>{getHumanReadableDateRange(profileViewsData?.startDate ?? '', profileViewsData?.endDate ?? '') || 'Last 30 days'}</span>
			</div>
		</div>
	);
}

export default ProfileViewsCard;
