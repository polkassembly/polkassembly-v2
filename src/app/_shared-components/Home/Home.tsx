// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { ELocales } from '@/_shared/types';
import { setLocaleCookie } from '@/app/_client-utils/setCookieFromServer';
import { Button } from '@ui/Button';
import { useTranslations } from 'next-intl';
import { useUserPreferences } from '@/hooks/useUserPreferences';

export default function HomePage() {
	const t = useTranslations('HomePage');
	const { userPreferences, setUserPreferences } = useUserPreferences();

	const onLocaleChange = async () => {
		setLocaleCookie(ELocales.SPANISH);
		setUserPreferences({ ...userPreferences, locale: ELocales.SPANISH });
	};

	return (
		<div className='text-center'>
			{t('title')}{' '}
			<Button
				variant='secondary'
				onClick={onLocaleChange}
			>
				es
			</Button>{' '}
		</div>
	);
}
