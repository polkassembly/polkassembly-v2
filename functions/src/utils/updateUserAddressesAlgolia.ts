// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { DocumentData, getFirestore } from 'firebase-admin/firestore';
import * as logger from 'firebase-functions/logger';
import { IV2User } from '../types';
import { initAlgoliaApi } from './initAlgoliaApi';

export const updateUserAddressesAlgolia = async (addressData?: DocumentData): Promise<void> => {
	if (!addressData?.userId) {
		logger.error('Address data or userId is missing');
		return;
	}

	// Get the user document
	const db = getFirestore();
	const userDoc = await db.collection('users').doc(addressData.userId.toString()).get();
	if (!userDoc.exists) {
		logger.error('User document not found');
		return;
	}

	const userData = userDoc.data() as IV2User;
	if (!userData) {
		logger.error('User data is undefined');
		return;
	}

	// Get all addresses for this user
	const addressesSnapshot = await db.collection('addresses').where('userId', '==', addressData.userId).get();

	// Extract addresses
	const addresses = addressesSnapshot.docs.map((doc) => doc.id);

	// Update only the addresses field in Algolia
	const client = initAlgoliaApi();

	await client.partialUpdateObject({
		indexName: 'polkassembly_v2_users',
		objectID: userData.id.toString(),
		attributesToUpdate: {
			addresses
		}
	});
};
