// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useQuery } from '@tanstack/react-query';
import { UserProfileClientService } from '@/app/_client-services/user_profile_client_service';
import { FIVE_MIN_IN_MILLI } from '@/app/api/_api-constants/timeConstants';
import { Skeleton } from '@/app/_shared-components/Skeleton';
import noData from '@assets/activityfeed/gifs/noactivity.gif';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { ValidatorService } from '@/_shared/_services/validator_service';
import { Separator } from '@/app/_shared-components/Separator';
import Activity from './Activity';
import classes from './Activities.module.scss';

function Activities({ userId }: { userId?: number }) {
	const t = useTranslations();

	const fetchUserActivity = async () => {
		if (!userId) return [];
		const { data, error } = await UserProfileClientService.fetchUserActivity({ userId });
		if (error) {
			throw new Error(error.message);
		}
		return data;
	};

	const { data: activities, isFetching } = useQuery({
		queryKey: ['user-activity', userId],
		queryFn: () => fetchUserActivity(),
		placeholderData: (previousData) => previousData,
		staleTime: FIVE_MIN_IN_MILLI
	});

	return (
		<div className={classes.activitiesWrapper}>
			{/* Header Section */}
			<div className='flex items-center gap-2'>
				<h2 className='text-2xl font-bold'>{t('Profile.Activity.activity')}</h2>
				{ValidatorService.isValidNumber(activities?.length) && <p aria-label={`Total votes: ${activities?.length}`}>({activities?.length})</p>}
			</div>
			<Separator orientation='horizontal' />

			<div className='mt-6 flex w-full flex-col justify-center'>
				{isFetching ? (
					<div className='flex w-full flex-col gap-y-4'>
						{Array.from({ length: 3 }).map(() => (
							<Skeleton className='h-4 w-full' />
						))}
					</div>
				) : activities ? (
					activities.map((activity) => (
						<Activity
							key={activity.id}
							activity={activity}
						/>
					))
				) : (
					<div className='flex w-full flex-col items-center justify-center'>
						<div
							className='mt-0 flex w-full flex-col items-center justify-center'
							role='status'
						>
							<Image
								src={noData}
								alt='No votes data available'
								width={300}
								height={300}
								priority
							/>
							<p className='text-text_secondary mb-2 mt-0'>{t('Profile.Activity.noData')}</p>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}

export default Activities;
