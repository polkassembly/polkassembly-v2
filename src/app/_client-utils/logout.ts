// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { EAuthCookieNames } from '@/_shared/types';
import { deleteCookie } from 'cookies-next/client';
import { nextApiClientFetch } from './nextApiClientFetch';

export const logout = async (onLogout?: () => void) => {
	onLogout?.();
	deleteCookie(EAuthCookieNames.ACCESS_TOKEN);
	deleteCookie(EAuthCookieNames.REFRESH_TOKEN);

	const data = await nextApiClientFetch<{ message: string }>('/auth/actions/logout');

	if (data?.message) {
		console.log(data.message);
	}
};
