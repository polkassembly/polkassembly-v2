// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import * as logger from 'firebase-functions/logger';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import * as dotenv from 'dotenv';
import { HttpsError, onRequest } from 'firebase-functions/https';
import { triggerFetchLatestTreasuryStats } from './utils/triggerFetchLatestTreasuryStats';
import { ERROR_MESSAGES } from './constants';
import { triggerCacheRefresh } from './utils/triggerCacheRefresh';

// Load environment variables
dotenv.config();

// Fetch treasury stats every 30 minutes
export const scheduledTreasuryStatsFetch = onSchedule(
	{
		schedule: 'every 30 minutes',
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

			await triggerFetchLatestTreasuryStats({ toolsPassphrase: TOOLS_PASSPHRASE });
		} catch (error) {
			logger.error('Error in scheduled treasury stats function:', error);
		}
	}
);

export const callTreasuryStatsFetch = onRequest(async (request, response) => {
	try {
		const { TOOLS_PASSPHRASE } = process.env;

		// get toolsPassphrase from request.body
		const { toolsPassphrase } = request.body;

		if (!TOOLS_PASSPHRASE || !toolsPassphrase || toolsPassphrase !== TOOLS_PASSPHRASE) {
			logger.error(ERROR_MESSAGES.INVALID_TOOLS_PASSPHRASE);
			throw new HttpsError('invalid-argument', ERROR_MESSAGES.INVALID_TOOLS_PASSPHRASE);
		}

		await triggerFetchLatestTreasuryStats({ toolsPassphrase });

		response.json({ message: 'Treasury stats fetch complete' });
	} catch (error) {
		logger.error('Error in callTreasuryStatsFetch:', error);
		throw new HttpsError('internal', 'Error in callTreasuryStatsFetch');
	}
});

// renew caches every 50 minutes
export const scheduledCacheRefresh = onSchedule(
	{
		schedule: 'every 50 minutes',
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

			await triggerCacheRefresh({ toolsPassphrase: TOOLS_PASSPHRASE });
		} catch (error) {
			logger.error('Error in scheduled cache refresh function:', error);
		}
	}
);

export const callCacheRefresh = onRequest(async (request, response) => {
	try {
		const { TOOLS_PASSPHRASE } = process.env;

		// get toolsPassphrase from request.body
		const { toolsPassphrase } = request.body;

		if (!TOOLS_PASSPHRASE || !toolsPassphrase || toolsPassphrase !== TOOLS_PASSPHRASE) {
			logger.error(ERROR_MESSAGES.INVALID_TOOLS_PASSPHRASE);
			throw new HttpsError('invalid-argument', ERROR_MESSAGES.INVALID_TOOLS_PASSPHRASE);
		}

		await triggerCacheRefresh({ toolsPassphrase });

		response.json({ message: 'Cache refresh complete' });
	} catch (error) {
		logger.error('Error in callCacheRefresh:', error);
		throw new HttpsError('internal', 'Error in callCacheRefresh');
	}
});
