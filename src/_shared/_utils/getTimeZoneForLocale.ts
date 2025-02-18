// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { ELocales } from '@/_shared/types';

export const getTimeZoneForLocale = (locale: string) => {
	switch (locale) {
		case ELocales.JAPANESE:
			return 'Asia/Tokyo';
		case ELocales.CHINESE:
			return 'Asia/Shanghai';
		case ELocales.SPANISH:
			return 'America/Mexico_City';
		case ELocales.GERMAN:
			return 'Europe/Berlin';
		default:
			return 'UTC';
	}
};
