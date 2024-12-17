// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { atom } from 'jotai';
import { parse } from 'cookie';
import { ELocales, ECookieNames } from '@/_shared/types';

const getLocaleFromCookie = (): ELocales => {
	if (typeof document !== 'undefined') {
		const cookies = document.cookie || '';
		const parsedCookies = parse(cookies);
		const cookieLocale = parsedCookies[ECookieNames.LOCALE];

		return Object.values(ELocales).includes(cookieLocale as ELocales) ? (cookieLocale as ELocales) : ELocales.ENGLISH;
	}
	return ELocales.ENGLISH;
};

export const localeAtom = atom<ELocales>(getLocaleFromCookie());
