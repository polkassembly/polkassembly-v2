import React from 'react';
import Image from 'next/image';
import InfoIcon from '@/_assets/icons/Treasury/info-icon.svg';
import styles from './SpendPeriod.module.scss';

const SpendPeriod = () => {
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
			<div className={`${styles.remainingTime} darkMode`}>
				<>
					<div className={styles.timeSection}>
						<span className={styles.amount}>23&nbsp;</span>
						<span className={`${styles.unit} darkMode`}>days&nbsp;</span>
					</div>
					<div className={styles.timeSection}>
						<span className={styles.amount}>5&nbsp;</span>
						<span className={`${styles.unit} darkMode`}>hrs&nbsp;</span>
					</div>
					<div className={styles.timeSection}>
						<span className={styles.amount}>20&nbsp;</span>
						<span className={styles.unit}>mins&nbsp;</span>
					</div>
					<span className={styles.separator}>/ 24 days </span>
				</>
			</div>
		</section>
	);
};

export default SpendPeriod;
