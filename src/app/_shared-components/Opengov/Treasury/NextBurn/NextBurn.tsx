import React from 'react';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { ENetwork } from '@/_shared/types';
import styles from './NextBurn.module.scss';

const NextBurn = () => {
	return (
		<div className={styles.nextBurnWrapper}>
			<div className={styles.contentWrapper}>
				<div className={styles.title}>Next Burn</div>
				<div className={styles.amountContainer}>
					<div className={styles.amountWrapper}>
						<span className={styles.amount}>122.71K</span>
						<span className={styles.tokenSymbol}>{NETWORKS_DETAILS?.[ENetwork.POLKADOT]?.tokenSymbol}</span>
					</div>
				</div>
			</div>
			<p className={`${styles.description} dark ${styles.darkMode}`}>
				If the Treasury ends a spend period without spending all of its funds, it suffers a burn of a percentage of its funds.
			</p>
		</div>
	);
};

export default NextBurn;
