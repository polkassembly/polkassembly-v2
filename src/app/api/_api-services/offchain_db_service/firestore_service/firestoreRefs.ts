// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ERROR_CODES } from '@/_shared/_constants/errorLiterals';
import { ValidatorService } from '@/_shared/_services/validator_service';
import { getSubstrateAddress } from '@/_shared/_utils/getSubstrateAddress';
import { FIREBASE_SERVICE_ACC_CONFIG } from '@/app/api/_api-constants/apiEnvVars';
import { APIError } from '@/app/api/_api-utils/apiError';
import * as firebaseAdmin from 'firebase-admin';
import { StatusCodes } from 'http-status-codes';

// init firebase admin
if (!FIREBASE_SERVICE_ACC_CONFIG) {
	throw new APIError(ERROR_CODES.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR, 'Internal Error: FIREBASE_SERVICE_ACC_CONFIG missing.');
}

try {
	if (!firebaseAdmin.apps.length) {
		firebaseAdmin.initializeApp({
			credential: firebaseAdmin.credential.cert(JSON.parse(FIREBASE_SERVICE_ACC_CONFIG))
		});
	}
} catch (error: unknown) {
	console.error('\nError in initialising firebase-admin: ', error, '\n');
	throw new APIError(ERROR_CODES.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR, 'Error in initialising firebase-admin.');
}

export class FirestoreRefs {
	protected static firestoreDb: firebaseAdmin.firestore.Firestore = firebaseAdmin.firestore();

	protected static increment = firebaseAdmin.firestore.FieldValue.increment;

	// collection references
	protected static usersCollectionRef = () => firebaseAdmin.firestore().collection('users');

	protected static addressesCollectionRef = () => this.firestoreDb.collection('addresses');

	protected static postsCollectionRef = () => this.firestoreDb.collection('posts');

	protected static commentsCollectionRef = () => this.firestoreDb.collection('comments');

	protected static notificationsCollectionRef = () => this.firestoreDb.collection('notifications');

	protected static apiKeysCollectionRef = () => this.firestoreDb.collection('api_keys');

	protected static reactionsCollectionRef = () => this.firestoreDb.collection('reactions');

	// document reference methods
	protected static getUserDocRefById = (userId: number) => this.usersCollectionRef().doc(userId.toString());

	protected static getAddressDocRefByAddress = (address: string) => {
		const formattedAddress = ValidatorService.isValidSubstrateAddress(address) ? address : getSubstrateAddress(address);
		if (!formattedAddress) {
			throw new APIError(ERROR_CODES.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR, 'Internal Error: Invalid substrate address.');
		}
		return this.addressesCollectionRef().doc(formattedAddress);
	};

	protected static getReactionDocRefById = (reactionId: string) => this.reactionsCollectionRef().doc(reactionId);
}
