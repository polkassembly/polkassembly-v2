// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { UserProfileClientService } from '@/app/_client-services/user_profile_client_service';
import { FIVE_MIN_IN_MILLI } from '@/app/api/_api-constants/timeConstants';
import { useQuery } from '@tanstack/react-query';
import React from 'react';
import { ClientError } from '@/app/_client-utils/clientError';
import { useTranslations } from 'next-intl';
import { Skeleton } from '../../Skeleton';
import Activity from './Activity/Activity';
import { Separator } from '../../Separator';
import classes from './UserActivity.module.scss';

function UserActivity({ userId }: { userId: number }) {
	const t = useTranslations();
	const fetchUserActivity = async () => {
		const { data, error } = await UserProfileClientService.fetchUserActivity({ userId });

		if (error) {
			throw new ClientError(error.message);
		}

		return data;
	};

	const { data, isFetching } = useQuery({
		queryKey: ['user-activity', userId],
		queryFn: () => fetchUserActivity(),
		placeholderData: (previousData) => previousData,
		staleTime: FIVE_MIN_IN_MILLI
	});

	return (
		<div className={classes.userActivityWrapper}>
			<div className={classes.userActivityHeader}>
				<p className={classes.userActivityHeaderTitle}>{t('Profile.activity')}</p>
				<p>({data?.length})</p>
			</div>
			<Separator className='mb-4' />
			{isFetching ? (
				<div className={classes.userActivitySkeleton}>
					<Skeleton className={classes.userActivitySkeletonItem} />
					<Skeleton className={classes.userActivitySkeletonItem} />
					<Skeleton className={classes.userActivitySkeletonItem} />
				</div>
			) : (
				data?.map((activity) => (
					<Activity
						key={activity.id}
						activity={activity}
					/>
				))
			)}
		</div>
	);
}

export default UserActivity;
