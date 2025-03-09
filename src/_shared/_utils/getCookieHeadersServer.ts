// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use server';

import { CookieService } from '../_services/cookie_service';

export async function getCookieHeadersServer() {
	return CookieService.getCookieHeaders();
}
