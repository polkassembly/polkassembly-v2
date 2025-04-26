// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useAtom } from 'jotai';
import { userAtom } from '@/app/_atoms/user/userAtom';
import { useCallback, useMemo } from 'react';
import { IAccessTokenPayload, IAddressRelations, IUserClientData } from '@/_shared/types';
import { ClientError } from '@/app/_client-utils/clientError';
import { ERROR_CODES } from '@/_shared/_constants/errorLiterals';
import { AuthClientService } from '@/app/_client-services/auth_client_service';
import { UserProfileClientService } from '@/app/_client-services/user_profile_client_service';

export const useUser = () => {
	const [user, setUser] = useAtom(userAtom);

	const setUserWithPublicData = useCallback(
		async (accessTokenPayload: IAccessTokenPayload | null) => {
			if (!accessTokenPayload) {
				setUser(null);
				return;
			}

			// login instantly
			setUser(accessTokenPayload);

			// fetch public user data after login reflects in UI
			try {
				// TODO: use react query here
				const { data: publicUserData, error } = await UserProfileClientService.fetchPublicUserById({ userId: accessTokenPayload.id });

				if (error || !publicUserData) {
					throw new ClientError(ERROR_CODES.API_FETCH_ERROR, error?.message || 'Failed to fetch public user data');
				}

				const userClientData: IUserClientData = {
					...accessTokenPayload,
					publicUser: publicUserData
				};
				setUser(userClientData);
			} catch {
				// TODO: show notification (user not found)
				// logout user, remove cookies
				AuthClientService.logout(() => setUser(null));
			}
		},
		[setUser]
	);

	const setUserAddressRelations = useCallback(
		(addressRelations: IAddressRelations[]) => {
			if (!user) {
				return;
			}

			setUser({ ...user, addressRelations });
		},
		[setUser, user]
	);

	return useMemo(() => {
		return { user, setUser: setUserWithPublicData, setUserAddressRelations };
	}, [user, setUserWithPublicData, setUserAddressRelations]);
};
