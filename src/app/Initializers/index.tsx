// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { IAccessTokenPayload, IRefreshTokenPayload, IUserPreferences } from '@/_shared/types';
import { useEffect, useState } from 'react';
import { useSetAtom } from 'jotai';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { useUser } from '../_atoms/user/userAtom';
import { userPreferencesAtom } from '../_atoms/user/userPreferencesAtom';
import { usePolkadotApi } from '../_atoms/polkadotJsApiAtom';
import { AuthClientService } from '../_client-services/auth_client_service';
import { ClientError } from '../_client-utils/clientError';
import { CookieClientService } from '../_client-services/cookie_client_service';
import { useIdentityService } from '../_atoms/identityApiAtom';

function Initializers({ userData, userPreferences }: { userData: IAccessTokenPayload | null; userPreferences: IUserPreferences }) {
	const [user, setUser] = useUser();

	const network = getCurrentNetwork();
	const api = usePolkadotApi(network);
	const { identityApi } = useIdentityService(network);

	const setUserPreferencesAtom = useSetAtom(userPreferencesAtom);

	const currentRefreshTokenPayload = CookieClientService.getRefreshTokenPayload();

	const [refreshTokenData, setRefreshTokenData] = useState<IRefreshTokenPayload | null>(currentRefreshTokenPayload);

	const refreshAccessToken = async () => {
		const { data, error } = await AuthClientService.refreshAccessToken();

		if (error && !data) {
			throw new ClientError(error.message);
		}

		const newUserPayload = CookieClientService.getAccessTokenPayload();
		const newRefreshTokenPayload = CookieClientService.getRefreshTokenPayload();

		if (newUserPayload) {
			setUser(newUserPayload);
		}
		if (newRefreshTokenPayload) {
			setRefreshTokenData(newRefreshTokenPayload);
		}
	};

	const restablishConnections = () => {
		if (document.visibilityState === 'hidden') return;

		api?.reconnect();
		identityApi?.reconnect();

		if (user?.exp && Date.now() > user.exp * 1000) {
			if (refreshTokenData?.exp && Date.now() < refreshTokenData.exp * 1000) {
				refreshAccessToken();
				return;
			}

			AuthClientService.logout(() => setUser(null));
		}
	};

	useEffect(() => {
		document.addEventListener('visibilitychange', restablishConnections);

		return () => {
			document.removeEventListener('visibilitychange', restablishConnections);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [user]);

	useEffect(() => {
		setUserPreferencesAtom({
			locale: userPreferences.locale,
			theme: userPreferences.theme,
			// address: user?.defaultAddress,
			wallet: user?.loginWallet
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		if (!userData) {
			return;
		}

		setUser(userData);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [userData]);
	return null;
}

export default Initializers;
