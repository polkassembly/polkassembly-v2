// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Input } from '@ui/Input';
import { IoIosSearch } from 'react-icons/io';
import { useSearchBox, UseSearchBoxProps } from 'react-instantsearch';
import { KeyboardEvent, useRef, useState, useCallback, useEffect, FocusEvent, useMemo } from 'react';
import debounce from 'lodash/debounce';
import { ESearchType } from '@/_shared/types';
import SearchSuggestions from './SearchSuggestions';

interface CustomSearchBoxProps extends UseSearchBoxProps {
	onSearch: (query: string) => void;
	onTypeChange: (type: ESearchType | null) => void;
}

export default function CustomSearchBox({ onSearch, onTypeChange, ...props }: CustomSearchBoxProps) {
	const { query, refine } = useSearchBox(props);
	const [inputValue, setInputValue] = useState(query);
	const [showSuggestions, setShowSuggestions] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);

	const debouncedRefine = useMemo(
		() =>
			debounce((value: string) => {
				refine(value);
			}, 300),
		[refine]
	);

	useEffect(() => {
		return () => {
			debouncedRefine.cancel();
		};
	}, [debouncedRefine]);

	const handleInputChange = useCallback(
		(value: string) => {
			setInputValue(value);
			if (value.length >= 3) {
				setShowSuggestions(true);
				debouncedRefine(value);
			} else {
				setShowSuggestions(false);
			}
		},
		[debouncedRefine]
	);

	const handleSearch = useCallback(() => {
		setShowSuggestions(false);
		refine(inputValue);
		onSearch(inputValue);
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
			setInputValue(value);
			setShowSuggestions(false);
			refine(value);
			onSearch(value);
			onTypeChange(type);
			inputRef.current?.focus();
		},
		[refine, onSearch, onTypeChange]
	);

	const handleFocus = useCallback(() => {
		if (inputValue.length >= 3) {
			setShowSuggestions(true);
		}
	}, [inputValue.length]);

	const handleBlur = useCallback((e: FocusEvent<HTMLInputElement>) => {
		if (!e.relatedTarget?.closest('.search-area')) {
			setTimeout(() => {
				setShowSuggestions(false);
			}, 200);
		}
	}, []);

	return (
		<div className='search-area relative'>
			<Input
				value={inputValue}
				onChange={(e) => handleInputChange(e.target.value)}
				onKeyDown={handleKeyDown}
				className='border-bg_pink pr-10 placeholder:text-text_primary'
				placeholder='Type here to search for something'
				ref={inputRef}
				onFocus={handleFocus}
				onBlur={handleBlur}
				autoComplete='off'
			/>
			<button
				type='button'
				className='absolute right-0 top-1/2 h-10 -translate-y-1/2 cursor-pointer rounded-r-md bg-bg_pink p-2'
				onClick={handleSearch}
			>
				<IoIosSearch className='text-xl text-btn_primary_text' />
			</button>
			{showSuggestions && (
				<div className='search-suggestions search-area'>
					<SearchSuggestions
						query={inputValue}
						onSuggestionClick={handleSuggestionClick}
					/>
				</div>
			)}
		</div>
	);
}
