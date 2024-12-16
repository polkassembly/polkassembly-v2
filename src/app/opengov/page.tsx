// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import AboutSection from '../_shared-components/Opengov/AboutSection/AboutSection';
import styles from './opengov.module.scss';
import Treasury from '../_shared-components/Opengov/Treasury/Treasury';

function Opengov() {
	return (
		<main>
			<h1 className={styles.title}>Opengov</h1>
			<AboutSection />
			<Treasury />
		</main>
	);
}

export default Opengov;
