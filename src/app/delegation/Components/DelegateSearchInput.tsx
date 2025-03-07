// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Input } from '@/app/_shared-components/Input';
import { Search } from 'lucide-react';
import { memo, useState, useEffect, ChangeEvent, KeyboardEvent, RefObject } from 'react';

interface SearchInputProps {
	searchInputRef: RefObject<HTMLInputElement>;
	searchTerm: string;
	handleSearchChange: (value: string) => void;
}

function DelegateSearchInput({ searchInputRef, searchTerm, handleSearchChange }: SearchInputProps) {
	const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);

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
		<div className='relative w-full'>
			<Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500' />
			<Input
				ref={searchInputRef}
				placeholder='Enter username or address to Delegate vote'
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
