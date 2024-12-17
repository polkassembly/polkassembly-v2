// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useAtom } from 'jotai';
import { localeAtom } from '@/app/_atoms/i18requst';
import { useTranslations } from 'next-intl';
import { ELocales, ECookieNames } from '@/_shared/types';
import { setCookie } from '@/_shared/_utils/cookieUtils';

export default function Home() {
	const t = useTranslations('HomePage');
	const [currentLanguage, setCurrentLanguage] = useAtom(localeAtom);

	// Update cookie and Jotai state
	const handleLanguageChange = (language: ELocales) => {
		setCookie(ECookieNames.LOCALE, language); // Set the cookie
		setCurrentLanguage(language); // Update Jotai state
	};

	return (
		<div className='flex flex-col items-center gap-6 p-4'>
			<h1 className='text-center leading-10'>{t('title')}</h1>
			<h1 className='text-center leading-10'>{t('Greet')}</h1>

			<div className='flex gap-4'>
				<button
					type='button'
					onClick={() => handleLanguageChange(ELocales.ENGLISH)}
					className={`rounded-md border px-4 py-2 transition-colors ${currentLanguage === ELocales.ENGLISH ? 'bg-blue-500 text-white' : 'bg-white hover:bg-gray-100'}`}
				>
					English
				</button>
				<button
					type='button'
					onClick={() => handleLanguageChange(ELocales.SPANISH)}
					className={`rounded-md border px-4 py-2 transition-colors ${currentLanguage === ELocales.SPANISH ? 'bg-blue-500 text-white' : 'bg-white hover:bg-gray-100'}`}
				>
					Español
				</button>
			</div>
		</div>
	);
}
