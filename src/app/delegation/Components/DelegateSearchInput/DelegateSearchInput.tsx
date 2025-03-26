// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Input } from '@/app/_shared-components/Input';
import { Search } from 'lucide-react';
import { memo, useState, useEffect, ChangeEvent, KeyboardEvent, RefObject } from 'react';
import { useTranslations } from 'next-intl';
import styles from './DelegateSearchInput.module.scss';

interface SearchInputProps {
	searchInputRef: RefObject<HTMLInputElement>;
	searchTerm: string;
	handleSearchChange: (value: string) => void;
}

function DelegateSearchInput({ searchInputRef, searchTerm, handleSearchChange }: SearchInputProps) {
	const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);

	const t = useTranslations('Delegation');
	const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
		const { value } = e.target;
		setLocalSearchTerm(value);
	};

	useEffect(() => {
		const timer = setTimeout(() => {
			handleSearchChange(localSearchTerm);
		}, 300);

		return () => clearTimeout(timer);
	}, [localSearchTerm, handleSearchChange]);

	return (
		<div className={styles.searchInputContainer}>
			<Search className={styles.searchIcon} />
			<Input
				ref={searchInputRef}
				placeholder={t('enterUsernameOrAddressToDelegateVote')}
				value={localSearchTerm}
				onChange={handleInputChange}
				className='pl-10'
				onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
					e.stopPropagation();
				}}
			/>
		</div>
	);
}

export default memo(DelegateSearchInput);
