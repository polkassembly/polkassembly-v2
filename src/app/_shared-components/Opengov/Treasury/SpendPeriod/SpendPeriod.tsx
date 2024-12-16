// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import React from 'react';
import Image from 'next/image';
import InfoIcon from '@/_assets/icons/Treasury/info-icon.svg';
import { ENetwork } from '@/_shared/types';
import { useSpendPeriod } from '@/hooks/Treasury/useSpendPeriod';
import { LoadingSpinner } from '@/app/_shared-components/LoadingSpinner';
import styles from './SpendPeriod.module.scss';

function SpendPeriod() {
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
				</div>
			)}
		</section>
	);
}

export default SpendPeriod;
