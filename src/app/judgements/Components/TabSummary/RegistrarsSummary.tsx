// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useTranslations } from 'next-intl';
import styles from './TabSummary.module.scss';
import SearchBar from '../SearchBar/SearchBar';

function RegistrarsSummary() {
	const t = useTranslations();

	return (
		<div className={styles.container}>
			<p className={styles.description}>{t('Judgements.registrarDescription')}</p>
			<SearchBar searchKey='registrarSearch' />
		</div>
	);
}

export default RegistrarsSummary;
