// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useSearchParams, usePathname } from 'next/navigation';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'nextjs-toploader/app';
import { Search } from 'lucide-react';
import { Input } from '../../Input';
import { Button } from '../../Button';
import styles from './Header.module.scss';

function Header({ data }: { data: { totalCount: number } }) {
	const t = useTranslations();
	const searchParams = useSearchParams();
	const router = useRouter();
	const pathname = usePathname();
	const [inputValue, setInputValue] = useState(searchParams.get('hash') || '');
	const preImagePath = '/preimages';

	return (
		<div className={styles.header}>
			<p className={styles.header_title}>
				{data?.totalCount} {t('Sidebar.preimages')}
			</p>
			<div className='flex items-center gap-2'>
				<div className='relative'>
					<Input
						className='w-60 pr-12 sm:pr-12'
						value={inputValue}
						onKeyDown={(e) => {
							if (e.key === 'Enter') {
								if (pathname === preImagePath) {
									router.push(`${preImagePath}/${inputValue}`);
								} else if (pathname.startsWith(`${preImagePath}/`)) {
									router.replace(`${preImagePath}/${inputValue}`);
								}
							}
						}}
						onChange={(e) => setInputValue(e.target.value)}
						placeholder={t('Preimages.searchByHash')}
					/>
					<Button
						variant='ghost'
						size='icon'
						className='absolute right-0 top-0 h-full rounded-l-none border-l border-border_grey px-2 text-2xl text-text_grey'
						onClick={() => {
							if (pathname === preImagePath) {
								router.push(`${preImagePath}/${inputValue}`);
							} else if (pathname.startsWith(`${preImagePath}/`)) {
								router.replace(`${preImagePath}/${inputValue}`);
							}
						}}
					>
						<Search />
					</Button>
				</div>
				{pathname.startsWith(`${preImagePath}/`) && (
					<Button
						onClick={() => {
							setInputValue('');
							router.push(preImagePath);
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
