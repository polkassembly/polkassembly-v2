// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { getRequestConfig } from 'next-intl/server';
import { parse } from 'cookie';
import { headers } from 'next/headers';
import { ValidatorService } from '@/_shared/_services/validator_service';
import { ELocales, ECookieNames } from '@/_shared/types';

const requestConfig = getRequestConfig(async () => {
	const headersList = await headers();
	const cookies = headersList.get('cookie') || '';
	const parsedCookies = parse(cookies);

	const cookieLocale = parsedCookies[ECookieNames.LOCALE];
	const locale = cookieLocale && ValidatorService.isValidLocale(cookieLocale) ? cookieLocale : ELocales.ENGLISH;

	try {
		return {
			locale,
			messages: (await import(`./messages/${locale}.json`)).default
		};
	} catch {
		return {
			locale: ELocales.ENGLISH,
			messages: (await import(`./messages/${ELocales.ENGLISH}.json`)).default
		};
	}
});

// eslint-disable-next-line
export default requestConfig;
