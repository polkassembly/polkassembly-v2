// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ChangeEvent, memo, RefObject } from 'react';
import { useTranslations } from 'next-intl';
import { Input } from '../Input';
import styles from './NetworkDropdown.module.scss';

const NetworkInput = memo(
	({
		searchInputRef,
		searchTerm,
		handleSearchChange
	}: {
		searchInputRef: RefObject<HTMLInputElement>;
		searchTerm: string;
		handleSearchChange: (e: ChangeEvent<HTMLInputElement>) => void;
	}) => {
		const t = useTranslations('Header');
		return (
			<div className={styles.fixedInputContainer}>
				<Input
					ref={searchInputRef}
					type='text'
					placeholder={t('searchNetworks')}
					value={searchTerm}
					onChange={handleSearchChange}
					className='mb-2'
					onKeyDown={(e) => {
						e.stopPropagation();
					}}
					onBlur={() => {
						searchInputRef.current?.focus();
					}}
				/>
			</div>
		);
	}
);

export default NetworkInput;
