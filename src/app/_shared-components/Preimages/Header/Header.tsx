// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useState } from 'react';
import { MdOutlineSearch } from 'react-icons/md';
import { useTranslations } from 'next-intl';
import { Input } from '../../Input';
import { Button } from '../../Button';
import styles from './Header.module.scss';

function Header({ data }: { data: { totalCount: number } }) {
	const t = useTranslations();
	const searchParams = useSearchParams();
	const router = useRouter();
	const pathname = usePathname();
	const [inputValue, setInputValue] = useState(searchParams.get('hash') || '');

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
		<div className={styles.header}>
			<p className={styles.header_title}>
				{data?.totalCount} {t('Sidebar.preimages')}
			</p>
			<div className='flex items-center gap-2'>
				<div className='relative'>
					<Input
						className={styles.input_container}
						value={inputValue}
						onKeyDown={(e) => {
							if (e.key === 'Enter') {
								router.push(`${pathname}?${createQueryString('hash', inputValue)}`);
							}
						}}
						onChange={(e) => setInputValue(e.target.value)}
						placeholder={t('Preimages.searchByHash')}
					/>
					<MdOutlineSearch
						onClick={() => {
							router.push(`${pathname}?${createQueryString('hash', inputValue)}`);
						}}
						className={styles.input_search}
					/>
				</div>
				{searchParams.get('hash') && (
					<Button
						onClick={() => {
							setInputValue('');
							const url = createQueryString('hash', '');
							router.push(url ? `${pathname}?${url}` : pathname);
						}}
					>
						{t('Preimages.showAll')}
					</Button>
				)}
			</div>
		</div>
	);
}

export default Header;
