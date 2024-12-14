// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useTranslations } from 'next-intl';
import { ESupportedLanguages, ELocaleCookieNames } from '@/_shared/types';
import { useEffect, useState } from 'react';

export default function Home() {
	const t = useTranslations('HomePage');
	const [currentLanguage, setCurrentLanguage] = useState<ESupportedLanguages>(ESupportedLanguages.ENGLISH);

	useEffect(() => {
		const cookies = document.cookie.split(';');
		const localeCookie = cookies.find((cookie) => cookie.trim().startsWith(`${ELocaleCookieNames.NEXT_LOCALE}=`));
		if (localeCookie) {
			const locale = localeCookie.split('=')[1].trim() as ESupportedLanguages;
			setCurrentLanguage(locale);
		}
	}, []);

	const setLanguage = (language: ESupportedLanguages) => {
		try {
			document.cookie = `${ELocaleCookieNames.NEXT_LOCALE}=${language}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Strict${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`;
			setCurrentLanguage(language);
			window.location.reload();
		} catch (error) {
			// eslint-disable-next-line no-console
			console.error('Error switching language:', error);
		}
	};

	return (
		<div className='flex flex-col items-center gap-6 p-4'>
			<h1 className='text-center leading-10'>{t('title')}</h1>
			<h1 className='text-center leading-10'>{t('Greet')}</h1>

			<div className='flex gap-4'>
				<button
					type='button'
					onClick={() => setLanguage(ESupportedLanguages.ENGLISH)}
					className={`rounded-md border px-4 py-2 transition-colors ${
						currentLanguage === ESupportedLanguages.ENGLISH ? 'bg-blue-500 text-white' : 'bg-white hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700'
					}`}
				>
					English
				</button>
				<button
					type='button'
					onClick={() => setLanguage(ESupportedLanguages.SPANISH)}
					className={`rounded-md border px-4 py-2 transition-colors ${
						currentLanguage === ESupportedLanguages.SPANISH ? 'bg-blue-500 text-white' : 'bg-white hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700'
					}`}
				>
					Español
				</button>
			</div>
		</div>
	);
}
