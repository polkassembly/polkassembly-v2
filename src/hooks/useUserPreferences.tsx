// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useAtom } from 'jotai';
import { useCallback, useMemo } from 'react';
import { IUserPreferences } from '@/_shared/types';
import { useTheme } from 'next-themes';
import { CookieClientService } from '@/app/_client-services/cookie_client_service';
import { dayjs } from '@/_shared/_utils/dayjsInit';
import { getFormattedAddress } from '@/_shared/_utils/getFormattedAddress';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { userPreferencesAtom } from '../app/_atoms/user/userPreferencesAtom';
import { useUser } from './useUser';

export const useUserPreferences = () => {
	const [userPreferences, setUserPreferences] = useAtom(userPreferencesAtom);
	const { user, setUserAddressRelations } = useUser();
	const { setTheme } = useTheme();

	const fetchAddressRelations = useCallback(
		async (newPreferences: IUserPreferences) => {
			// 1. check if new preferences have new selected account
			const newSelectedAccount = newPreferences.selectedAccount;
			if (!newSelectedAccount) return;

			const newSelectedAccountAddress = getFormattedAddress(newSelectedAccount.address);

			// 2. if yes, check if it already has address relations fetched
			const newSelectedAccountAddressRelations = user?.addressRelations?.find((relations) => relations.address === newSelectedAccountAddress);
			if (newSelectedAccountAddressRelations?.multisigAddresses?.length || newSelectedAccountAddressRelations?.proxyAddresses?.length) return;

			// 3. if it does not have address relations, fetch them
			const { data, error } = await NextApiClientService.fetchAddressRelations(newSelectedAccountAddress);
			if (!data || error) return;

			setUserAddressRelations([...(user?.addressRelations || []), data]);
		},
		[user, setUserAddressRelations]
	);

	const setUserPreferencesWithDayjsLocale = useCallback(
		(preferences: IUserPreferences) => {
			dayjs.locale(preferences.locale);
			setTheme(preferences.theme);
			setUserPreferences(preferences);
			CookieClientService.setThemeCookie(preferences.theme);
			// fetch the address relations
			fetchAddressRelations(preferences);
		},
		[fetchAddressRelations, setTheme, setUserPreferences]
	);

	return useMemo(() => {
		return { userPreferences, setUserPreferences: setUserPreferencesWithDayjsLocale };
	}, [userPreferences, setUserPreferencesWithDayjsLocale]);
};
