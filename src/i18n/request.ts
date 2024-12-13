// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { getRequestConfig } from 'next-intl/server';
import { parse } from 'cookie';
import { headers } from 'next/headers';

export const requestConfig = getRequestConfig(async () => {
	const headersList = await headers();
	const cookies = headersList.get('cookie') || '';
	const parsedCookies = parse(cookies);
	const locale = parsedCookies.NEXT_LOCALE || 'en';

	return {
		locale,
		messages: (await import(`../../messages/${locale}.json`)).default
	};
});
