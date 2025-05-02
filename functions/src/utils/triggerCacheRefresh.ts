// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import * as logger from 'firebase-functions/logger';
import axios from 'axios';
import { EWebhookEvent } from '../types';
import { CACHE_REFRESH_NETWORKS } from '../constants';

export async function triggerCacheRefresh({ toolsPassphrase }: { toolsPassphrase: string }) {
	return Promise.all(
		CACHE_REFRESH_NETWORKS.map(async (network) => {
			try {
				logger.info(`Triggering cache refresh for network: ${network}`);

				// TODO: `https://${network}.polkassembly.io/api/v2/webhook/${EWebhookEvent.CACHE_REFRESH}`,
				const response = await axios.post(
					`https://test.polkassembly.io/api/v2/webhook/${EWebhookEvent.CACHE_REFRESH}`,
					{}, // Empty body
					{
						headers: {
							'x-tools-passphrase': toolsPassphrase,
							'x-network': network // Add network to headers
						}
					}
				);

				logger.info(`Cache refresh triggered successfully for ${network}`, response.data);
				return response.data;
			} catch (error) {
				// Log error for this network but continue with others
				logger.error(`Error triggering cache refresh for ${network}:`, error);
				return null;
			}
		})
	);
}
