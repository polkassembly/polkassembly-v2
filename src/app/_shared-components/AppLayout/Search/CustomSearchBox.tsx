// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Input } from '@ui/Input';
import { IoIosSearch } from 'react-icons/io';
import { useSearchBox, UseSearchBoxProps } from 'react-instantsearch';
import { KeyboardEvent, RefObject, useRef, useState } from 'react';
import SearchSuggestions from './SearchSuggestions';

interface CustomSearchBoxProps extends UseSearchBoxProps {
	onSearch: (query: string) => void;
}

export default function CustomSearchBox({ onSearch, ...props }: CustomSearchBoxProps) {
	const { query, refine } = useSearchBox(props);
	const [inputValue, setInputValue] = useState(query);
	const [showSuggestions, setShowSuggestions] = useState(true);
	const inputRef = useRef<HTMLInputElement>(null);

	function setQuery(newQuery: string) {
		setInputValue(newQuery);
		refine(newQuery);
	}

	const handleSearch = () => {
		setShowSuggestions(false);
		refine(inputValue);
		onSearch(inputValue);
	};

	const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
		e.stopPropagation();
		if (e.key === 'Enter') {
			handleSearch();
		}
	};

	const handleSuggestionClick = (value: string) => {
		setQuery(value);
		setShowSuggestions(false);
		refine(value);
		onSearch(value);
	};

	return (
		<div className='relative'>
			<Input
				value={inputValue}
				onChange={(e) => {
					setQuery(e.target.value);
					setShowSuggestions(true);
				}}
				onKeyDown={handleKeyDown}
				className='border-bg_pink pr-10 placeholder:text-text_primary'
				placeholder='Type here to search for something'
				ref={inputRef as RefObject<HTMLInputElement>}
				onFocus={() => {
					inputRef.current?.focus();
				}}
				onBlur={() => {
					inputRef.current?.focus();
				}}
			/>
			<button
				type='button'
				className='absolute right-0 top-1/2 h-10 -translate-y-1/2 cursor-pointer rounded-r-md bg-bg_pink p-2'
				onClick={handleSearch}
			>
				<IoIosSearch className='text-xl text-white' />
			</button>
			{showSuggestions && (
				<SearchSuggestions
					query={inputValue}
					onSuggestionClick={handleSuggestionClick}
				/>
			)}
		</div>
	);
}
