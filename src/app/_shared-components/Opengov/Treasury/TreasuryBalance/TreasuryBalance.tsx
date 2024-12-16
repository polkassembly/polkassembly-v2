import React from 'react';
import InfoIcon from '@/_assets/icons/Treasury/info-icon.svg';
import ArrowIcon from '@/_assets/icons/Treasury/arrow-icon.svg';
import Image from 'next/image';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { ENetwork } from '@/_shared/types';
import TokenDetails from './TokenDetails/TokenDetails';
import styles from './TreasuryBalance.module.scss';

const TreasuryBalance = () => {
	return (
		<main className={styles.treasuryBalanceWrapper}>
			<div className={styles.header}>
				<div className={styles.treasuryInfo}>
					<span className={styles.title}>Treasury</span>
					<Image
						src={InfoIcon}
						alt='Info'
						width={16}
						height={16}
						className={styles.infoIcon}
					/>
					<span className={styles.monthlyBadge}>Monthly</span>
				</div>
				<div className={styles.tokenPrice}>
					<span className={styles.tokenSymbol}>{NETWORKS_DETAILS?.[ENetwork.POLKADOT]?.tokenSymbol} Price</span>
					<span className={styles.price}>$8.95</span>
					<span className={styles.change}>15%</span>
				</div>
			</div>

			<div className={styles.detailsWrapper}>
				<div className={styles.detailsHeader}>
					<span className={styles.totalValue}>~$280.11M</span>
					<div className={styles.detailsLink}>
						<span className={styles.linkText}>Details</span>
						<Image
							src={ArrowIcon}
							alt='Details'
							width={16}
							height={16}
							className={styles.arrowIcon}
						/>
					</div>
				</div>
				<TokenDetails />
			</div>
		</main>
	);
};

export default TreasuryBalance;
