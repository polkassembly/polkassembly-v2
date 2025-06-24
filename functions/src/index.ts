// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import * as logger from 'firebase-functions/logger';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import * as dotenv from 'dotenv';
import { HttpsError, onRequest } from 'firebase-functions/https';
import { onDocumentWritten } from 'firebase-functions/v2/firestore';
import axios from 'axios';
import { triggerFetchLatestTreasuryStats } from './utils/triggerFetchLatestTreasuryStats';
import { ERROR_MESSAGES } from './constants';
import { triggerCacheRefresh } from './utils/triggerCacheRefresh';
import { ECacheRefreshType, EWallet, IV1User, IV1UserAddress, IV2User, IV2UserAddress } from './types';
import { updatePostAlgolia } from './utils/updatePostAlgolia';
import { updateUserAlgolia } from './utils/updateUserAlgolia';
import { updateUserAddressesAlgolia } from './utils/updateUserAddressesAlgolia';

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

// renew caches every 24 hours
export const scheduledCacheRefresh = onSchedule(
	{
		schedule: 'every 24 hours',
		timeZone: 'UTC',
		retryCount: 3,
		timeoutSeconds: 540 // 9 minutes
	},
	async () => {
		try {
			const { TOOLS_PASSPHRASE } = process.env;

			if (!TOOLS_PASSPHRASE) {
				logger.error(ERROR_MESSAGES.TOOLS_PASSPHRASE_NOT_DEFINED);
				throw new Error(ERROR_MESSAGES.TOOLS_PASSPHRASE_NOT_DEFINED);
			}

			Object.values(ECacheRefreshType).forEach((cacheRefreshType) => {
				triggerCacheRefresh({ toolsPassphrase: TOOLS_PASSPHRASE, cacheRefreshType });
			});
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

		Object.values(ECacheRefreshType).forEach((cacheRefreshType) => {
			triggerCacheRefresh({ toolsPassphrase: TOOLS_PASSPHRASE, cacheRefreshType });
		});

		response.json({ message: 'Cache refresh triggered successfully, please check vercel logs for more details' });
	} catch (error) {
		logger.error('Error in callCacheRefresh:', error);
		throw new HttpsError('internal', 'Error in callCacheRefresh');
	}
});

export const onUserWritten = onDocumentWritten(
	{
		document: 'users/{userId}',
		maxInstances: 10,
		timeoutSeconds: 300
	},
	async (event) => {
		try {
			if (!event?.data?.after) {
				logger.info('User document was deleted or does not exist or is being updated, no action needed');
				return;
			}

			await updateUserAlgolia(event.data.after.data());

			if (event?.data?.before?.exists) {
				logger.info('User document was updated, no action needed');
				return;
			}

			const userData = event.data.after.data() as IV2User;
			if (!userData) {
				logger.error('User data is undefined');
				return;
			}

			const payloadUser: IV1User = {
				id: userData.id,
				custom_username: !userData.isWeb3Signup,
				email: userData.email || '',
				password: userData.password,
				salt: userData.salt,
				username: userData.username,
				web3_signup: userData.isWeb3Signup || false
			};

			const url = 'https://polkadot-old.polkassembly.io/api/v1/users/createUser';

			const response = await axios.post(url, payloadUser, {
				headers: {
					'Content-Type': 'application/json',
					'x-tools-passphrase': process.env.TOOLS_PASSPHRASE || '',
					'x-network': 'polkadot'
				}
			});

			if (response.status !== 200) {
				logger.error(`Error creating user: ${response.status} ${response.data}`);
				return;
			}

			logger.info(`User successfully created with ID: ${event.data.after.id}`);
		} catch (error) {
			logger.error('Error in onUserWritten function:', error);
		}
	}
);

export const onAddressWritten = onDocumentWritten(
	{
		document: 'addresses/{address}',
		maxInstances: 10,
		timeoutSeconds: 300
	},
	async (event) => {
		try {
			if (!event?.data?.after || event?.data?.before?.exists) {
				logger.info('Address document was deleted or does not exist or is being updated, no action needed');
				return;
			}

			const addressData = event.data.after.data() as IV2UserAddress;
			if (!addressData) {
				logger.error('Address data is undefined');
				return;
			}

			if (!addressData.address) {
				logger.info('Address is not a valid web3 address, no action needed');
				return;
			}

			const payloadAddress: IV1UserAddress = {
				address: addressData.address,
				default: addressData.default,
				isMultisig: addressData.isMultisig || false,
				is_erc20: addressData.address.startsWith('0x'),
				network: addressData.network,
				proxy_for: [],
				public_key: '',
				sign_message: '',
				user_id: addressData.userId,
				verified: true,
				wallet: addressData.wallet || EWallet.OTHER
			};

			const url = 'https://polkadot-old.polkassembly.io/api/v1/users/createAddress';

			const response = await axios.post(url, payloadAddress, {
				headers: {
					'Content-Type': 'application/json',
					'x-tools-passphrase': process.env.TOOLS_PASSPHRASE || '',
					'x-network': 'polkadot'
				}
			});

			if (response.status !== 200) {
				logger.error(`Error creating address: ${response.status} ${response.data}`);
				return;
			}

			logger.info(`Address successfully created with ID: ${event.data.after.id}`);
		} catch (error) {
			logger.error('Error in onAddressWritten function:', error);
		}
	}
);

export const onPostWritten = onDocumentWritten(
	{
		document: 'posts/{postId}',
		maxInstances: 10,
		timeoutSeconds: 300
	},
	async (event) => {
		try {
			if (!event?.data?.after) {
				logger.info('Post document was deleted or does not exist or is being updated, no action needed');
				return;
			}

			await updatePostAlgolia(event.data.after.data());
		} catch (error) {
			logger.error('Error in onPostWritten function:', error);
		}
	}
);

export const onUserAddressWritten = onDocumentWritten(
	{
		document: 'addresses/{address}',
		maxInstances: 10,
		timeoutSeconds: 300
	},
	async (event) => {
		try {
			if (!event?.data?.after) {
				logger.info('Address document was deleted or does not exist or is being updated, no action needed');
				return;
			}

			const addressData = event.data.after.data() as IV2UserAddress;

			await updateUserAddressesAlgolia(addressData);
		} catch (error) {
			logger.error('Error in onUserAddressWritten function:', error);
		}
	}
);
