// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { useTranslations } from 'next-intl';
import { EAnalyticsType, EProposalType, ETheme } from '@/_shared/types';
import { useState } from 'react';
import Image from 'next/image';
import NudgeIcon from '@/_assets/analytics/nudge-icon.svg';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useQuery } from '@tanstack/react-query';
import { POST_ANALYTICS_ENABLED_PROPOSAL_TYPE } from '@/_shared/_constants/postAnalyticsConstants';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import noData from '@/_assets/activityfeed/gifs/noactivity.gif';
import classes from './PostAnalytics.module.scss';
import { Skeleton } from '../../Skeleton';
import AccountsAnalytics from './AccountsAnalytics';
import ConvictionsAnalytics from './ConvictionsAnalytics';
import { Select, SelectValue, SelectTrigger, SelectContent, SelectItem } from '../../Select/Select';
import VotesAnalytics from './VotesAnalytics';

const getPostAnalytics = async ({ proposalType, index }: { proposalType: EProposalType; index: string }) => {
	const { data, error } = await NextApiClientService.getPostAnalytics({ proposalType, index });
	if (error) {
		throw new Error(error?.message || 'Failed to fetch data');
	}
	return data;
};

function PostAnalytics({ proposalType, index }: { proposalType: EProposalType; index: string }) {
	const t = useTranslations('PostDetails');
	const { userPreferences } = useUserPreferences();
	const { theme } = userPreferences;
	const [selectedAnalytics, setSelectedAnalytics] = useState<EAnalyticsType>(EAnalyticsType.CONVICTIONS);

	const {
		data: analytics,
		isFetching,
		error
	} = useQuery({
		queryKey: ['postAnalytics', proposalType, index],
		queryFn: () => getPostAnalytics({ proposalType, index }),
		enabled: POST_ANALYTICS_ENABLED_PROPOSAL_TYPE.includes(proposalType) && !!index,
		refetchOnWindowFocus: false,
		refetchOnMount: false,
		retry: false
	});

	const options = [
		{ label: t('Analytics.convictionsAnalytics'), value: EAnalyticsType.CONVICTIONS },
		{ label: t('Analytics.votesAnalytics'), value: EAnalyticsType.VOTES },
		{ label: t('Analytics.accountsAnalytics'), value: EAnalyticsType.ACCOUNTS }
	];

	if (error && !analytics && !isFetching) {
		return <div>Error: {error.message}</div>;
	}

	return (
		<div>
			{isFetching ? (
				<div className='flex flex-col gap-4'>
					<Skeleton className='h-[40px] w-[150px] rounded-lg' />
					<Skeleton className='h-[50px] w-full rounded-lg' />
					<div className='flex gap-4 max-lg:flex-col'>
						<Skeleton className='h-[180px] w-full rounded-lg' />
						<Skeleton className='h-[180px] w-full rounded-lg' />
						<Skeleton className='h-[180px] w-full rounded-lg' />
					</div>
					<Skeleton className='h-[250px] w-full rounded-lg' />
					<Skeleton className='h-[500px] w-full rounded-lg' />
					<div className='flex gap-4 max-lg:flex-col'>
						<Skeleton className='h-[250px] w-full rounded-lg' />
						<Skeleton className='h-[250px] w-full rounded-lg' />
					</div>
				</div>
			) : analytics ? (
				<div>
					{/* Analytics type selector */}
					<Select
						value={selectedAnalytics}
						onValueChange={(value) => setSelectedAnalytics(value as EAnalyticsType)}
					>
						<SelectTrigger className='mb-4 flex w-fit items-center gap-2'>
							<SelectValue placeholder='Select analytics type'>{options?.find((option) => option.value === selectedAnalytics)?.label || ''}</SelectValue>
						</SelectTrigger>
						<SelectContent>
							{options.map((option) => (
								<SelectItem
									key={option.value}
									value={option.value}
								>
									{option.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>

					{/* Analytics description */}
					<div className={classes.description}>
						<Image
							src={NudgeIcon}
							alt='icon'
							width={24}
							height={24}
							className={theme === ETheme.DARK ? 'darkIcon' : ''}
						/>
						{selectedAnalytics === EAnalyticsType.CONVICTIONS
							? t('Analytics.convictionAnalyticsDes')
							: selectedAnalytics === EAnalyticsType.VOTES
								? t('Analytics.votesAnalyticsDes')
								: t('Analytics.accountAnalyticsDes')}
					</div>

					{/* Analytics */}
					<div className={classes.analytics}>
						{selectedAnalytics === EAnalyticsType.ACCOUNTS && (
							<div className={classes.analyticsItem}>{analytics?.accountsAnalytics && <AccountsAnalytics accountsAnalytics={analytics.accountsAnalytics} />}</div>
						)}
						{selectedAnalytics === EAnalyticsType.CONVICTIONS && (
							<div className={classes.analyticsItem}>
								{analytics?.convictionsAnalytics && (
									<ConvictionsAnalytics
										convictionsAnalytics={analytics.convictionsAnalytics}
										proposalType={proposalType}
										index={index}
									/>
								)}
							</div>
						)}
						{selectedAnalytics === EAnalyticsType.VOTES && (
							<div className={classes.analyticsItem}>
								{analytics?.votesAnalytics && (
									<VotesAnalytics
										votesAnalytics={analytics.votesAnalytics}
										index={index}
										proposalType={proposalType}
									/>
								)}
							</div>
						)}
					</div>
				</div>
			) : (
				<div className='flex flex-col items-center justify-center gap-4 py-8'>
					<Image
						src={noData}
						alt='no data'
						width={200}
						height={200}
					/>
					{t('Analytics.noData')}
				</div>
			)}
		</div>
	);
}

export default PostAnalytics;
