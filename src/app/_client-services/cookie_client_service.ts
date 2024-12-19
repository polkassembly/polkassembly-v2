// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ECookieNames } from '@/_shared/types';
import { deleteCookie, getCookie } from 'cookies-next/client';

export class CookieClientService {
	static getCookieInClient(cookieName: ECookieNames) {
		return getCookie(cookieName);
	}

	static deleteCookieFromClient(cookieName: ECookieNames) {
		return deleteCookie(cookieName);
	}
}
