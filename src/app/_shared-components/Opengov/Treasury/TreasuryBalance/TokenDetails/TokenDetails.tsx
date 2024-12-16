import React from 'react';
import Image from 'next/image';
import { ENetwork } from '@/_shared/types';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import DotIcon from '@/_assets/icons/Treasury/dot-icon.svg';
import MythIcon from '@/_assets/icons/Treasury/myth-icon.svg';
import UsdcIcon from '@/_assets/icons/Treasury/usdc-icon.svg';
import UsdtIcon from '@/_assets/icons/Treasury/usdt-icon.svg';
import styles from './TokenDetails.module.scss';

const TokenDetails = () => {
	const unit = NETWORKS_DETAILS?.[ENetwork.POLKADOT]?.tokenSymbol;
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
					<span className={`${styles.tokenText} darkMode`}>29.35M</span>
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
};

export default TokenDetails;
