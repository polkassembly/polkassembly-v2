// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { CookieService } from '@/_shared/_services/cookie_service';
import { getRequestConfig } from 'next-intl/server';

// eslint-disable-next-line import/no-default-export
export default getRequestConfig(async () => {
	// Provide a static locale, fetch a user setting,
	// read from `cookies()`, `headers()`, etc.
	const { locale } = await CookieService.getUserPreferencesFromCookie();

	return {
		locale,
		messages: (await import(`./messages/${locale}.json`)).default
	};
});
