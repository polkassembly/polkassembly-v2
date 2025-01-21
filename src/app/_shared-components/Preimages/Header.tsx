// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useState } from 'react';
import { MdOutlineSearch } from 'react-icons/md';
import { useTranslations } from 'next-intl';
import { Input } from '../Input';
import { Button } from '../Button';

function Header({ data }: { data: { totalCount: number } }) {
	const t = useTranslations();
	const searchParams = useSearchParams();
	const router = useRouter();
	const pathname = usePathname();
	const [inputValue, setInputValue] = useState(searchParams.get('hash_contains') || '');

	const createQueryString = (name: string, value: string) => {
		const params = new URLSearchParams(searchParams.toString());
		if (value) {
			params.set(name, value);
		} else {
			params.delete(name);
		}
		return params.toString();
	};

	return (
		<div className='flex items-center justify-between'>
			<p className='text-2xl font-bold text-navbar_title'>
				{data?.totalCount} {t('Sidebar.preimages')}
			</p>
			<div className='flex items-center gap-2'>
				<div className='relative'>
					<Input
						className='h-8 overflow-x-auto pr-10'
						value={inputValue}
						onKeyDown={(e) => {
							if (e.key === 'Enter') {
								router.push(`${pathname}?${createQueryString('hash_contains', inputValue)}`);
							}
						}}
						onChange={(e) => setInputValue(e.target.value)}
						placeholder='Search by hash'
					/>
					<MdOutlineSearch
						onClick={() => {
							router.push(`${pathname}?${createQueryString('hash_contains', inputValue)}`);
						}}
						className='-translate-y-1/2border h-6.5 absolute right-2 top-1 cursor-pointer border-l border-border_grey pl-1 text-2xl text-gray-500'
					/>
				</div>
				{searchParams.get('hash_contains') && (
					<Button
						onClick={() => {
							setInputValue('');
							const url = createQueryString('hash_contains', '');
							router.push(url ? `${pathname}?${url}` : pathname);
						}}
					>
						Show All
					</Button>
				)}
			</div>
		</div>
	);
}

export default Header;
