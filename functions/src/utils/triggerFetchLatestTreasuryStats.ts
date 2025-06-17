// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import * as logger from 'firebase-functions/logger';
import axios from 'axios';
import { EHttpHeaderKey } from '../types';
import { TREASURY_STATS_NETWORKS } from '../constants';

export async function triggerFetchLatestTreasuryStats({ toolsPassphrase }: { toolsPassphrase: string }) {
	return Promise.all(
		TREASURY_STATS_NETWORKS.map(async (network) => {
			try {
				logger.info(`Fetching treasury stats for network: ${network}`);

				const response = await axios.post(
					`https://${network}.polkassembly.io/api/v2/meta/treasury-stats`,
					{}, // Empty body
					{
						headers: {
							[EHttpHeaderKey.TOOLS_PASSPHRASE]: toolsPassphrase,
							[EHttpHeaderKey.NETWORK]: network // Add network to headers
						}
					}
				);

				logger.info(`Treasury stats fetched successfully for ${network}`, response.data);
				return response.data;
			} catch (error) {
				// Log error for this network but continue with others
				logger.error(`Error fetching treasury stats for ${network}:`, error);
				return null;
			}
		})
	);
}
