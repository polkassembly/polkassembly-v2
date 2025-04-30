// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Input } from '@ui/Input';
import { IoIosSearch } from '@react-icons/all-files/io/IoIosSearch';
import { useSearchBox, UseSearchBoxProps } from 'react-instantsearch';
import { KeyboardEvent, useRef, useCallback, memo, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useDebounce } from '@/hooks/useDebounce';
import styles from './Search.module.scss';

interface CustomSearchBoxProps extends UseSearchBoxProps {
	onSearch: (query: string) => void;
}

function CustomSearchBox({ onSearch, ...props }: CustomSearchBoxProps) {
	const { query, refine } = useSearchBox(props);
	const t = useTranslations('Search');
	const inputRef = useRef<HTMLInputElement>(null);

	const { value: searchTerm, debouncedValue: debouncedSearchTerm, setValue: setSearchTerm } = useDebounce<string>(query, 300);

	const handleSearch = useCallback(() => {
		if (debouncedSearchTerm.length >= 3) {
			refine(debouncedSearchTerm);
			onSearch(debouncedSearchTerm);
		}
	}, [debouncedSearchTerm, refine, onSearch]);

	useEffect(() => {
		handleSearch();
	}, [handleSearch]);

	const handleKeyDown = useCallback(
		(e: KeyboardEvent<HTMLInputElement>) => {
			e.stopPropagation();
			if (e.key === 'Enter') {
				handleSearch();
			}
		},
		[handleSearch]
	);

	return (
		<div className='search-area relative'>
			<Input
				value={searchTerm}
				onChange={(e) => setSearchTerm(e.target.value)}
				onKeyDown={handleKeyDown}
				className={styles.search_input}
				placeholder={t('placeholder')}
				ref={inputRef}
				autoComplete='off'
			/>
			<button
				type='button'
				className={styles.search_button}
				onClick={handleSearch}
			>
				<IoIosSearch className='text-xl text-btn_primary_text' />
			</button>
		</div>
	);
}

export default memo(CustomSearchBox);
