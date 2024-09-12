// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { DbService } from '@api/_api-services/db_service';
import { headers } from 'next/headers';
import { NextRequest } from 'next/server';

/**
 * Stores api key usage into db
 * Use without await keyword as 'fire-and-forget'
 * See: https://github.com/vercel/next.js/discussions/12573#discussioncomment-2799468
 * @export
 * @param {NextRequest} req
 */
export async function storeApiKeyUsage(req: NextRequest) {
	try {
		const apiKey = headers().get('x-api-key') || 'unknown';
		const apiRoute = req.url?.split('?')[0] || 'unknown';

		await DbService.UpdateApiKeyUsage(apiKey, apiRoute);
	} catch (e) {
		console.error('Error in storeApiKeyUsage : ', e);
	}
}
