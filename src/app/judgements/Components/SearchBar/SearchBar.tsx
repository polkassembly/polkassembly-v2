// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useSearchParams, usePathname } from 'next/navigation';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'nextjs-toploader/app';
import { Search } from 'lucide-react';
import { Input } from '../../../_shared-components/Input';
import { Button } from '../../../_shared-components/Button';
import styles from './SearchBar.module.scss';

function SearchBar() {
	const t = useTranslations();
	const searchParams = useSearchParams();
	const router = useRouter();
	const pathname = usePathname();
	const [inputValue, setInputValue] = useState(searchParams.get('hash') || '');
	const preImagePath = '/preimages';

	return (
		<div className={styles.container}>
			<div className='relative w-full'>
				<Input
					className='h-9 w-full pr-12 sm:pr-12'
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
	);
}

export default SearchBar;
