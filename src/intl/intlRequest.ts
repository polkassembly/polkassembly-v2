// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';
import { ValidatorService } from '@/_shared/_services/validator_service';
import { DEFAULT_LOCALE } from '@/_shared/_constants/intlrequestconstant';
import { ECookieNames } from '@/_shared/types';

const requestConfig = getRequestConfig(async () => {
	const cookiesStore = await cookies();
	const cookieLocale = cookiesStore.get(ECookieNames.LOCALE)?.value;

	const locale = cookieLocale && ValidatorService.isValidLocale(cookieLocale) ? cookieLocale : DEFAULT_LOCALE;

	return {
		locale,
		messages: (await import(`./messages/${locale}.json`)).default
	};
});

// eslint-disable-next-line
export default requestConfig;
