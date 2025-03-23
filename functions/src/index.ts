import * as logger from 'firebase-functions/logger';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import axios from 'axios';
import * as dotenv from 'dotenv';
import { ENetwork } from './types';

// Load environment variables
dotenv.config();

const TREASURY_STATS_NETWORKS = [ENetwork.POLKADOT, ENetwork.KUSAMA];

// Fetch treasury stats every 6 hours
export const scheduledTreasuryStatsFetch = onSchedule(
	{
		schedule: 'every 12 hours',
		timeZone: 'UTC',
		retryCount: 3, // Retry 3 times if it fails
		timeoutSeconds: 300 // 5 minutes
	},
	async (event) => {
		try {
			const TOOLS_PASSPHRASE = process.env.TOOLS_PASSPHRASE;

			if (!TOOLS_PASSPHRASE) {
				logger.error('TOOLS_PASSPHRASE is not defined in environment variables');
				return;
			}

			// Loop through each network and make API call
			for (const network of TREASURY_STATS_NETWORKS) {
				try {
					logger.info(`Fetching treasury stats for network: ${network}`);

					// TODO: `https://${network}.polkassembly.io/api/v2/meta/treasury-stats`,
					const response = await axios.post(
						`https://test.polkassembly.io/api/v2/meta/treasury-stats`,
						{}, // Empty body
						{
							headers: {
								'x-tools-passphrase': TOOLS_PASSPHRASE,
								'x-network': network // Add network to headers
							}
						}
					);

					logger.info(`Treasury stats fetched successfully for ${network}`, response.data);
				} catch (error) {
					// Log error for this network but continue with others
					logger.error(`Error fetching treasury stats for ${network}:`, error);
				}
			}
		} catch (error) {
			logger.error('Error in scheduled treasury stats function:', error);
		}
	}
);
