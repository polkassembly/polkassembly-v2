// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import * as logger from 'firebase-functions/logger';
import axios from 'axios';
import { EHttpHeaderKey, EWebhookEvent, ECacheRefreshType } from '../types';
import { CACHE_REFRESH_NETWORKS } from '../constants';

export async function triggerCacheRefresh({ toolsPassphrase, cacheRefreshType }: { toolsPassphrase: string; cacheRefreshType: ECacheRefreshType }) {
	return Promise.all(
		CACHE_REFRESH_NETWORKS.map(async (network) => {
			try {
				logger.info(`Triggering cache refresh for network: ${network} with cacheRefreshType: ${cacheRefreshType}`);

				// Use the network variable in the URL
				const response = await axios.post(
					`https://${network}.polkassembly.io/api/v2/webhook/${EWebhookEvent.CACHE_REFRESH}`,
					{
						cacheRefreshType
					}, // Empty body
					{
						headers: {
							[EHttpHeaderKey.TOOLS_PASSPHRASE]: toolsPassphrase,
							[EHttpHeaderKey.NETWORK]: network // Add network to headers
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
