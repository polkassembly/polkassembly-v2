// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { IUserPreferences } from '@/_shared/types';
import { atom, useAtom } from 'jotai';

export const userPreferencesAtom = atom<IUserPreferences | null>(null);

export const useUserPreferences = () => useAtom(userPreferencesAtom);
