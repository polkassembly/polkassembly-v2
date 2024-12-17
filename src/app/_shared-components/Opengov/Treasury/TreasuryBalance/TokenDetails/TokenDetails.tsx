// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import Image from 'next/image';
import { ENetwork } from '@/_shared/types';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import DotIcon from '@/_assets/icons/Treasury/dot-icon.svg';
import MythIcon from '@/_assets/icons/Treasury/myth-icon.svg';
import UsdcIcon from '@/_assets/icons/Treasury/usdc-icon.svg';
import UsdtIcon from '@/_assets/icons/Treasury/usdt-icon.svg';
import useCurrentTokenPrice from '@/hooks/Treasury/useCurrentTokenPrice';
import useTreasuryAvailableBalance from '@/hooks/Treasury/useTreasuryAvailableBalance';
import styles from './TokenDetails.module.scss';

function TokenDetails() {
	const unit = NETWORKS_DETAILS?.[ENetwork.POLKADOT]?.tokenSymbol;

	const currentTokenPrice = useCurrentTokenPrice(ENetwork.POLKADOT);
	const availableBalance = useTreasuryAvailableBalance(ENetwork.POLKADOT, currentTokenPrice);

	return (
		<div className={styles.tokenDetailsWrapper}>
			<div className={styles.tokenGroup}>
				<div className={`${styles.tokenGroup} ${styles.noWrap}`}>
					<Image
						alt='relay icon'
						width={16}
						height={16}
						src={DotIcon}
						className={styles.tokenIcon}
					/>
					{availableBalance.isLoading ? (
						<span className={`${styles.tokenText} darkMode`}>Loading...</span>
					) : (
						<span className={`${styles.tokenText} darkMode`}>{availableBalance.value}</span>
					)}
					<span className={styles.unit}>{unit}</span>
				</div>
				<div className={`${styles.tokenGroup} ${styles.noWrap}`}>
					<Image
						alt='relay icon'
						width={16}
						height={16}
						src={UsdcIcon}
						className={`${styles.tokenIcon} ml-[3px]`}
					/>
					<span className={`${styles.tokenText} darkMode`}>8.07</span>
					<span className={styles.unit}>USDC</span>
				</div>
			</div>

			<div className={styles.mythGroup}>
				<div className={`${styles.tokenGroup} ${styles.noWrap}`}>
					<Image
						alt='relay icon'
						width={16}
						height={16}
						src={UsdtIcon}
						className={`${styles.tokenIcon} ml-[3px]`}
					/>
					<span className={`${styles.tokenText} darkMode`}>9.36M</span>
					<span className={styles.unit}>USDt</span>
				</div>
				<div className={`${styles.tokenGroup} ${styles.noWrap}`}>
					<Image
						src={MythIcon}
						width={15}
						height={15}
						alt='icon'
						className={`${styles.tokenIcon} ml-[3px]`}
					/>
					<span className={`${styles.tokenText} darkMode`}>4.88M MYTH</span>
				</div>
			</div>
		</div>
	);
}

export default TokenDetails;
