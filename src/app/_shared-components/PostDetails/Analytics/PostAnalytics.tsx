// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { useTranslations } from 'next-intl';
import { EAnalyticsType, EProposalType, ETheme, IPostAnalytics } from '@/_shared/types';
import { useState } from 'react';
import Image from 'next/image';
import NudgeIcon from '@/_assets/analytics/nudge-icon.svg';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import classes from './PostAnalytics.module.scss';
import { Skeleton } from '../../Skeleton';
import AccountsAnalytics from './AccountsAnalytics';
import ConvictionsAnalytics from './ConvictionsAnalytics';
import { Select, SelectValue, SelectTrigger, SelectContent, SelectItem } from '../../Select/Select';
import VotesAnalytics from './VotesAnalytics';

function PostAnalytics({ analytics, isFetching, proposalType, index }: { analytics?: IPostAnalytics; isFetching: boolean; proposalType: EProposalType; index: number }) {
	const t = useTranslations('PostDetails');
	const { userPreferences } = useUserPreferences();
	const { theme } = userPreferences;
	const [selectedAnalytics, setSelectedAnalytics] = useState<EAnalyticsType>(EAnalyticsType.CONVICTIONS);

	const options = [
		{ label: t('Analytics.convictionsAnalytics'), value: EAnalyticsType.CONVICTIONS },
		{ label: t('Analytics.votesAnalytics'), value: EAnalyticsType.VOTES },
		{ label: t('Analytics.accountsAnalytics'), value: EAnalyticsType.ACCOUNTS }
	];

	return (
		<div>
			{isFetching ? (
				<div className='flex flex-col gap-4'>
					<Skeleton className='h-[40px] w-[150px] rounded-lg' />
					<Skeleton className='h-[50px] w-full rounded-lg' />
					<div className='flex gap-4'>
						<Skeleton className='h-[180px] w-full rounded-lg' />
						<Skeleton className='h-[180px] w-full rounded-lg' />
						<Skeleton className='h-[180px] w-full rounded-lg' />
					</div>
					<Skeleton className='h-[250px] w-full rounded-lg' />
					<Skeleton className='h-[300px] w-full rounded-lg' />
					<div className='flex gap-4'>
						<Skeleton className='h-[250px] w-full rounded-lg' />
						<Skeleton className='h-[250px] w-full rounded-lg' />
					</div>
				</div>
			) : (
				<div>
					{/* Analytics type selector */}
					<Select
						value={selectedAnalytics}
						onValueChange={(value) => setSelectedAnalytics(value as EAnalyticsType)}
					>
						<SelectTrigger className='mb-4 w-fit'>
							<SelectValue placeholder='Select page size'>{options?.find((option) => option.value === selectedAnalytics)?.label || ''}</SelectValue>
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
			)}
		</div>
	);
}

export default PostAnalytics;
