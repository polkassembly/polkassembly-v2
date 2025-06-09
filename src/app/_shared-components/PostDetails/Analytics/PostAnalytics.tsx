// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { useTranslations } from 'next-intl';
import { EAnalyticsType, EProposalType, ETheme } from '@/_shared/types';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { ClientError } from '@/app/_client-utils/clientError';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import Image from 'next/image';
import NudgeIcon from '@/_assets/analytics/nudge-icon.svg';
import { FIVE_MIN_IN_MILLI } from '@/app/api/_api-constants/timeConstants';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import classes from './PostAnalytics.module.scss';
import { Skeleton } from '../../Skeleton';
import AccountsAnalytics from './AccountsAnalytics';
import ConvictionsAnalytics from './ConvictionsAnalytics';
import { Select, SelectValue, SelectTrigger, SelectContent, SelectItem } from '../../Select/Select';
import VotesAnalytics from './VotesAnalytics';

function PostAnalytics({ proposalType, index }: { proposalType: EProposalType; index: number }) {
	const t = useTranslations('PostDetails');
	const { userPreferences } = useUserPreferences();
	const { theme } = userPreferences;
	const [selectedAnalytics, setSelectedAnalytics] = useState<EAnalyticsType>(EAnalyticsType.CONVICTIONS);
	const getPostAnalytics = async () => {
		const { data, error } = await NextApiClientService.getPostAnalytics({ proposalType: proposalType as EProposalType, index: index.toString() });
		if (error || !data) {
			throw new ClientError(error?.message || 'Failed to fetch data');
		}
		return data;
	};

	const { data: analytics, isFetching } = useQuery({
		queryKey: ['postAnalytics', proposalType, index],
		queryFn: getPostAnalytics,
		enabled: !!proposalType && !!index,
		staleTime: FIVE_MIN_IN_MILLI
	});

	const options = [
		{ label: t('Analytics.convictionsAnalytics'), value: EAnalyticsType.CONVICTIONS },
		{ label: t('Analytics.votesAnalytics'), value: EAnalyticsType.VOTES },
		{ label: t('Analytics.accountsAnalytics'), value: EAnalyticsType.ACCOUNTS }
	];

	return (
		<div>
			{isFetching ? (
				<Skeleton className='h-[500px] w-full' />
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
							<div className={classes.analyticsItem}>{analytics?.convictionsAnalytics && <ConvictionsAnalytics convictionsAnalytics={analytics.convictionsAnalytics} />}</div>
						)}
						{selectedAnalytics === EAnalyticsType.VOTES && (
							<div className={classes.analyticsItem}>{analytics?.votesAnalytics && <VotesAnalytics votesAnalytics={analytics.votesAnalytics} />}</div>
						)}
					</div>
				</div>
			)}
		</div>
	);
}

export default PostAnalytics;
