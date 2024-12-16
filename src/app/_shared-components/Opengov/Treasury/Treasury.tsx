// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import styles from './Treasury.module.scss';
import SpendPeriod from './SpendPeriod/SpendPeriod';
import NextBurn from './NextBurn/NextBurn';
import { Separator } from '../../Separator';
import TreasuryBalance from './TreasuryBalance/TreasuryBalance';

function Treasury() {
	return (
		<main className={styles.main}>
			<section className={styles.contentWrapper}>
				<TreasuryBalance />
			</section>
			<section className={styles.contentWrapper}>
				<SpendPeriod />
				<Separator className='my-3 w-auto bg-sidebar-border' />
				<NextBurn />
			</section>
		</main>
	);
}

export default Treasury;
