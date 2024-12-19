// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { ECookieNames, ENetwork, IAccessTokenPayload, IRefreshTokenPayload, IUserPreferences } from '@/_shared/types';
import { useEffect, useState } from 'react';
import { useSetAtom } from 'jotai';
import { useUser } from '../_atoms/user/userAtom';
import { userPreferencesAtom } from '../_atoms/user/userPreferencesAtom';
import { usePolkadotApi } from '../_atoms/polkadotJsApiAtom';
import { AuthClientService } from '../_client-services/auth_service';
import { ClientError } from '../_client-utils/clientError';
import { CookieClientService } from '../_client-services/cookie_client_service';

function Initializers({ userData, userPreferences }: { userData: IAccessTokenPayload | null; userPreferences: IUserPreferences }) {
	const [user, setUser] = useUser();

	const api = usePolkadotApi(ENetwork.POLKADOT);

	const setUserPreferencesAtom = useSetAtom(userPreferencesAtom);

	const oldRefreshtoken = CookieClientService.getCookieInClient(ECookieNames.REFRESH_TOKEN);
	const refreshTokenPayload = CookieClientService.decodeRefreshToken(oldRefreshtoken || '');

	const [refreshTokenData, setRefreshTokenData] = useState<IRefreshTokenPayload | null>(refreshTokenPayload);

	const refreshAccessToken = async () => {
		const { data, error } = await AuthClientService.refreshAccessToken();

		if (error && !data) {
			console.log('error in refreshAccesstoken', error);
			throw new ClientError(error.message);
		}

		const newAccessToken = CookieClientService.getCookieInClient(ECookieNames.ACCESS_TOKEN);
		const newRefreshToken = CookieClientService.getCookieInClient(ECookieNames.REFRESH_TOKEN);

		if (newAccessToken && newRefreshToken) {
			const newUserPayload = CookieClientService.decodeAccessToken(newAccessToken);
			const newRefreshTokenPayload = CookieClientService.decodeRefreshToken(newRefreshToken);

			if (newUserPayload) {
				setUser(newUserPayload);
			}
			if (newRefreshTokenPayload) {
				setRefreshTokenData(newRefreshTokenPayload);
			}
		}
	};

	const checkForLoginState = () => {
		if (document.visibilityState === 'hidden') return;

		api?.reconnect();

		if (user?.exp && Date.now() > user.exp * 1000) {
			if (refreshTokenData?.exp && Date.now() < refreshTokenData.exp * 1000) {
				refreshAccessToken();
				return;
			}

			AuthClientService.logout(() => setUser(null));
		}
	};

	useEffect(() => {
		document.addEventListener('visibilitychange', checkForLoginState);

		return () => {
			document.removeEventListener('visibilitychange', checkForLoginState);
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
