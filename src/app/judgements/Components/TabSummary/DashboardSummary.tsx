// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { Separator } from '@/app/_shared-components/Separator';
import JudgementRequestedIcon from '@assets/icons/judgement-requests.svg';
import JudgementCompletedIcon from '@assets/icons/judgements-completed.svg';
import GreenArrowTop from '@assets/icons/green-arrow-top.svg';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import styles from './TabSummary.module.scss';
import SearchBar from '../SearchBar/SearchBar';

function DashboardSummary() {
	const t = useTranslations();

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
							<span className={styles.statsNumber}>124</span>
							<Image
								src={GreenArrowTop}
								alt='Green Arrow Top'
								width={20}
								height={20}
							/>
							<span className={styles.statsPercentage}>12.8%</span>
							<span className={styles.statsPeriod}>{t('Judgements.thisMonth')}</span>
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
						<p className={styles.completedValue}>98%</p>
					</div>
				</div>
			</div>
			<SearchBar />
		</div>
	);
}

export default DashboardSummary;
