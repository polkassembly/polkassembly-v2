// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import React from 'react';
import InfoIcon from '@/_assets/icons/Treasury/info-icon.svg';
import ArrowIcon from '@/_assets/icons/Treasury/arrow-icon.svg';
import UpArrowIcon from '@/_assets/icons/Treasury/up-arrow-icon.svg';
import DownArrowIcon from '@/_assets/icons/Treasury/down-arrow-icon.svg';
import Image from 'next/image';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { ENetwork } from '@/_shared/types';
import useCurrentTokenPrice from '@/hooks/Treasury/useCurrentTokenPrice';
import useWeeklyPriceChange from '@/hooks/Treasury/useWeeklyPriceChange';
import TokenDetails from './TokenDetails/TokenDetails';
import styles from './TreasuryBalance.module.scss';

function TreasuryBalance() {
	const currentTokenPrice = useCurrentTokenPrice(ENetwork.POLKADOT);

	const weeklyPriceChange = useWeeklyPriceChange(ENetwork.POLKADOT, currentTokenPrice);

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
					<span className={styles.price}>${currentTokenPrice.isLoading ? 'Loading...' : currentTokenPrice.value}</span>
					{weeklyPriceChange.value !== 'N/A' && (
						<div className={`${styles.change} ${Number(weeklyPriceChange.value) < 0 ? styles.negative : styles.positive}`}>
							<span>{Math.abs(Number(weeklyPriceChange.value))}%</span>
							{Number(weeklyPriceChange.value) < 0 ? (
								<Image
									src={DownArrowIcon}
									alt='Down'
									width={16}
									height={16}
									className={styles.downArrow}
								/>
							) : (
								<Image
									src={UpArrowIcon}
									alt='Up'
									width={16}
									height={16}
									className={styles.upArrow}
								/>
							)}
						</div>
					)}
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
}

export default TreasuryBalance;
