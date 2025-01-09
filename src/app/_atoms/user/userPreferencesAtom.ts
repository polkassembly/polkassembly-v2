// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { DEFAULT_LOCALE } from '@/_shared/_constants/defaultLocale';
import { DEFAULT_THEME } from '@/_shared/_constants/defaultTheme';
import { IUserPreferences } from '@/_shared/types';
import { atom } from 'jotai';

export const userPreferencesAtom = atom<IUserPreferences>({
	locale: DEFAULT_LOCALE,
	theme: DEFAULT_THEME,
	rpcIndex: 0
});
