// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import React, { useState } from 'react';
import { IoMdClose } from '@react-icons/all-files/io/IoMdClose';
import { Button } from '@/app/_shared-components/Button';
import styles from './InfoNudge.module.scss';

function InfoNudge() {
	const [isInfoOpen, setIsInfoOpen] = useState(true);

	return (
		<div className={`${styles.container} ${isInfoOpen ? '' : '!hidden'}`}>
			<div className='flex items-start justify-between gap-10'>
				<h2 className={styles.infoTitle}>💡 New to Treasury Analytics?</h2>
				<Button
					variant='ghost'
					size='icon'
					className='cursor-pointer !p-0'
					onClick={() => setIsInfoOpen((prev) => !prev)}
				>
					<IoMdClose className='size-6 text-text_primary' />
				</Button>
			</div>
			<div className='flex flex-col justify-between gap-6 lg:flex-row'>
				<div className={styles.infoCard}>
					<h3 className={styles.infoCardTitle}>What is Treasury?</h3>
					<p className={styles.infoCardText}>A decentralized fund controlled by DOT holders through governance, funded by network inflation and fees.</p>
				</div>
				<div className={styles.infoCard}>
					<h3 className={styles.infoCardTitle}>What does &quot;Burn&quot; mean?</h3>
					<p className={styles.infoCardText}>Permanent removal of tokens from circulation, making remaining tokens more scarce and valuable.</p>
				</div>
				<div className={styles.infoCard}>
					<h3 className={styles.infoCardTitle}>What is Coretime?</h3>
					<p className={styles.infoCardText}>Computational time on Polkadot cores that parachains purchase to process transactions.</p>
				</div>
			</div>
		</div>
	);
}

export default InfoNudge;
