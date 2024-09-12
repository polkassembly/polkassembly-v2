// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

/* eslint-disable lines-between-class-members */

import { FIREBASE_SERVICE_ACC_CONFIG } from '@api/_api-constants/apiEnvVars';
import { APIError } from '@api/_api-utils/apiError';
import { ERROR_CODES } from '@shared/_constants/errorLiterals';
import { getSubstrateAddress } from '@shared/_utils/getSubstrateAddress';
import { IUser, IUserAddress } from '@shared/types';
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

		console.log('============= firebase-admin Initialised. =============');
	}
} catch (error: unknown) {
	console.error('Error in initialising firebase-admin: ', error);
	throw new APIError(ERROR_CODES.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR, 'Error in initialising firebase-admin.');
}

const db = firebaseAdmin.firestore();

export class DbService {
	// collection references
	private static usersCollection = db.collection('users');
	private static addressesCollection = db.collection('addresses');
	private static postsCollection = db.collection('posts');
	private static commentsCollection = db.collection('comments');
	private static notificationsCollection = db.collection('notifications');
	private static apiKeysCollection = db.collection('api_keys');

	// document reference methods
	private static getUserDocRefById = (userId: string) => this.usersCollection.doc(userId);
	private static getAddressDocRefByAddress = (address: string) => {
		const substrateAddress = address.startsWith('0x') ? address : getSubstrateAddress(address);
		if (!substrateAddress) {
			throw new APIError(ERROR_CODES.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR, 'Internal Error: Invalid substrate address.');
		}
		return this.addressesCollection.doc(substrateAddress);
	};

	// Business Logic methods

	// Read methods
	static async GetTotalUsersCount(): Promise<number> {
		const userDocSnapshot = await this.usersCollection.get();
		return userDocSnapshot.docs.length;
	}

	static async IsEmailInUse(email: string): Promise<boolean> {
		const userDocSnapshot = await this.usersCollection.where('email', '==', email).limit(1).get();
		return !userDocSnapshot.empty;
	}

	static async IsUsernameInUse(username: string): Promise<boolean> {
		const userDocSnapshot = await this.usersCollection.where('username', '==', username).limit(1).get();
		return !userDocSnapshot.empty;
	}

	static async GetUserByEmail(email: string): Promise<IUser | null> {
		const userDocSnapshot = await this.usersCollection.where('email', '==', email).limit(1).get();
		if (userDocSnapshot.empty) {
			return null;
		}

		const userData = userDocSnapshot.docs[0].data();

		return {
			...userData,
			createdAt: userData.created_at?.toDate(),
			updatedAt: userData.updated_at?.toDate()
		} as IUser;
	}

	static async GetUserByUsername(username: string): Promise<IUser | null> {
		const userDocSnapshot = await this.usersCollection.where('username', '==', username).limit(1).get();
		if (userDocSnapshot.empty) {
			return null;
		}

		const userData = userDocSnapshot.docs[0].data();

		return {
			...userData,
			createdAt: userData.created_at?.toDate(),
			updatedAt: userData.updated_at?.toDate()
		} as IUser;
	}

	static async GetUserById(userId: number): Promise<IUser | null> {
		const userDocSnapshot = await this.usersCollection.doc(userId.toString()).get();
		if (!userDocSnapshot.exists) {
			return null;
		}

		const userData = userDocSnapshot.data();

		if (!userData) {
			return null;
		}

		return {
			...userData,
			createdAt: userData.created_at?.toDate(),
			updatedAt: userData.updated_at?.toDate()
		} as IUser;
	}

	static async GetAddressesForUserId(userId: number, fetchOnlyVerified?: boolean) {
		const addressesQuery = fetchOnlyVerified
			? this.addressesCollection.where('userId', '==', userId).where('verified', '==', true)
			: this.addressesCollection.where('userId', '==', userId);

		const addressesQuerySnapshot = await addressesQuery.get();

		return addressesQuerySnapshot.docs.map((doc) => doc.data() as IUserAddress);
	}

	// Write methods

	static async UpdateApiKeyUsage(apiKey: string, apiRoute: string) {
		const apiUsageUpdate = {
			key: apiKey,
			usage: {
				[apiRoute]: {
					count: firebaseAdmin.firestore.FieldValue.increment(1),
					last_used_at: new Date()
				}
			}
		};

		await this.apiKeysCollection
			.doc(apiKey)
			.set(apiUsageUpdate, { merge: true })
			.catch((err) => {
				console.log('error in updating api key usage', err);
			});
	}

	static async AddNewUser(user: IUser) {
		await this.usersCollection
			.doc(user.id.toString())
			.set(user)
			.catch((err) => {
				console.log('error in adding new user', err);
				throw new APIError(ERROR_CODES.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR, 'Error in adding new user.');
			});
	}
}
