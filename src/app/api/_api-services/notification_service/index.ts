// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { getSharedEnvVars } from '@/_shared/_utils/getSharedEnvVars';
import { IS_NOTIFICATION_SERVICE_ENABLED, NOTIFICATION_ENGINE_API_KEY, VERIFICATION_CALLBACK_URL } from '@api/_api-constants/apiEnvVars';
import { APIError } from '@api/_api-utils/apiError';
import { ERROR_CODES } from '@shared/_constants/errorLiterals';
import { ENetwork, ENotificationTrigger, ESocial, IUser } from '@shared/types';
import { StatusCodes } from 'http-status-codes';

if (IS_NOTIFICATION_SERVICE_ENABLED && !NOTIFICATION_ENGINE_API_KEY) {
	throw new APIError(ERROR_CODES.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR, 'IS_NOTIFICATION_SERVICE_ENABLED is true but NOTIFICATION_ENGINE_API_KEY is not set');
}

export class NotificationService {
	private static NOTIFICATION_ENGINE_URL = 'https://us-central1-notification-engine-672e0.cloudfunctions.net/notify';

	private static DEFAULT_NOTIFICATION_NETWORK = getSharedEnvVars().NEXT_PUBLIC_DEFAULT_NETWORK as ENetwork;

	private static firebaseFunctionsHeader = (network: string) => ({
		Accept: 'application/json',
		'Content-Type': 'application/json',
		'x-api-key': NOTIFICATION_ENGINE_API_KEY,
		'x-network': network,
		'x-source': 'polkassembly_v2'
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
		if (!IS_NOTIFICATION_SERVICE_ENABLED || !NOTIFICATION_ENGINE_API_KEY) {
			throw new APIError(ERROR_CODES.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR, 'IS_NOTIFICATION_SERVICE_ENABLED or NOTIFICATION_ENGINE_API_KEY not found');
		}

		try {
			const res = await fetch(`${this.NOTIFICATION_ENGINE_URL}`, {
				body: JSON.stringify({
					args,
					trigger
				}),
				headers: this.firebaseFunctionsHeader(network),
				method: 'POST'
			});

			const { data, error } = (await res.json()) as { data?: string; error?: string };

			if (error || !data) {
				throw new APIError(ERROR_CODES.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR, error || 'Error in sending Notification');
			}
		} catch (e) {
			console.error('Notification not sent', e);
			throw new APIError(ERROR_CODES.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR, 'Notification not sent');
		}
	}

	static async SendVerificationEmail(user: IUser, token: string, email?: string): Promise<void> {
		if (!email) return;

		await this.sendNotification({
			network: user.primaryNetwork || this.DEFAULT_NOTIFICATION_NETWORK,
			trigger: ENotificationTrigger.VERIFY_EMAIL,
			args: {
				email: email || user.email,
				verifyUrl: `${VERIFICATION_CALLBACK_URL}?social=${ESocial.EMAIL}&token=${token}`
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
