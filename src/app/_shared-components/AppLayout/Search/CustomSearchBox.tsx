// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Input } from '@ui/Input';
import { IoIosSearch } from 'react-icons/io';
import { useSearchBox, UseSearchBoxProps } from 'react-instantsearch';
import { KeyboardEvent, useRef, useState, useCallback, FocusEvent, useMemo, memo, ChangeEvent } from 'react';
import debounce from 'lodash/debounce';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { ESearchType } from '@/_shared/types';
import SearchSuggestions from './SearchSuggestions';
import styles from './Search.module.scss';

interface CustomSearchBoxProps extends UseSearchBoxProps {
	onSearch: (query: string) => void;
	onTypeChange: (type: ESearchType | null) => void;
}

interface SearchState {
	inputValue: string;
	showSuggestions: boolean;
}

function CustomSearchBox({ onSearch, onTypeChange, ...props }: CustomSearchBoxProps) {
	const { query, refine } = useSearchBox(props);
	const t = useTranslations('Search');
	const [searchState, setSearchState] = useState<SearchState>({
		inputValue: query,
		showSuggestions: false
	});
	const inputRef = useRef<HTMLInputElement>(null);
	const { inputValue, showSuggestions } = searchState;

	const debouncedSearch = useMemo(() => {
		const search = debounce((value: string) => {
			refine(value);
		}, 300);

		return (value: string) => {
			setSearchState((prev) => ({
				...prev,
				inputValue: value,
				showSuggestions: value.length >= 3
			}));
			if (value.length >= 3) {
				search(value);
			}
		};
	}, [refine]);

	const handleInputChange = useCallback(
		(e: ChangeEvent<HTMLInputElement>) => {
			debouncedSearch(e.target.value);
		},
		[debouncedSearch]
	);

	const handleSearch = useCallback(() => {
		if (inputValue.length >= 3) {
			setSearchState((prev) => ({ ...prev, showSuggestions: false }));
			refine(inputValue);
			onSearch(inputValue);
		}
	}, [inputValue, refine, onSearch]);

	const handleKeyDown = useCallback(
		(e: KeyboardEvent<HTMLInputElement>) => {
			e.stopPropagation();
			if (e.key === 'Enter') {
				handleSearch();
			}
		},
		[handleSearch]
	);

	const handleSuggestionClick = useCallback(
		(value: string, type: ESearchType) => {
			setSearchState({
				inputValue: value,
				showSuggestions: false
			});
			refine(value);
			onSearch(value);
			onTypeChange(type);
			inputRef.current?.focus();
		},
		[refine, onSearch, onTypeChange]
	);

	const handleFocus = useCallback(() => {
		setSearchState((prev) => ({
			...prev,
			showSuggestions: prev.inputValue.length >= 3
		}));
	}, []);

	const handleBlur = useCallback((e: FocusEvent<HTMLInputElement>) => {
		if (!e.relatedTarget?.closest('.search-area')) {
			requestAnimationFrame(() => {
				setSearchState((prev) => ({
					...prev,
					showSuggestions: false
				}));
			});
		}
	}, []);

	const inputProps = useMemo(
		() => ({
			value: inputValue,
			onChange: handleInputChange,
			onKeyDown: handleKeyDown,
			className: styles.search_input,
			placeholder: t('placeholder'),
			onFocus: handleFocus,
			onBlur: handleBlur,
			autoComplete: 'off' as const
		}),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[inputValue, handleInputChange, handleKeyDown, handleFocus, handleBlur]
	);

	const searchButtonProps = useMemo(
		() => ({
			className: styles.search_button,
			onClick: handleSearch
		}),
		[handleSearch]
	);

	return (
		<div className='search-area relative'>
			<Input
				{...inputProps}
				ref={inputRef}
			/>
			<button
				type='button'
				{...searchButtonProps}
			>
				<IoIosSearch className='text-xl text-btn_primary_text' />
			</button>
			{showSuggestions && (
				<div className={cn(styles.search_suggestions_wrapper, 'search-suggestions search-area')}>
					<SearchSuggestions
						query={inputValue}
						onSuggestionClick={handleSuggestionClick}
					/>
				</div>
			)}
		</div>
	);
}

export default memo(CustomSearchBox);
