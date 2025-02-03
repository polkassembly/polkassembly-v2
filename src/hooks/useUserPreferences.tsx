// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useAtom } from 'jotai';
import { useCallback, useMemo } from 'react';
import { dayjs } from '@/_shared/_utils/dayjsInit';
import { IUserPreferences } from '@/_shared/types';
import { userPreferencesAtom } from '../app/_atoms/user/userPreferencesAtom';

export const useUserPreferences = () => {
	const [userPreferences, setUserPreferences] = useAtom(userPreferencesAtom);

	const setUserPreferencesWithDayjsLocale = useCallback(
		(preferences: IUserPreferences) => {
			dayjs.locale(preferences.locale);
			setUserPreferences(preferences);
		},
		[setUserPreferences]
	);

	return useMemo(() => {
		return { userPreferences, setUserPreferences: setUserPreferencesWithDayjsLocale };
	}, [userPreferences, setUserPreferencesWithDayjsLocale]);
};
