// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use server';

import { headers } from 'next/headers';

/**
 * Reads the Referrer/Referer header from the incoming request and returns the hostname.
 * Returns null when the header is missing or invalid.
 */
export async function getReferrerFromHeaders(): Promise<string | null> {
	const readonlyHeaders = await headers();

	const referer = readonlyHeaders.get('referer') || readonlyHeaders.get('referrer');
	if (!referer) {
		return null;
	}

	try {
		const url = new URL(referer);
		return url.hostname || null;
	} catch {
		// Invalid referrer value
		return null;
	}
}
