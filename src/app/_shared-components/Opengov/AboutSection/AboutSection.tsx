// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import styles from './AboutSection.module.scss';
import Socials from './Socials/Socials';

function AboutSection() {
	return (
		<div className={styles.contentWrapper}>
			<div className={styles.header}>
				<h3 className={styles.title}>About</h3>
				<Socials />
			</div>
			<p className={styles.content}>Join our Community to discuss, contribute and get regular updates from us!</p>
		</div>
	);
}

export default AboutSection;
