// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { DocumentData } from 'firebase-admin/firestore';
import dayjs from 'dayjs';
import { IV2User } from '../types';
import { initAlgoliaApi } from './initAlgoliaApi';

export const updateUserAlgolia = async (user?: DocumentData): Promise<void> => {
	if (!user) {
		return;
	}

	const client = initAlgoliaApi();

	const algoliaUser: Omit<IV2User, 'password' | 'salt' | 'isEmailVerified' | 'isWeb3Signup' | 'createdAt' | 'updatedAt'> & {
		objectID: string;
		createdAtTimestamp?: number;
		updatedAtTimestamp?: number;
	} = {
		objectID: user.id.toString(),
		id: user.id,
		username: user.username,
		email: user.email,
		...(user.createdAt && { createdAtTimestamp: dayjs(user.createdAt.toDate()).unix() }),
		...(user.updatedAt && { updatedAtTimestamp: dayjs(user.updatedAt.toDate()).unix() }),
		primaryNetwork: user.primaryNetwork
	};

	await client.saveObject({
		indexName: 'polkassembly_v2_users',
		body: algoliaUser
	});
};
