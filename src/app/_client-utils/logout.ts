// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ECookieNames } from '@/_shared/types';
import { deleteCookie } from 'cookies-next/client';
import { nextApiClientFetch } from './nextApiClientFetch';

export const logout = async (onLogout?: () => void) => {
	onLogout?.();
	deleteCookie(ECookieNames.ACCESS_TOKEN);
	deleteCookie(ECookieNames.REFRESH_TOKEN);

	const data = await nextApiClientFetch<{ message: string }>('/auth/actions/logout');

	if (data?.message) {
		console.log(data.message);
	}
};
