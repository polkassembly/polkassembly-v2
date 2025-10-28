// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ERROR_CODES } from '@/_shared/_constants/errorLiterals';
import { KLARA_FIREBASE_SERVICE_ACC_CONFIG } from '@/app/api/_api-constants/apiEnvVars';
import { APIError } from '@/app/api/_api-utils/apiError';
import * as firebaseAdmin from 'firebase-admin';
import { StatusCodes } from 'http-status-codes';

// init firebase admin
if (!KLARA_FIREBASE_SERVICE_ACC_CONFIG) {
	throw new APIError(ERROR_CODES.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR, 'Internal Error: KLARA_FIREBASE_SERVICE_ACC_CONFIG missing.');
}

let klaraApp: firebaseAdmin.app.App;

try {
	// Initialize a separate Firebase app instance for Klara
	const existingKlaraApp = firebaseAdmin.apps.find((app) => app?.name === 'klara');

	if (existingKlaraApp) {
		klaraApp = existingKlaraApp;
	} else {
		klaraApp = firebaseAdmin.initializeApp(
			{
				credential: firebaseAdmin.credential.cert(JSON.parse(KLARA_FIREBASE_SERVICE_ACC_CONFIG))
			},
			'klara'
		); // Named app instance
	}
} catch (error: unknown) {
	throw new APIError(ERROR_CODES.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR, (error as Error).message);
}

export class FirestoreUtils {
	// Use the Klara-specific Firebase app instance
	protected static firestoreDb: firebaseAdmin.firestore.Firestore = klaraApp.firestore();

	protected static increment = firebaseAdmin.firestore.FieldValue.increment;

	protected static serverTimestamp = firebaseAdmin.firestore.FieldValue.serverTimestamp;

	// collection references
	protected static conversationsCollectionRef = () => this.firestoreDb.collection('conversations');

	protected static messagesCollectionRef = (id: string) => this.firestoreDb.collection('conversations').doc(id).collection('messages');
}
