// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import React from 'react';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { ENetwork } from '@/_shared/types';
import { useNextBurn } from '@/hooks/Treasury/useNextBurn';
import useCurrentTokenPrice from '@/hooks/Treasury/useCurrentTokenPrice';
import styles from './NextBurn.module.scss';

function NextBurn() {
	const currentTokenPrice = useCurrentTokenPrice(ENetwork.POLKADOT);
	const { isLoading, value, valueUSD } = useNextBurn(ENetwork.POLKADOT, currentTokenPrice);

	return (
		<div className={styles.nextBurnWrapper}>
			<div className={styles.contentWrapper}>
				<div className={styles.title}>Next Burn</div>
				{isLoading ? (
					<div className={styles.loading}>Loading...</div>
				) : (
					<div className={styles.amountContainer}>
						<div className={styles.amountWrapper}>
							<span className={styles.amount}>{value}</span>
							<span className={styles.tokenSymbol}>{NETWORKS_DETAILS?.[ENetwork.POLKADOT]?.tokenSymbol}</span>
						</div>
						{valueUSD && <span className={styles.amountUSD}>~ {valueUSD}</span>}
					</div>
				)}
			</div>
			<p className={`${styles.description}`}>If the Treasury ends a spend period without spending all of its funds, it suffers a burn of a percentage of its funds.</p>
		</div>
	);
}

export default NextBurn;
