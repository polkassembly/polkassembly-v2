// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { ECookieNames, ELocales } from '@/_shared/types';
import { useUserPreferences } from '@/app/_atoms/user/userPreferencesAtom';
import { setCookieValueByName } from '@/app/_client-utils/setCookieFromServer';
import { Button } from '@ui/Button';
import { useTranslations } from 'next-intl';

export default function HomePage() {
	const t = useTranslations('HomePage');
	const [userPreferences, setUserPreferences] = useUserPreferences();

	const onLocaleChange = async () => {
		setCookieValueByName(ECookieNames.LOCALE, ELocales.SPANISH);
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
