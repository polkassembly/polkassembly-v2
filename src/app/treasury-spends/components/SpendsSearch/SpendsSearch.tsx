// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useSearchParams, usePathname } from 'next/navigation';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'nextjs-toploader/app';
import { Search } from 'lucide-react';
import { Input } from '@/app/_shared-components/Input';
import { Button } from '@/app/_shared-components/Button';

function SpendsSearch() {
	const t = useTranslations();
	const searchParams = useSearchParams();
	const router = useRouter();
	const pathname = usePathname();
	const [inputValue, setInputValue] = useState(searchParams.get('hash') || '');
	const spendsSearchPath = '/treasury-analytics/spends';

	return (
		<>
			<div className='relative w-full'>
				<Input
					className='h-9 w-full pr-12 sm:pr-12'
					value={inputValue}
					onKeyDown={(e) => {
						if (e.key === 'Enter') {
							if (pathname === spendsSearchPath) {
								router.push(`${spendsSearchPath}/${inputValue}`);
							} else if (pathname.startsWith(`${spendsSearchPath}/`)) {
								router.replace(`${spendsSearchPath}/${inputValue}`);
							}
						}
					}}
					onChange={(e) => setInputValue(e.target.value)}
					placeholder='Enter address or name to search'
				/>
				<Button
					variant='ghost'
					size='icon'
					className='absolute right-0 top-0 h-full rounded-l-none border-l border-border_grey px-2 text-2xl text-text_grey'
					onClick={() => {
						if (pathname === spendsSearchPath) {
							router.push(`${spendsSearchPath}/${inputValue}`);
						} else if (pathname.startsWith(`${spendsSearchPath}/`)) {
							router.replace(`${spendsSearchPath}/${inputValue}`);
						}
					}}
				>
					<Search />
				</Button>
			</div>
			{pathname.startsWith(`${spendsSearchPath}/`) && (
				<Button
					onClick={() => {
						setInputValue('');
						router.push(spendsSearchPath);
					}}
				>
					{t('TreasuryAnalytics.spendsSearch.showAll')}
				</Button>
			)}
		</>
	);
}

export default SpendsSearch;
