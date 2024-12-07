// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { EAuthCookieNames } from '@/_shared/types';
import { cookies } from 'next/headers';
import { AuthClientService } from '../_client-services/auth_service';

export const getUserFromCookie = async () => {
	const cookieStore = await cookies();
	const accessToken = cookieStore.get(EAuthCookieNames.ACCESS_TOKEN);
	// eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
	const refreshToken = cookieStore.get(EAuthCookieNames.REFRESH_TOKEN);
	if (!accessToken || !accessToken.value) return null;

	return AuthClientService.handleTokenChange(accessToken.value);
};
