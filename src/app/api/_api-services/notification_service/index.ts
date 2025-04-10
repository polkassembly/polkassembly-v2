// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { getSharedEnvVars } from '@/_shared/_utils/getSharedEnvVars';
import { IS_NOTIFICATION_SERVICE_ENABLED, NOTIFICATION_ENGINE_API_KEY } from '@api/_api-constants/apiEnvVars';
import { APIError } from '@api/_api-utils/apiError';
import { ERROR_CODES } from '@shared/_constants/errorLiterals';
import { ENetwork, ENotificationTrigger, ESocial, IUser } from '@shared/types';
import { StatusCodes } from 'http-status-codes';

if (IS_NOTIFICATION_SERVICE_ENABLED && !NOTIFICATION_ENGINE_API_KEY) {
	throw new APIError(ERROR_CODES.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR, 'IS_NOTIFICATION_SERVICE_ENABLED is true but NOTIFICATION_ENGINE_API_KEY is not set');
}

export class NotificationService {
	private static NOTIFICATION_ENGINE_URL = 'https://us-central1-polkassembly-dev.cloudfunctions.net/notify';

	private static DEFAULT_NOTIFICATION_NETWORK = getSharedEnvVars().NEXT_PUBLIC_DEFAULT_NETWORK as ENetwork;

	private static firebaseFunctionsHeader = (network: string) => ({
		Accept: 'application/json',
		'Content-Type': 'application/json',
		'x-api-key': NOTIFICATION_ENGINE_API_KEY,
		'x-network': network,
		'x-source': 'polkassembly'
	});

	private static async sendNotification({
		network = this.DEFAULT_NOTIFICATION_NETWORK,
		trigger,
		args
	}: {
		network?: ENetwork;
		trigger: ENotificationTrigger;
		args: Record<string, string>;
	}) {
		if (!IS_NOTIFICATION_SERVICE_ENABLED) {
			return;
		}

		await fetch(`${this.NOTIFICATION_ENGINE_URL}`, {
			body: JSON.stringify({
				args,
				trigger
			}),
			headers: this.firebaseFunctionsHeader(network),
			method: 'POST'
		}).catch((e) => console.error('Notification not sent', e));
	}

	static async SendVerificationEmail(user: IUser, token: string, email?: string): Promise<void> {
		console.log('email', email);

		if (!email || !['aadarsh@polkassembly.io', 'aadarsh012@gmail.com', 'aadarshshaw24@gmail.com'].includes(email)) return;
		await this.sendNotification({
			network: user.primaryNetwork || this.DEFAULT_NOTIFICATION_NETWORK,
			trigger: ENotificationTrigger.VERIFY_EMAIL,
			args: {
				email: email || user.email,
				verifyUrl: `http://localhost:3000/confirm-verification?social=${ESocial.EMAIL}&token=${token}`
				// verifyUrl: `https://${user.primaryNetwork || this.DEFAULT_NOTIFICATION_NETWORK}.polkassembly.io/verify-email?token=${token}`
			}
		});
	}

	static async SendResetPasswordEmail(user: IUser, token: string) {
		await this.sendNotification({
			network: user.primaryNetwork || this.DEFAULT_NOTIFICATION_NETWORK,
			trigger: ENotificationTrigger.RESET_PASSWORD,
			args: {
				email: user.email,
				resetUrl: `https://${user.primaryNetwork || this.DEFAULT_NOTIFICATION_NETWORK}.polkassembly.io/reset-password?token=${token}`
			}
		});
	}
}
