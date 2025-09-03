// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ENotificationChannel } from '@/_shared/types';

export const generateVerificationToken = async (channel: ENotificationChannel): Promise<string> => {
	// Generate a secure random token
	const timestamp = Date.now();
	const randomBytes = crypto.getRandomValues(new Uint8Array(16));
	const randomString = Array.from(randomBytes, (byte) => byte.toString(16).padStart(2, '0')).join('');

	return `${channel}_${timestamp}_${randomString}`;
};

export const validateVerificationToken = (token: string, channel: ENotificationChannel): boolean => {
	if (!token || !token.startsWith(`${channel}_`)) {
		return false;
	}

	const parts = token.split('_');
	if (parts.length !== 3) {
		return false;
	}

	const timestamp = parseInt(parts[1], 10);
	const now = Date.now();
	const oneHour = 60 * 60 * 1000; // 1 hour in milliseconds

	// Token expires after 1 hour
	return now - timestamp < oneHour;
};
