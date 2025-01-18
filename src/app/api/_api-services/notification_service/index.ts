// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
/* eslint-disable lines-between-class-members */

import { getSharedEnvVars } from '@/_shared/_utils/getSharedEnvVars';
import { NOTIFICATION_ENGINE_API_KEY } from '@api/_api-constants/apiEnvVars';
import { APIError } from '@api/_api-utils/apiError';
import { ERROR_CODES } from '@shared/_constants/errorLiterals';
import { fetchPF } from '@shared/_utils/fetchPF';
import { ENotificationTrigger, IUser } from '@shared/types';
import { StatusCodes } from 'http-status-codes';

if (!NOTIFICATION_ENGINE_API_KEY) {
	throw new APIError(ERROR_CODES.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR, 'NOTIFICATION_ENGINE_API_KEY is not set');
}

export class NotificationService {
	private static NOTIFICATION_ENGINE_URL = 'https://us-central1-polkassembly-dev.cloudfunctions.net/notify';
	private static DEFAULT_NOTIFICATION_NETWORK = getSharedEnvVars().NEXT_PUBLIC_DEFAULT_NETWORK;
	private static firebaseFunctionsHeader = (network: string) => ({
		Accept: 'application/json',
		'Content-Type': 'application/json',
		'x-api-key': NOTIFICATION_ENGINE_API_KEY,
		'x-network': network,
		'x-source': 'polkassembly'
	});

	static async SendVerificationEmail(user: IUser, token: string): Promise<void> {
		await fetchPF(`${this.NOTIFICATION_ENGINE_URL}`, {
			body: JSON.stringify({
				args: {
					email: user.email,
					verifyUrl: `https://${user.primaryNetwork || this.DEFAULT_NOTIFICATION_NETWORK}.polkassembly.io/verify-email?token=${token}`
				},
				trigger: ENotificationTrigger.VERIFY_EMAIL
			}),
			headers: this.firebaseFunctionsHeader(user.primaryNetwork || this.DEFAULT_NOTIFICATION_NETWORK),
			method: 'POST'
		}).catch((e) => console.error('Verification Email not sent', e));
	}

	static async SendResetPasswordEmail(user: IUser, token: string) {
		await fetchPF(`${this.NOTIFICATION_ENGINE_URL}`, {
			body: JSON.stringify({
				args: {
					email: user.email,
					resetUrl: `https://${user.primaryNetwork || this.DEFAULT_NOTIFICATION_NETWORK}.polkassembly.io/reset-password?token=${token}`
				},
				trigger: ENotificationTrigger.RESET_PASSWORD
			}),
			headers: this.firebaseFunctionsHeader(user.primaryNetwork || this.DEFAULT_NOTIFICATION_NETWORK),
			method: 'POST'
		}).catch((e) => console.error('Reset Password Email not sent', e));
	}
}
