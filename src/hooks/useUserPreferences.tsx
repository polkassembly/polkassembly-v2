// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useAtom } from 'jotai';
import { useMemo } from 'react';
import { userPreferencesAtom } from '../app/_atoms/user/userPreferencesAtom';

export const useUserPreferences = () => {
	const [userPreferences, setUserPreferences] = useAtom(userPreferencesAtom);

	return useMemo(() => {
		return { userPreferences, setUserPreferences };
	}, [userPreferences, setUserPreferences]);
};
