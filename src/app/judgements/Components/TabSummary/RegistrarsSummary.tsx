// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Separator } from '@/app/_shared-components/Separator';
import JudgementRequestedIcon from '@assets/icons/judgement-requests.svg';
import JudgementCompletedIcon from '@assets/icons/judgements-completed.svg';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import styles from './TabSummary.module.scss';
import SearchBar from '../SearchBar/SearchBar';

interface IRegistrarsSummaryProps {
	stats:
		| {
				totalJudgementsGranted: number;
				totalRegistrars: number;
		  }
		| undefined;
	isError: boolean;
}

function RegistrarsSummary({ stats, isError }: IRegistrarsSummaryProps) {
	const t = useTranslations('Judgements');

	const totalJudgementsGranted = stats?.totalJudgementsGranted || 0;
	const totalRegistrars = stats?.totalRegistrars || 0;

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
						<p className={styles.statsLabel}>{t('judgementsGranted')}</p>
						<p className={styles.statsValue}>{isError ? <span className={styles.statsNumber}>-</span> : <span className={styles.statsNumber}>{totalJudgementsGranted}</span>}</p>
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
						<p className={styles.statsLabel}>{t('registrars')}</p>
						<p className={styles.completedValue}>{isError ? <span className={styles.statsNumber}>-</span> : <span className={styles.statsNumber}>{totalRegistrars}</span>}</p>
					</div>
				</div>
			</div>
			<SearchBar searchKey='registrarSearch' />
		</div>
	);
}

export default RegistrarsSummary;
