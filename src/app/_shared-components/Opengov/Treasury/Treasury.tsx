// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import styles from './Treasury.module.scss';
import SpendPeriod from './SpendPeriod/SpendPeriod';
import NextBurn from './NextBurn/NextBurn';

function Treasury() {
	return (
		<main className={styles.main}>
			<section className={styles.contentWrapper}> treasury</section>
			<section className={styles.contentWrapper}>
				<SpendPeriod />
				<NextBurn />
			</section>
		</main>
	);
}

export default Treasury;
