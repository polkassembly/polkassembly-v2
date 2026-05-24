// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useSearchParams, usePathname } from 'next/navigation';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'nextjs-toploader/app';
import { Search, CheckSquare } from 'lucide-react';
import { FaFilter } from '@react-icons/all-files/fa/FaFilter';
import { Popover, PopoverTrigger, PopoverContent } from '@/app/_shared-components/Popover/Popover';
import { EProxyType } from '@/_shared/types';
import { Input } from '../../../_shared-components/Input';
import { Button } from '../../../_shared-components/Button';
import styles from './SearchBar.module.scss';

function SearchBar({ searchKey = 'allSearch' }: { searchKey?: string }) {
	const t = useTranslations();
	const searchParams = useSearchParams();
	const router = useRouter();
	const pathname = usePathname();
	const [inputValue, setInputValue] = useState(searchParams.get(searchKey) || '');
	const [activeFilters, setActiveFilters] = useState<EProxyType[]>(() => {
		const types = searchParams.get('types');
		return types ? (types.split(',') as EProxyType[]) : [];
	});

	const handleReset = () => {
		setActiveFilters([]);
		const params = new URLSearchParams(Array.from(searchParams.entries()));
		params.delete('types');
		router.push(`${pathname}?${params.toString()}`);
	};

	const handleSearch = () => {
		const params = new URLSearchParams(Array.from(searchParams.entries()));
		if (inputValue) {
			params.set(searchKey, inputValue);
			params.set('page', '1'); // Reset to first page on new search
		} else {
			params.delete(searchKey);
		}
		// Remove the other tab's search param to avoid cross-filtering
		const otherKey = searchKey === 'allSearch' ? 'myProxiesSearch' : 'allSearch';
		params.delete(otherKey);
		router.push(`${pathname}?${params.toString()}`);
	};

	const toggleFilter = (type: EProxyType) => {
		let updatedFilters: EProxyType[];
		if (activeFilters.includes(type)) {
			updatedFilters = activeFilters.filter((t) => t !== type);
		} else {
			updatedFilters = [...activeFilters, type];
		}
		setActiveFilters(updatedFilters);

		const params = new URLSearchParams(Array.from(searchParams.entries()));
		if (updatedFilters.length > 0) {
			params.set('types', updatedFilters.join(','));
		} else {
			params.delete('types');
		}
		params.set('page', '1'); // Reset to first page on filter change
		router.push(`${pathname}?${params.toString()}`);
	};

	return (
		<div className={styles.container}>
			<div className='relative flex-1'>
				<Input
					className='h-9 w-full pr-12 sm:pr-12'
					value={inputValue}
					onChange={(e) => setInputValue(e.target.value)}
					placeholder={t('Proxies.searchByAddress')}
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

			<Popover>
				<PopoverTrigger asChild>
					<Button
						variant='outline'
						className='flex h-10 w-10 items-center justify-center'
					>
						<FaFilter className='text-lg text-text_pink' />
					</Button>
				</PopoverTrigger>
				<PopoverContent className='w-[200px] border-border_grey p-2'>
					<div className='flex items-center justify-between gap-5'>
						<span className='px-2 text-xs font-semibold uppercase text-basic_text opacity-70'>{t('Proxies.proxyType')}</span>
						<Button
							variant='ghost'
							size='sm'
							className='text-xs font-medium text-text_pink'
							onClick={handleReset}
						>
							{t('Delegation.clearAll')}
						</Button>
					</div>
					<div className='mt-2 w-full space-y-4'>
						{Object.values(EProxyType).map((source) => (
							<button
								type='button'
								key={source}
								onClick={() => toggleFilter(source)}
								className='flex w-full cursor-pointer items-center justify-between gap-5 px-2 text-xs text-basic_text'
							>
								<span className='capitalize'>{source}</span>
								<CheckSquare className={`h-4 w-4 ${activeFilters.includes(source) ? 'text-text_pink' : 'text-accent_blue'}`} />
							</button>
						))}
					</div>
				</PopoverContent>
			</Popover>
		</div>
	);
}

export default SearchBar;
