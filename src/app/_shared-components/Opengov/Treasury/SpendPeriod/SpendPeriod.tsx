'use client';
import React from 'react';
import Image from 'next/image';
import InfoIcon from '@/_assets/icons/Treasury/info-icon.svg';
import styles from './SpendPeriod.module.scss';
import { ENetwork } from '@/_shared/types';
import { useSpendPeriod } from '@/hooks/Treasury/useSpendPeriod';
import { LoadingSpinner } from '@/app/_shared-components/LoadingSpinner';

const SpendPeriod = () => {
	const spendPeriod = useSpendPeriod(ENetwork.POLKADOT);
	return (
		<section className={styles.spendPeriodWrapper}>
			<div className={styles.flexContainer}>
				<span className={styles.title}>Spend Period Remaining</span>
				<Image
					src={InfoIcon}
					alt='Info'
					width={16}
					height={16}
					className={styles.infoIcon}
				/>
			</div>
			{spendPeriod.isLoading ? (
				<LoadingSpinner size='small' />
			) : (
				<div className={`${styles.remainingTime} darkMode`}>
					<>
						<div className={styles.timeSection}>
							<span className={styles.amount}>{spendPeriod.value.days}&nbsp;</span>
							<span className={`${styles.unit} darkMode`}>days&nbsp;</span>
						</div>
						<div className={styles.timeSection}>
							<span className={styles.amount}>{spendPeriod.value.hours}&nbsp;</span>
							<span className={`${styles.unit} darkMode`}>hrs&nbsp;</span>
						</div>
						<div className={styles.timeSection}>
							<span className={styles.amount}>{spendPeriod.value.minutes}&nbsp;</span>
							<span className={styles.unit}>mins&nbsp;</span>
						</div>
						<span className={styles.separator}>/ {spendPeriod.value.total} days </span>
					</>
				</div>
			)}
		</section>
	);
};

export default SpendPeriod;
