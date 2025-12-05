// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useSearchParams, usePathname } from 'next/navigation';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'nextjs-toploader/app';
import { Search } from 'lucide-react';
import { Input } from '../../../_shared-components/Input';
import { Button } from '../../../_shared-components/Button';

function SearchBar({ searchKey = 'dashboardSearch' }: { searchKey?: string }) {
	const t = useTranslations();
	const searchParams = useSearchParams();
	const router = useRouter();
	const pathname = usePathname();
	const [inputValue, setInputValue] = useState(searchParams.get(searchKey) || '');

	const handleSearch = () => {
		const params = new URLSearchParams(Array.from(searchParams.entries()));
		if (inputValue) {
			params.set(searchKey, inputValue);
			params.set('page', '1');
		} else {
			params.delete(searchKey);
		}
		const otherKey = searchKey === 'dashboardSearch' ? 'registrarSearch' : 'dashboardSearch';
		params.delete(otherKey);
		router.push(`${pathname}?${params.toString()}`);
	};

	return (
		<div className='relative w-full sm:max-w-60 lg:max-w-xs'>
			<Input
				className='h-9 w-full pr-12 sm:pr-12'
				value={inputValue}
				onKeyDown={(e) => {
					if (e.key === 'Enter') {
						handleSearch();
					}
				}}
				onChange={(e) => setInputValue(e.target.value)}
				placeholder={t('Judgements.searchByAddressOrName')}
			/>
			<Button
				variant='ghost'
				size='icon'
				className='absolute right-0 top-0 h-full rounded-l-none border-l border-border_grey px-2 text-2xl text-text_grey'
				onClick={handleSearch}
			>
				<Search />
			</Button>
		</div>
	);
}

export default SearchBar;
