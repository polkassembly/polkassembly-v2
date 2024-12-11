// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import dayjs from 'dayjs';

import localizedFormat from 'dayjs/plugin/localizedFormat';

import { EAuthCookieNames, IAccessTokenPayload, IRefreshTokenPayload } from '@/_shared/types';
import { useEffect, useState } from 'react';
import { getCookie } from 'cookies-next/client';
import { decodeToken } from 'react-jwt';
import { useUser } from '../_atoms/user/userAtom';
import { nextApiClientFetch } from '../_client-utils/nextApiClientFetch';
import { logout } from '../_client-utils/logout';

dayjs.extend(localizedFormat);

function Initializers({ userData, refreshTokenPayload }: { userData: IAccessTokenPayload | null; refreshTokenPayload: IRefreshTokenPayload | null }) {
	const [user, setUser] = useUser();

	const [refreshTokenData, setRefreshTokenData] = useState<IRefreshTokenPayload | null>(refreshTokenPayload);

	const refreshAccessToken = async () => {
		const data = await nextApiClientFetch<{ message: string }>('/auth/actions/refreshAccessToken');
		if (data?.message) {
			console.log(data.message);
			const newAccessToken = getCookie(EAuthCookieNames.ACCESS_TOKEN);
			const newRefreshToken = getCookie(EAuthCookieNames.REFRESH_TOKEN);

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
		if (!userData) {
			return;
		}

		setUser(userData);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [userData]);
	return null;
}

export default Initializers;
