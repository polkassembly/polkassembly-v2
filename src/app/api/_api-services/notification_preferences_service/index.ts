// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { OffChainDbService } from '@/app/api/_api-services/offchain_db_service';
import { APIError } from '@/app/api/_api-utils/apiError';
import { ERROR_CODES } from '@/_shared/_constants/errorLiterals';
import { StatusCodes } from 'http-status-codes';
import {
	ENotificationChannel,
	IUserNotificationChannelPreferences,
	IUpdateNotificationPreferencesRequest,
	IUserNotificationSettings,
	IUserNotificationTriggerPreferences,
	ENotifications
} from '@/_shared/types';

const USER_NOT_FOUND_MESSAGE = 'User not found';

const userUpdateMutex = new Map<number, { promise: Promise<unknown>; timestamp: number }>();
const MUTEX_CLEANUP_INTERVAL = 5 * 60 * 1000;
const MUTEX_MAX_AGE = 10 * 60 * 1000;

setInterval(() => {
	const now = Date.now();
	userUpdateMutex.forEach((entry, userId) => {
		if (now - entry.timestamp > MUTEX_MAX_AGE) {
			userUpdateMutex.delete(userId);
		}
	});
}, MUTEX_CLEANUP_INTERVAL);

export class NotificationPreferencesService {
	static async GetUserNotificationPreferences(userId: number, network?: string, getAllNetworks?: boolean): Promise<IUserNotificationSettings> {
		const user = await OffChainDbService.GetUserById(userId);

		if (!user) {
			throw new APIError(ERROR_CODES.USER_NOT_FOUND, StatusCodes.NOT_FOUND, USER_NOT_FOUND_MESSAGE);
		}

		const preferences = user.notificationPreferences || this.getDefaultPreferences();

		if (network && !getAllNetworks && preferences.triggerPreferences?.[network]) {
			return {
				...preferences,
				triggerPreferences: {
					[network]: preferences.triggerPreferences[network]
				}
			};
		}

		return preferences;
	}

	static async UpdateUserNotificationPreferences(userId: number, request: IUpdateNotificationPreferencesRequest): Promise<IUserNotificationSettings> {
		if (userUpdateMutex.has(userId)) {
			await userUpdateMutex.get(userId)?.promise;
		}

		const updatePromise = this.performSingleUpdate(userId, request);
		userUpdateMutex.set(userId, { promise: updatePromise, timestamp: Date.now() });

		try {
			return await updatePromise;
		} finally {
			userUpdateMutex.delete(userId);
		}
	}

	private static async performSingleUpdate(userId: number, request: IUpdateNotificationPreferencesRequest): Promise<IUserNotificationSettings> {
		const user = await OffChainDbService.GetUserById(userId);

		if (!user) {
			throw new APIError(ERROR_CODES.USER_NOT_FOUND, StatusCodes.NOT_FOUND, USER_NOT_FOUND_MESSAGE);
		}

		const currentPreferences = user.notificationPreferences || this.getDefaultPreferences();
		const updatedPreferences = this.updatePreferenceSection(currentPreferences, request);

		await OffChainDbService.UpdateUserProfile({
			userId,
			newProfileDetails: user.profileDetails || {},
			notificationPreferences: updatedPreferences
		});

		return updatedPreferences;
	}

	static async GenerateVerificationToken(userId: number, channel: ENotificationChannel): Promise<string> {
		const randomBytes = crypto.getRandomValues(new Uint8Array(32));
		const token = Buffer.from(randomBytes).toString('base64url');

		const tokenMetadata = {
			channel,
			userId,
			timestamp: Date.now(),
			token
		};

		const currentPreferences = await this.GetUserNotificationPreferences(userId);
		const updatedPreferences = this.updatePreferenceSection(currentPreferences, {
			section: ENotifications.CHANNELS,
			key: channel,
			value: {
				...currentPreferences.channelPreferences[channel],
				verification_token: token,
				verificationMetadata: tokenMetadata
			}
		});

		const user = await OffChainDbService.GetUserById(userId);
		if (user) {
			await OffChainDbService.UpdateUserProfile({
				userId,
				newProfileDetails: user.profileDetails || {},
				notificationPreferences: updatedPreferences
			});
		}

		return token;
	}

	static async VerifyChannelToken(userId: number, channel: ENotificationChannel, token: string, handle: string): Promise<boolean> {
		try {
			if (!this.validateVerificationToken(token, channel, userId)) {
				return false;
			}

			const currentPreferences = await this.GetUserNotificationPreferences(userId);
			const channelSettings = currentPreferences.channelPreferences[channel];

			if (!channelSettings?.verification_token || channelSettings.verification_token !== token) {
				return false;
			}

			const updatedChannelSettings = {
				enabled: channelSettings.enabled,
				verified: true,
				handle,
				verification_token: undefined
			};
			const updatedPreferences = this.updatePreferenceSection(currentPreferences, {
				section: ENotifications.CHANNELS,
				key: channel,
				value: updatedChannelSettings
			});

			const user = await OffChainDbService.GetUserById(userId);
			if (user) {
				await OffChainDbService.UpdateUserProfile({
					userId,
					newProfileDetails: user.profileDetails || {},
					notificationPreferences: updatedPreferences
				});
			}

			return true;
		} catch {
			return false;
		}
	}

	private static getDefaultPreferences(): IUserNotificationSettings {
		const defaultChannelSettings: IUserNotificationChannelPreferences = {
			name: ENotificationChannel.EMAIL,
			enabled: false,
			handle: '',
			verified: false
		};

		return {
			channelPreferences: {
				[ENotificationChannel.IN_APP]: { ...defaultChannelSettings, name: ENotificationChannel.IN_APP },
				[ENotificationChannel.EMAIL]: { ...defaultChannelSettings, name: ENotificationChannel.EMAIL },
				[ENotificationChannel.TELEGRAM]: { ...defaultChannelSettings, name: ENotificationChannel.TELEGRAM },
				[ENotificationChannel.DISCORD]: { ...defaultChannelSettings, name: ENotificationChannel.DISCORD },
				[ENotificationChannel.SLACK]: { ...defaultChannelSettings, name: ENotificationChannel.SLACK },
				[ENotificationChannel.ELEMENT]: { ...defaultChannelSettings, name: ENotificationChannel.ELEMENT }
			},
			triggerPreferences: {}
		};
	}

	private static updatePreferenceSection(preferences: IUserNotificationSettings, request: IUpdateNotificationPreferencesRequest): IUserNotificationSettings {
		const updated = { ...preferences };

		switch (request.section) {
			case ENotifications.CHANNELS:
				return this.updateChannelPreferences(updated, request.key, request.value);
			case ENotifications.NETWORKS:
			case 'networks':
				return this.updateNetworkPreferences(updated, request.key, request.value, request.network);
			default:
				throw new APIError(ERROR_CODES.INVALID_PARAMS_ERROR, StatusCodes.BAD_REQUEST, 'Invalid preference section. Only channels and networks are supported.');
		}
	}

	private static updateChannelPreferences(updated: IUserNotificationSettings, key: string, value: unknown): IUserNotificationSettings {
		const channelPreferences = updated.channelPreferences || ({} as Record<ENotificationChannel, IUserNotificationChannelPreferences>);

		return {
			...updated,
			channelPreferences: {
				...channelPreferences,
				[key as ENotificationChannel]: {
					...channelPreferences[key as ENotificationChannel],
					...(value as IUserNotificationChannelPreferences)
				}
			}
		};
	}

	private static updateNetworkPreferences(updated: IUserNotificationSettings, key: string, value: unknown, network?: string): IUserNotificationSettings {
		const triggerPreferences = updated.triggerPreferences || {};

		if (key.includes('.')) {
			const [networkId, ...pathParts] = key.split('.');
			if (!networkId || pathParts.length === 0) return updated;

			const networkSettings =
				triggerPreferences[networkId] ||
				({
					name: networkId,
					enabled: true,
					importPrimarySettings: false
				} as IUserNotificationTriggerPreferences);

			const updatedSettings = JSON.parse(JSON.stringify(networkSettings)) as IUserNotificationTriggerPreferences;
			let pointer = updatedSettings as Record<string, unknown>;

			for (let i = 0; i < pathParts.length - 1; i += 1) {
				const pathPart = pathParts[i];
				if (pathPart) {
					if (!Object.prototype.hasOwnProperty.call(pointer, pathPart)) {
						pointer[pathPart] = {};
					}
					pointer = pointer[pathPart] as Record<string, unknown>;
				}
			}
			const lastPathPart = pathParts[pathParts.length - 1];
			if (lastPathPart) {
				pointer[lastPathPart] = value;
			}

			return {
				...updated,
				triggerPreferences: {
					...triggerPreferences,
					[networkId]: updatedSettings
				}
			};
		}

		if (!network) {
			throw new APIError(ERROR_CODES.INVALID_PARAMS_ERROR, StatusCodes.BAD_REQUEST, 'Network is required for network preferences');
		}

		const existingValue =
			triggerPreferences[network] ||
			({
				name: network,
				enabled: true,
				importPrimarySettings: false
			} as IUserNotificationTriggerPreferences);

		const newValue = typeof value === 'object' && value !== null ? (value as Partial<IUserNotificationTriggerPreferences>) : {};

		return {
			...updated,
			triggerPreferences: {
				...triggerPreferences,
				[network]: { ...existingValue, ...newValue }
			}
		};
	}

	private static validateVerificationToken(token: string, channel: ENotificationChannel, userId: number): boolean {
		if (!token || !token.startsWith(`${channel}_${userId}_`)) {
			return false;
		}

		const parts = token.split('_');
		if (parts.length !== 4) {
			return false;
		}

		const timestamp = parseInt(parts[2], 10);
		const now = Date.now();
		const oneHour = 60 * 60 * 1000;
		return now - timestamp < oneHour;
	}

	static async BulkUpdatePreferences(userId: number, preferences: Partial<IUserNotificationSettings>): Promise<IUserNotificationSettings> {
		const user = await OffChainDbService.GetUserById(userId);

		if (!user) {
			throw new APIError(ERROR_CODES.USER_NOT_FOUND, StatusCodes.NOT_FOUND, USER_NOT_FOUND_MESSAGE);
		}

		const currentPreferences = user.notificationPreferences || this.getDefaultPreferences();
		const updatedPreferences = { ...currentPreferences, ...preferences };

		await OffChainDbService.UpdateUserProfile({
			userId,
			newProfileDetails: user.profileDetails || {},
			notificationPreferences: updatedPreferences
		});

		return updatedPreferences;
	}

	static async BulkUpdateMultipleSections(userId: number, updates: Array<IUpdateNotificationPreferencesRequest>): Promise<IUserNotificationSettings> {
		const existingPromise = userUpdateMutex.get(userId);

		const updatePromise = (async () => {
			if (existingPromise) {
				try {
					await existingPromise;
				} catch {
					console.error('Error Updating the promise');
				}
			}

			return this.performBulkUpdate(userId, updates);
		})();

		userUpdateMutex.set(userId, { promise: updatePromise, timestamp: Date.now() });

		try {
			return await updatePromise;
		} finally {
			if (userUpdateMutex.get(userId)?.promise === updatePromise) {
				userUpdateMutex.delete(userId);
			}
		}
	}

	private static async performBulkUpdate(userId: number, updates: Array<IUpdateNotificationPreferencesRequest>): Promise<IUserNotificationSettings> {
		const user = await OffChainDbService.GetUserById(userId);
		if (!user) {
			throw new APIError(ERROR_CODES.USER_NOT_FOUND, StatusCodes.NOT_FOUND, USER_NOT_FOUND_MESSAGE);
		}

		let currentPreferences = user.notificationPreferences || this.getDefaultPreferences();

		const groupedUpdates = new Map<string, IUpdateNotificationPreferencesRequest>();

		updates.forEach((update) => {
			const updateKey = `${update.section}:${update.key}:${update.network || 'global'}`;

			if (groupedUpdates.has(updateKey)) {
				const existing = groupedUpdates.get(updateKey)!;
				if (typeof existing.value === 'object' && existing.value !== null && typeof update.value === 'object' && update.value !== null) {
					existing.value = { ...(existing.value as Record<string, unknown>), ...(update.value as Record<string, unknown>) };
				} else {
					existing.value = update.value;
				}
			} else {
				groupedUpdates.set(updateKey, { ...update });
			}
		});

		groupedUpdates.forEach((update) => {
			currentPreferences = this.updatePreferenceSection(currentPreferences, update);
		});

		await OffChainDbService.UpdateUserProfile({
			userId,
			newProfileDetails: user.profileDetails || {},
			notificationPreferences: currentPreferences
		});

		return currentPreferences;
	}
}
