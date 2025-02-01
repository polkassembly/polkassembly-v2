// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { CookieService } from '@/_shared/_services/cookie_service';

export const getRequestConfig = async () => {
	// Provide a static locale, fetch a user setting,
	// read from `cookies()`, `headers()`, etc.
	const { locale } = await CookieService.getUserPreferencesFromCookie();

	return {
		locale,
		messages: (await import(`./messages/${locale}.json`)).default
	};
};
