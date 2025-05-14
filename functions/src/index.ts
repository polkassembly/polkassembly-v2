// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import * as logger from 'firebase-functions/logger';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import * as dotenv from 'dotenv';
import { HttpsError, onRequest } from 'firebase-functions/https';
import { onDocumentWritten } from 'firebase-functions/v2/firestore';
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

interface IUser {
	email: string;
	password: string;
	username: string;
	web3_signup: boolean;
	custom_username: boolean;
	salt: string;
}

// V2 implementation using the new syntax
export const onUserWritten = onDocumentWritten(
	{
		document: 'users/{userId}',
		region: 'us-central1',
		maxInstances: 10
	},
	async (event) => {
		try {
			// If document was deleted or doesn't exist after write, no need to process
			if (!event.data?.after) {
				logger.info('User document was deleted or does not exist, no action needed');
				return;
			}

			const userData = event.data.after.data();
			if (!userData) {
				logger.error('User data is undefined');
				return;
			}

			const user: IUser = {
				email: userData.email,
				password: userData.password,
				username: userData.username,
				web3_signup: userData.isWeb3Signup || false,
				custom_username: userData.custom_username,
				salt: userData.salt
			};

			// Fix the URL (removed .ts extension)
			const url = 'https://api.old-polkassembly.io/api/v1/users/createUser';

			const response = await fetch(url, {
				method: 'POST',
				body: JSON.stringify(user),
				headers: {
					'Content-Type': 'application/json',
					'x-tools-passphrase': process.env.TOOLS_PASSPHRASE || ''
				}
			});

			if (!response.ok) {
				const errorText = await response.text();
				logger.error(`Error creating user: ${response.status} ${errorText}`);
				return;
			}

			logger.info(`User successfully created with ID: ${event.data.after.id}`);
		} catch (error) {
			logger.error('Error in onUserWritten function:', error);
		}
	}
);
