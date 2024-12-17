// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { ECookieNames, IAccessTokenPayload, IRefreshTokenPayload, IUserPreferences } from '@/_shared/types';
import { useEffect, useState } from 'react';
import { getCookie } from 'cookies-next/client';
import { decodeToken } from 'react-jwt';
import { useSetAtom } from 'jotai';
import { useUser } from '../_atoms/user/userAtom';
import { nextApiClientFetch } from '../_client-utils/nextApiClientFetch';
import { logout } from '../_client-utils/logout';
import { userPreferencesAtom } from '../_atoms/user/userPreferencesAtom';

function Initializers({
	userData,
	refreshTokenPayload,
	userPreferences
}: {
	userData: IAccessTokenPayload | null;
	refreshTokenPayload: IRefreshTokenPayload | null;
	userPreferences: IUserPreferences;
}) {
	const [user, setUser] = useUser();

	const setUserPreferencesAtom = useSetAtom(userPreferencesAtom);

	const [refreshTokenData, setRefreshTokenData] = useState<IRefreshTokenPayload | null>(refreshTokenPayload);

	const refreshAccessToken = async () => {
		const data = await nextApiClientFetch<{ message: string }>('/auth/actions/refreshAccessToken');
		if (data?.message) {
			const newAccessToken = getCookie(ECookieNames.ACCESS_TOKEN);
			const newRefreshToken = getCookie(ECookieNames.REFRESH_TOKEN);

			if (newAccessToken && newRefreshToken) {
				const newUserPayload = decodeToken<IAccessTokenPayload>(newAccessToken);
				const newRefreshTokenPayload = decodeToken<IRefreshTokenPayload>(newRefreshToken);

				if (newUserPayload) {
					setUser(newUserPayload);
				}
				if (newRefreshTokenPayload) {
					setRefreshTokenData(newRefreshTokenPayload);
				}
			}
		}
	};

	const checkForLoginState = () => {
		if (document.visibilityState === 'hidden') return;

		if (user?.exp && Date.now() > user.exp * 1000) {
			if (refreshTokenData?.exp && Date.now() < refreshTokenData.exp * 1000) {
				refreshAccessToken();
				return;
			}

			logout(() => setUser(null));
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
