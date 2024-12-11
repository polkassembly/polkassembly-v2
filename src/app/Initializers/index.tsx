// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import dayjs from 'dayjs';

import localizedFormat from 'dayjs/plugin/localizedFormat';

import { IAccessTokenPayload, IRefreshTokenPayload } from '@/_shared/types';
import { useCallback, useEffect } from 'react';
import { useUser } from '../_atoms/user/userAtom';
import { nextApiClientFetch } from '../_client-utils/nextApiClientFetch';
import { logout } from '../_client-utils/logout';

dayjs.extend(localizedFormat);

function Initializers({ userData, refreshTokenPayload }: { userData: IAccessTokenPayload | null; refreshTokenPayload: IRefreshTokenPayload | null }) {
	const [, setUser] = useUser();

	const refreshAccessToken = useCallback(async () => {
		await nextApiClientFetch('/auth/actions/refreshAccessToken');
	}, []);

	const checkForLoginState = () => {
		if (document.visibilityState === 'hidden') return;

		if (userData?.exp && Date.now() > userData.exp * 1000) {
			if (refreshTokenPayload?.exp) {
				refreshAccessToken();
				return;
			}

			// logout
			logout(() => setUser(null));
		}
	};

	useEffect(() => {
		document.addEventListener('visibilitychange', checkForLoginState);

		return () => {
			document.removeEventListener('visibilitychange', checkForLoginState);
		};
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
