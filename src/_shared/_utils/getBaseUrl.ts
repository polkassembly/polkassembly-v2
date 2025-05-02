// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use server';

import { headers } from 'next/headers';

export async function getBaseUrl(): Promise<string> {
	if (global?.window) return `${global.window.location.origin}/api/v2`;

	const headersList = await headers();
	const domain = headersList.get('host') || '';
	const protocol = headersList.get('x-forwarded-proto') || 'https';

	return `${protocol}://${domain}/api/v2`;
}
