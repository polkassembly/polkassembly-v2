// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import * as logger from 'firebase-functions/logger';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import * as dotenv from 'dotenv';
import { HttpsError, onRequest } from 'firebase-functions/https';
import { fetchLatestTreasuryStats } from './utils/fetchLatestTreasuryStats';
import { ERROR_MESSAGES } from './constants';

// Load environment variables
dotenv.config();

// Fetch treasury stats every 6 hours
export const scheduledTreasuryStatsFetch = onSchedule(
	{
		schedule: 'every 12 hours',
		timeZone: 'UTC',
		retryCount: 3,
		timeoutSeconds: 300 // 5 minutes
	},
	async () => {
		try {
			const { TOOLS_PASSPHRASE } = process.env;

			if (!TOOLS_PASSPHRASE) {
				logger.error(ERROR_MESSAGES.TOOLS_PASSPHRASE_NOT_DEFINED);
				throw new Error(ERROR_MESSAGES.TOOLS_PASSPHRASE_NOT_DEFINED);
			}

			await fetchLatestTreasuryStats({ toolsPassphrase: TOOLS_PASSPHRASE });
		} catch (error) {
			logger.error('Error in scheduled treasury stats function:', error);
		}
	}
);

export const callTreasuryStatsFetch = onRequest(async (request) => {
	try {
		const { TOOLS_PASSPHRASE } = process.env;

		// get toolsPassphrase from request.body
		const { toolsPassphrase } = request.body;

		if (!TOOLS_PASSPHRASE || !toolsPassphrase || toolsPassphrase !== TOOLS_PASSPHRASE) {
			logger.error(ERROR_MESSAGES.INVALID_TOOLS_PASSPHRASE);
			throw new HttpsError('invalid-argument', ERROR_MESSAGES.INVALID_TOOLS_PASSPHRASE);
		}

		await fetchLatestTreasuryStats({ toolsPassphrase });
	} catch (error) {
		logger.error('Error in callTreasuryStatsFetch:', error);
		throw new HttpsError('internal', 'Error in callTreasuryStatsFetch');
	}
});
