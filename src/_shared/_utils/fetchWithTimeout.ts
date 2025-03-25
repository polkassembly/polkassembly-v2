// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { DEFAULT_FETCH_TIMEOUT } from '../_constants/defaultFetchTimeout';

export async function fetchWithTimeout(url: string | URL, options?: Record<string, unknown>) {
	const { timeout } = options || {};

	const controller = new AbortController();
	const id = setTimeout(() => controller.abort(), Number(timeout || DEFAULT_FETCH_TIMEOUT));

	const response = await fetch(url, {
		...options,
		signal: controller.signal
	});
	clearTimeout(id);

	return response;
}
