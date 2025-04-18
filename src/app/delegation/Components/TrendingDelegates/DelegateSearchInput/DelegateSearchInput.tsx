// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Input } from '@/app/_shared-components/Input';
import { Search } from 'lucide-react';
import { memo, useCallback, ChangeEvent, KeyboardEvent, RefObject } from 'react';
import { useTranslations } from 'next-intl';

interface SearchInputProps {
	searchInputRef: RefObject<HTMLInputElement>;
	searchTerm: string;
	handleSearchChange: (value: string) => void;
}

function DelegateSearchInput({ searchInputRef, searchTerm, handleSearchChange }: SearchInputProps) {
	const t = useTranslations('Delegation');

	const handleInputChange = useCallback(
		(e: ChangeEvent<HTMLInputElement>) => {
			const { value } = e.target;
			handleSearchChange(value);
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[]
	);

	return (
		<div className='flex w-full items-center rounded-lg border border-border_grey bg-transparent px-2'>
			<Search
				size={20}
				className='text-text_grey'
			/>
			<Input
				ref={searchInputRef}
				placeholder={t('enterUsernameOrAddressToDelegateVote')}
				defaultValue={searchTerm}
				onChange={handleInputChange}
				className='border-none shadow-none sm:py-2'
				onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
					e.stopPropagation();
				}}
			/>
		</div>
	);
}

export default memo(DelegateSearchInput);
