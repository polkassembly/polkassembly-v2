// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { getSharedEnvVars } from '@/_shared/_utils/getSharedEnvVars';
import { EAppEnv } from '@/_shared/types';
import { OffChainDbService } from '@api/_api-services/offchain_db_service';
import { headers } from 'next/headers';
import { NextRequest } from 'next/server';

/**
 * Stores api key usage into db
 * @export
 * @param {NextRequest} req
 */
export async function storeApiKeyUsage(req: NextRequest) {
	try {
		const apiKey = (await headers()).get('x-api-key') || null;
		const apiRoute = req.url?.split('?')[0] || 'unknown';

		const { NEXT_PUBLIC_APP_ENV } = getSharedEnvVars();

		// do not store api key usage for development or null api keys
		if (NEXT_PUBLIC_APP_ENV !== EAppEnv.PRODUCTION || !apiKey) {
			return;
		}

		await OffChainDbService.UpdateApiKeyUsage(apiKey, apiRoute);
	} catch (e) {
		console.error('Error in storeApiKeyUsage : ', e);
	}
}
