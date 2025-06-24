// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { algoliasearch } from 'algoliasearch';
import * as logger from 'firebase-functions/logger';

export const initAlgoliaApi = () => {
	const { ALGOLIA_APP_ID, ALGOLIA_WRITE_API_KEY } = process.env;

	if (!ALGOLIA_APP_ID || !ALGOLIA_WRITE_API_KEY) {
		logger.error('Algolia environment variables not set');
		throw new Error('Algolia environment variables not set');
	}

	try {
		const client = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_WRITE_API_KEY);
		return client;
	} catch (error) {
		logger.error('Error initializing Algolia client:', error);
		throw error;
	}
};
