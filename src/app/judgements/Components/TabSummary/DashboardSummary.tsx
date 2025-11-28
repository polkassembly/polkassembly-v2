// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { Separator } from '@/app/_shared-components/Separator';
import JudgementRequestedIcon from '@assets/icons/judgement-requests.svg';
import JudgementCompletedIcon from '@assets/icons/judgements-completed.svg';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Skeleton } from '@/app/_shared-components/Skeleton';
import { useQuery } from '@tanstack/react-query';
import { IJudgementStats } from '@/_shared/types';
import { FIVE_MIN_IN_MILLI } from '@/app/api/_api-constants/timeConstants';
import { useIdentityService } from '@/hooks/useIdentityService';
import { getJudgementStats } from '@/app/_client-utils/identityUtils';
import styles from './TabSummary.module.scss';
import SearchBar from '../SearchBar/SearchBar';

function DashboardSummary() {
	const t = useTranslations();

	const { identityService } = useIdentityService();
	const {
		data: stats,
		isLoading,
		isError
	} = useQuery<IJudgementStats>({
		queryKey: ['judgementStats'],
		queryFn: async () => {
			const allJudgements = await identityService!.getAllIdentityJudgements();
			return getJudgementStats(allJudgements);
		},
		staleTime: FIVE_MIN_IN_MILLI,
		retry: 3,
		refetchOnWindowFocus: false,
		enabled: !!identityService
	});

	const totalRequested = stats?.totalRequestedThisMonth || 0;
	const percentageCompleted = stats?.percentageCompletedThisMonth || 0;

	return (
		<div className={styles.container}>
			<div className={styles.dashboardContainer}>
				<div className={styles.statsContainer}>
					<Image
						src={JudgementRequestedIcon}
						alt='Judgement Requests'
						width={50}
						height={50}
					/>
					<div className={styles.statsContent}>
						<p className={styles.statsLabel}>{t('Judgements.judgementsRequested')}</p>
						<p className={styles.statsValue}>
							{isLoading ? (
								<Skeleton className='h-6 w-20' />
							) : isError ? (
								<span className={styles.statsNumber}>-</span>
							) : (
								<span className={styles.statsNumber}>{totalRequested}</span>
							)}
						</p>
					</div>
				</div>
				<Separator
					orientation='vertical'
					className='hidden h-11 md:block'
				/>
				<div className={styles.statsContainer}>
					<Image
						src={JudgementCompletedIcon}
						alt='Judgement Completed'
						width={50}
						height={50}
					/>
					<div className={styles.statsContent}>
						<p className={styles.statsLabel}>{t('Judgements.judgementsCompleted')}</p>
						<p className={styles.completedValue}>
							{isLoading ? <Skeleton className='h-6 w-20' /> : isError ? <span className={styles.statsNumber}>-</span> : `${percentageCompleted.toFixed(1)}%`}
						</p>
					</div>
				</div>
			</div>
			<SearchBar searchKey='dashboardSearch' />
		</div>
	);
}

export default DashboardSummary;
