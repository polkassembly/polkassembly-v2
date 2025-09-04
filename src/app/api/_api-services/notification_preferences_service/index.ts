// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { OffChainDbService } from '@/app/api/_api-services/offchain_db_service';
import { APIError } from '@/app/api/_api-utils/apiError';
import { ERROR_CODES } from '@/_shared/_constants/errorLiterals';
import { StatusCodes } from 'http-status-codes';
import {
	ENotificationChannel,
	IUserNotificationPreferences,
	INotificationChannelSettings,
	IOpenGovTrackSettings,
	IGov1ItemSettings,
	INetworkNotificationSettings
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
	static async GetUserNotificationPreferences(userId: number, network?: string): Promise<IUserNotificationPreferences> {
		const user = await OffChainDbService.GetUserById(userId);

		if (!user) {
			throw new APIError(ERROR_CODES.USER_NOT_FOUND, StatusCodes.NOT_FOUND, USER_NOT_FOUND_MESSAGE);
		}

		const preferences = user.notificationPreferences || this.getDefaultPreferences();

		if (network && preferences.networkPreferences?.[network]) {
			return {
				...preferences,
				networkPreferences: {
					[network]: preferences.networkPreferences[network]
				}
			};
		}

		return preferences;
	}

	static async UpdateUserNotificationPreferences(userId: number, section: string, key: string, value: unknown, network?: string): Promise<IUserNotificationPreferences> {
		if (userUpdateMutex.has(userId)) {
			await userUpdateMutex.get(userId)?.promise;
		}

		const updatePromise = this.performSingleUpdate(userId, section, key, value, network);
		userUpdateMutex.set(userId, { promise: updatePromise, timestamp: Date.now() });

		try {
			return await updatePromise;
		} finally {
			userUpdateMutex.delete(userId);
		}
	}

	private static async performSingleUpdate(userId: number, section: string, key: string, value: unknown, network?: string): Promise<IUserNotificationPreferences> {
		const user = await OffChainDbService.GetUserById(userId);

		if (!user) {
			throw new APIError(ERROR_CODES.USER_NOT_FOUND, StatusCodes.NOT_FOUND, USER_NOT_FOUND_MESSAGE);
		}

		const currentPreferences = user.notificationPreferences || this.getDefaultPreferences();
		const updatedPreferences = this.updatePreferenceSection(currentPreferences, section, key, value, network);

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
		const updatedPreferences = this.updatePreferenceSection(currentPreferences, 'channels', channel, {
			...currentPreferences.channelPreferences[channel],
			verification_token: token,
			verificationMetadata: tokenMetadata
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
			const updatedPreferences = this.updatePreferenceSection(currentPreferences, 'channels', channel, updatedChannelSettings);

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

	private static getDefaultNetworkPreferences(userChannelPreferences?: Record<string, INotificationChannelSettings>) {
		const enabledChannels: Record<string, boolean> = {};
		let hasEnabledChannels = false;

		if (userChannelPreferences) {
			Object.entries(userChannelPreferences).forEach(([channel, settings]) => {
				if (settings.enabled && settings.verified) {
					enabledChannels[channel] = true;
					hasEnabledChannels = true;
				} else {
					enabledChannels[channel] = false;
				}
			});
		} else {
			Object.values(ENotificationChannel).forEach((channel) => {
				enabledChannels[channel as string] = false;
			});
		}

		const defaultNotificationSettings = {
			enabled: hasEnabledChannels,
			channels: enabledChannels
		};

		const defaultAdvancedSettings = {
			enabled: false,
			notifications: {
				newReferendumSubmitted: false,
				referendumInVoting: false,
				referendumClosed: false
			}
		};

		const trackLabels = [
			'root',
			'stakingAdmin',
			'auctionAdmin',
			'treasurer',
			'referendumCanceller',
			'referendumKiller',
			'leaseAdmin',
			'memberReferenda',
			'smallTipper',
			'bigTipper',
			'smallSpender',
			'mediumSpender',
			'bigSpender',
			'fellowshipAdmin',
			'generalAdmin',
			'whitelistedCaller'
		];

		const gov1Labels = ['mentionsIReceive', 'referendums', 'proposals', 'bounties', 'childBounties', 'tips', 'techCommittee', 'councilMotion'];

		const defaultOpenGovTracks: Record<string, IOpenGovTrackSettings> = {};
		trackLabels.forEach((track) => {
			defaultOpenGovTracks[track] = { ...defaultAdvancedSettings } as IOpenGovTrackSettings;
		});

		const defaultGov1Items: Record<string, IGov1ItemSettings> = {};
		gov1Labels.forEach((item) => {
			defaultGov1Items[item] = { ...defaultAdvancedSettings } as IGov1ItemSettings;
		});

		return {
			enabled: false,
			isPrimary: false,
			importPrimarySettings: false,
			postsNotifications: {
				proposalStatusChanges: { ...defaultNotificationSettings },
				newProposalsInCategories: { ...defaultNotificationSettings },
				votingDeadlineReminders: { ...defaultNotificationSettings },
				updatesOnFollowedProposals: { ...defaultNotificationSettings },
				proposalOutcomePublished: { ...defaultNotificationSettings },
				proposalsYouVotedOnEnacted: { ...defaultNotificationSettings }
			},
			commentsNotifications: {
				commentsOnMyProposals: { ...defaultNotificationSettings },
				repliesToMyComments: { ...defaultNotificationSettings },
				mentions: { ...defaultNotificationSettings }
			},
			bountiesNotifications: {
				bountyApplicationStatusUpdates: { ...defaultNotificationSettings },
				bountyPayoutsAndMilestones: { ...defaultNotificationSettings },
				activityOnBountiesIFollow: { ...defaultNotificationSettings }
			},
			openGovTracks: defaultOpenGovTracks,
			gov1Items: defaultGov1Items
		};
	}

	private static getDefaultPreferences(): IUserNotificationPreferences {
		const defaultChannelSettings: INotificationChannelSettings = {
			enabled: false,
			verified: false
		};

		const defaultNotificationSettings = {
			enabled: false,
			channels: {
				[ENotificationChannel.EMAIL]: false,
				[ENotificationChannel.TELEGRAM]: false,
				[ENotificationChannel.DISCORD]: false,
				[ENotificationChannel.SLACK]: false,
				[ENotificationChannel.ELEMENT]: false
			}
		};

		const defaultAdvancedSettings = {
			enabled: false,
			notifications: {
				newReferendumSubmitted: false,
				referendumInVoting: false,
				referendumClosed: false
			}
		};

		const trackLabels = [
			'root',
			'stakingAdmin',
			'auctionAdmin',
			'treasurer',
			'referendumCanceller',
			'referendumKiller',
			'leaseAdmin',
			'memberReferenda',
			'smallTipper',
			'bigTipper',
			'smallSpender',
			'mediumSpender',
			'bigSpender',
			'fellowshipAdmin',
			'generalAdmin',
			'whitelistedCaller'
		];

		const gov1Labels = ['mentionsIReceive', 'referendums', 'proposals', 'bounties', 'childBounties', 'tips', 'techCommittee', 'councilMotion'];

		const defaultOpenGovTracks: Record<string, IOpenGovTrackSettings> = {};
		trackLabels.forEach((track) => {
			defaultOpenGovTracks[track] = { ...defaultAdvancedSettings } as IOpenGovTrackSettings;
		});

		const defaultGov1Items: Record<string, IGov1ItemSettings> = {};
		gov1Labels.forEach((item) => {
			defaultGov1Items[item] = { ...defaultAdvancedSettings } as IGov1ItemSettings;
		});

		return {
			channelPreferences: {
				[ENotificationChannel.EMAIL]: { ...defaultChannelSettings },
				[ENotificationChannel.TELEGRAM]: { ...defaultChannelSettings },
				[ENotificationChannel.DISCORD]: { ...defaultChannelSettings },
				[ENotificationChannel.SLACK]: { ...defaultChannelSettings },
				[ENotificationChannel.ELEMENT]: { ...defaultChannelSettings }
			},
			networkPreferences: {},
			postsNotifications: {
				proposalStatusChanges: { ...defaultNotificationSettings },
				newProposalsInCategories: { ...defaultNotificationSettings },
				votingDeadlineReminders: { ...defaultNotificationSettings },
				updatesOnFollowedProposals: { ...defaultNotificationSettings },
				proposalOutcomePublished: { ...defaultNotificationSettings },
				proposalsYouVotedOnEnacted: { ...defaultNotificationSettings }
			},
			commentsNotifications: {
				commentsOnMyProposals: { ...defaultNotificationSettings },
				repliesToMyComments: { ...defaultNotificationSettings },
				mentions: { ...defaultNotificationSettings }
			},
			bountiesNotifications: {
				bountyApplicationStatusUpdates: { ...defaultNotificationSettings },
				bountyPayoutsAndMilestones: { ...defaultNotificationSettings },
				activityOnBountiesIFollow: { ...defaultNotificationSettings }
			},
			openGovTracks: defaultOpenGovTracks,
			gov1Items: defaultGov1Items
		};
	}

	private static updatePreferenceSection(preferences: IUserNotificationPreferences, section: string, key: string, value: unknown, network?: string): IUserNotificationPreferences {
		const updated = { ...preferences };

		switch (section) {
			case 'channels':
				return this.updateChannelPreferences(updated, key, value);
			case 'networks':
				return this.updateNetworkPreferences(updated, key, value, network);
			case 'posts':
				return this.updatePostsPreferences(updated, key, value);
			case 'comments':
				return this.updateCommentsPreferences(updated, key, value);
			case 'bounties':
				return this.updateBountiesPreferences(updated, key, value);
			case 'opengov':
				return this.updateOpenGovPreferences(updated, key, value);
			case 'gov1':
				return this.updateGov1Preferences(updated, key, value);
			default:
				throw new APIError(ERROR_CODES.INVALID_PARAMS_ERROR, StatusCodes.BAD_REQUEST, 'Invalid preference section');
		}
	}

	private static updateChannelPreferences(updated: IUserNotificationPreferences, key: string, value: unknown): IUserNotificationPreferences {
		const channelPreferences = updated.channelPreferences || ({} as Record<ENotificationChannel, INotificationChannelSettings>);

		return {
			...updated,
			channelPreferences: {
				...channelPreferences,
				[key as ENotificationChannel]: {
					...channelPreferences[key as ENotificationChannel],
					...(value as INotificationChannelSettings)
				}
			}
		};
	}

	private static updateNetworkPreferences(updated: IUserNotificationPreferences, key: string, value: unknown, network?: string): IUserNotificationPreferences {
		const networkPreferences = updated.networkPreferences || {};

		if (key.includes('.') && network) {
			return this.updateNestedNetworkPreferences(updated, key, value);
		}

		const newValue = value as Record<string, unknown>;
		const existingNetworkPrefs = networkPreferences[key] || this.getDefaultNetworkPreferences(updated.channelPreferences);

		return {
			...updated,
			networkPreferences: {
				...networkPreferences,
				[key]: {
					...existingNetworkPrefs,
					...newValue
				} as INetworkNotificationSettings
			}
		};
	}

	private static updateNestedNetworkPreferences(updated: IUserNotificationPreferences, key: string, value: unknown): IUserNotificationPreferences {
		const [networkId, ...pathParts] = key.split('.');
		const networkPreferences = updated.networkPreferences || {};
		const networkSettings = networkPreferences[networkId] || this.getDefaultNetworkPreferences(updated.channelPreferences);

		const updatedNetworkSettings = JSON.parse(JSON.stringify(networkSettings));
		let current = updatedNetworkSettings as Record<string, unknown>;

		for (let i = 0; i < pathParts.length - 1; i += 1) {
			if (!current[pathParts[i]]) {
				current[pathParts[i]] = {};
			}
			current = current[pathParts[i]] as Record<string, unknown>;
		}
		current[pathParts[pathParts.length - 1]] = value;

		return {
			...updated,
			networkPreferences: {
				...networkPreferences,
				[networkId]: updatedNetworkSettings as INetworkNotificationSettings
			}
		};
	}

	private static updatePostsPreferences(updated: IUserNotificationPreferences, key: string, value: unknown): IUserNotificationPreferences {
		const postsNotifications = updated.postsNotifications || ({} as IUserNotificationPreferences['postsNotifications']);

		return {
			...updated,
			postsNotifications: {
				...postsNotifications,
				[key]: value
			} as IUserNotificationPreferences['postsNotifications']
		};
	}

	private static updateCommentsPreferences(updated: IUserNotificationPreferences, key: string, value: unknown): IUserNotificationPreferences {
		const result = { ...updated };
		if (!result.commentsNotifications) {
			result.commentsNotifications = {} as IUserNotificationPreferences['commentsNotifications'];
		}
		(result.commentsNotifications as Record<string, unknown>)[key] = value;
		return result;
	}

	private static updateBountiesPreferences(updated: IUserNotificationPreferences, key: string, value: unknown): IUserNotificationPreferences {
		const result = { ...updated };
		if (!result.bountiesNotifications) {
			result.bountiesNotifications = {} as IUserNotificationPreferences['bountiesNotifications'];
		}
		(result.bountiesNotifications as Record<string, unknown>)[key] = value;
		return result;
	}

	private static updateOpenGovPreferences(updated: IUserNotificationPreferences, key: string, value: unknown): IUserNotificationPreferences {
		const result = { ...updated };
		if (!result.openGovTracks) {
			result.openGovTracks = {};
		}
		result.openGovTracks[key] = value as IOpenGovTrackSettings;
		return result;
	}

	private static updateGov1Preferences(updated: IUserNotificationPreferences, key: string, value: unknown): IUserNotificationPreferences {
		const result = { ...updated };
		if (!result.gov1Items) {
			result.gov1Items = {};
		}
		result.gov1Items[key] = value as IGov1ItemSettings;
		return result;
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

	static async BulkUpdatePreferences(userId: number, preferences: Partial<IUserNotificationPreferences>): Promise<IUserNotificationPreferences> {
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

	static async BulkUpdateMultipleSections(
		userId: number,
		updates: Array<{ section: string; key: string; value: unknown; network?: string }>
	): Promise<IUserNotificationPreferences> {
		const existingPromise = userUpdateMutex.get(userId);

		const updatePromise = (async () => {
			if (existingPromise) {
				try {
					await existingPromise;
				} catch {
					// Ignore errors from previous updates
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

	private static async performBulkUpdate(
		userId: number,
		updates: Array<{ section: string; key: string; value: unknown; network?: string }>
	): Promise<IUserNotificationPreferences> {
		const user = await OffChainDbService.GetUserById(userId);
		if (!user) {
			throw new APIError(ERROR_CODES.USER_NOT_FOUND, StatusCodes.NOT_FOUND, USER_NOT_FOUND_MESSAGE);
		}

		let currentPreferences = user.notificationPreferences || this.getDefaultPreferences();

		const groupedUpdates = new Map<string, { section: string; key: string; value: unknown; network?: string }>();

		updates.forEach((update) => {
			const updateKey = `${update.section}:${update.key}`;

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
			if (update.section === 'networks') {
				if (!currentPreferences.networkPreferences) {
					currentPreferences.networkPreferences = {};
				}

				if (update.key.includes('.')) {
					currentPreferences = this.updateNestedNetworkPreferences(currentPreferences, update.key, update.value);
				} else {
					const updateValue = update.value as Record<string, unknown>;

					if (!currentPreferences.networkPreferences[update.key]) {
						currentPreferences.networkPreferences[update.key] = this.getDefaultNetworkPreferences(currentPreferences.channelPreferences) as INetworkNotificationSettings;
					}

					const existingNetworkPrefs = currentPreferences.networkPreferences[update.key] as unknown as Record<string, unknown>;

					currentPreferences.networkPreferences[update.key] = {
						...existingNetworkPrefs,
						...updateValue
					} as unknown as INetworkNotificationSettings;
				}
			} else {
				currentPreferences = this.updatePreferenceSection(currentPreferences, update.section, update.key, update.value, update.network);
			}
		});

		await OffChainDbService.UpdateUserProfile({
			userId,
			newProfileDetails: user.profileDetails || {},
			notificationPreferences: currentPreferences
		});

		return currentPreferences;
	}
}
