// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { OffChainDbService } from '@/app/api/_api-services/offchain_db_service';
import { APIError } from '@/app/api/_api-utils/apiError';
import { ERROR_CODES } from '@/_shared/_constants/errorLiterals';
import { StatusCodes } from 'http-status-codes';
import {
	ENotificationChannel,
	IUserNotificationSettings,
	IUserNotificationChannelPreferences,
	IUserNotificationPreferences,
	INotificationChannelSettings,
	IOpenGovTrackSettings,
	IGov1ItemSettings,
	INetworkNotificationSettings
} from '@/_shared/types';

const USER_NOT_FOUND_MESSAGE = 'User not found';

const userUpdateMutex = new Map<number, Promise<unknown>>();

export class NotificationPreferencesService {
	static async GetUserNotificationPreferences(userId: number, network?: string): Promise<IUserNotificationPreferences> {
		const user = await OffChainDbService.GetUserById(userId);

		if (!user) {
			throw new APIError(ERROR_CODES.USER_NOT_FOUND, StatusCodes.NOT_FOUND, USER_NOT_FOUND_MESSAGE);
		}

		const preferences = this.convertToNewFormat(user.notificationPreferences) || this.getDefaultPreferences();

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
			await userUpdateMutex.get(userId);
		}

		const updatePromise = this.performSingleUpdate(userId, section, key, value, network);
		userUpdateMutex.set(userId, updatePromise);

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

		const currentPreferences = this.convertToNewFormat(user.notificationPreferences) || this.getDefaultPreferences();
		const updatedPreferences = this.updatePreferenceSection(currentPreferences, section, key, value, network);

		const oldFormatPreferences = this.convertToOldFormat(updatedPreferences);

		await OffChainDbService.UpdateUserProfile({
			userId,
			newProfileDetails: user.profileDetails || {},
			notificationPreferences: oldFormatPreferences
		});

		return updatedPreferences;
	}

	static async GenerateVerificationToken(userId: number, channel: ENotificationChannel): Promise<string> {
		const timestamp = Date.now();
		const randomBytes = crypto.getRandomValues(new Uint8Array(16));
		const randomString = Array.from(randomBytes, (byte) => byte.toString(16).padStart(2, '0')).join('');

		const token = `${channel}_${userId}_${timestamp}_${randomString}`;

		const currentPreferences = await this.GetUserNotificationPreferences(userId);
		const updatedPreferences = this.updatePreferenceSection(currentPreferences, 'channels', channel, {
			...currentPreferences.channelPreferences[channel],
			verificationToken: token
		});

		const user = await OffChainDbService.GetUserById(userId);
		if (user) {
			const oldFormatPreferences = this.convertToOldFormat(updatedPreferences);
			await OffChainDbService.UpdateUserProfile({
				userId,
				newProfileDetails: user.profileDetails || {},
				notificationPreferences: oldFormatPreferences
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
			const updatedChannelSettings = {
				enabled: channelSettings.enabled,
				verified: true,
				handle
			};
			const updatedPreferences = this.updatePreferenceSection(currentPreferences, 'channels', channel, updatedChannelSettings);

			const user = await OffChainDbService.GetUserById(userId);
			if (user) {
				const oldFormatPreferences = this.convertToOldFormat(updatedPreferences);
				await OffChainDbService.UpdateUserProfile({
					userId,
					newProfileDetails: user.profileDetails || {},
					notificationPreferences: oldFormatPreferences
				});
			}

			return true;
		} catch {
			return false;
		}
	}

	private static convertToNewFormat(oldPreferences?: IUserNotificationSettings): IUserNotificationPreferences | null {
		if (!oldPreferences) {
			return null;
		}

		const defaultChannels = {
			[ENotificationChannel.EMAIL]: false,
			[ENotificationChannel.TELEGRAM]: false,
			[ENotificationChannel.DISCORD]: false,
			[ENotificationChannel.SLACK]: false,
			[ENotificationChannel.ELEMENT]: false
		};

		const newFormat: IUserNotificationPreferences = {
			channelPreferences: {
				[ENotificationChannel.EMAIL]: { enabled: false, verified: false },
				[ENotificationChannel.TELEGRAM]: { enabled: false, verified: false },
				[ENotificationChannel.DISCORD]: { enabled: false, verified: false },
				[ENotificationChannel.SLACK]: { enabled: false, verified: false },
				[ENotificationChannel.ELEMENT]: { enabled: false, verified: false }
			},
			networkPreferences: {},
			postsNotifications: {
				proposalStatusChanges: { enabled: false, channels: { ...defaultChannels } },
				newProposalsInCategories: { enabled: false, channels: { ...defaultChannels } },
				votingDeadlineReminders: { enabled: false, channels: { ...defaultChannels } },
				updatesOnFollowedProposals: { enabled: false, channels: { ...defaultChannels } },
				proposalOutcomePublished: { enabled: false, channels: { ...defaultChannels } },
				proposalsYouVotedOnEnacted: { enabled: false, channels: { ...defaultChannels } }
			},
			commentsNotifications: {
				commentsOnMyProposals: { enabled: false, channels: { ...defaultChannels } },
				repliesToMyComments: { enabled: false, channels: { ...defaultChannels } },
				mentions: { enabled: false, channels: { ...defaultChannels } }
			},
			bountiesNotifications: {
				bountyApplicationStatusUpdates: { enabled: false, channels: { ...defaultChannels } },
				bountyPayoutsAndMilestones: { enabled: false, channels: { ...defaultChannels } },
				activityOnBountiesIFollow: { enabled: false, channels: { ...defaultChannels } }
			},
			openGovTracks: {},
			gov1Items: {}
		};

		if (oldPreferences.channelPreferences) {
			Object.entries(oldPreferences.channelPreferences).forEach(([channel, settings]) => {
				const channelSettings = settings as IUserNotificationChannelPreferences;
				newFormat.channelPreferences[channel as ENotificationChannel] = {
					enabled: channelSettings.enabled,
					verified: channelSettings.verified,
					handle: channelSettings.handle,
					verification_token: channelSettings.verification_token
				};
			});
		}

		const extendedPreferences = oldPreferences as unknown as Record<string, unknown>;

		if (extendedPreferences.openGovTracks) {
			newFormat.openGovTracks = extendedPreferences.openGovTracks as Record<string, IOpenGovTrackSettings>;
		}

		if (extendedPreferences.gov1Items) {
			newFormat.gov1Items = extendedPreferences.gov1Items as Record<string, IGov1ItemSettings>;
		}

		if (extendedPreferences.networkPreferences) {
			newFormat.networkPreferences = extendedPreferences.networkPreferences as Record<string, INetworkNotificationSettings>;
		}

		if (extendedPreferences.postsNotifications) {
			newFormat.postsNotifications = extendedPreferences.postsNotifications as IUserNotificationPreferences['postsNotifications'];
		}

		if (extendedPreferences.commentsNotifications) {
			newFormat.commentsNotifications = extendedPreferences.commentsNotifications as IUserNotificationPreferences['commentsNotifications'];
		}

		if (extendedPreferences.bountiesNotifications) {
			newFormat.bountiesNotifications = extendedPreferences.bountiesNotifications as IUserNotificationPreferences['bountiesNotifications'];
		}

		return newFormat;
	}

	private static convertToOldFormat(newPreferences: IUserNotificationPreferences): IUserNotificationSettings {
		const oldFormat: IUserNotificationSettings = {
			channelPreferences: {},
			triggerPreferences: {}
		};

		Object.entries(newPreferences.channelPreferences).forEach(([channel, settings]) => {
			const channelSettings = settings as INotificationChannelSettings;
			const channelData: IUserNotificationChannelPreferences = {
				name: channel as ENotificationChannel,
				enabled: channelSettings.enabled,
				handle: channelSettings.handle || '',
				verified: channelSettings.verified || false
			};

			if (channelSettings.verification_token !== undefined) {
				(channelData as unknown as Record<string, unknown>).verification_token = channelSettings.verification_token;
			}

			oldFormat.channelPreferences[channel] = channelData;
		});

		const extendedOldFormat = oldFormat as unknown as Record<string, unknown>;
		extendedOldFormat.openGovTracks = newPreferences.openGovTracks;
		extendedOldFormat.gov1Items = newPreferences.gov1Items;
		extendedOldFormat.networkPreferences = newPreferences.networkPreferences;
		extendedOldFormat.postsNotifications = newPreferences.postsNotifications;
		extendedOldFormat.commentsNotifications = newPreferences.commentsNotifications;
		extendedOldFormat.bountiesNotifications = newPreferences.bountiesNotifications;

		return oldFormat;
	}

	private static getDefaultNetworkPreferences() {
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
		const existingNetworkPrefs = networkPreferences[key] || this.getDefaultNetworkPreferences();

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
		const networkSettings = networkPreferences[networkId] || this.getDefaultNetworkPreferences();

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

		const currentPreferences = this.convertToNewFormat(user.notificationPreferences) || this.getDefaultPreferences();
		const updatedPreferences = { ...currentPreferences, ...preferences };

		const oldFormatPreferences = this.convertToOldFormat(updatedPreferences);

		await OffChainDbService.UpdateUserProfile({
			userId,
			newProfileDetails: user.profileDetails || {},
			notificationPreferences: oldFormatPreferences
		});

		return updatedPreferences;
	}

	static async BulkUpdateMultipleSections(userId: number, updates: Array<{ section: string; key: string; value: unknown }>): Promise<IUserNotificationPreferences> {
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

		userUpdateMutex.set(userId, updatePromise);

		try {
			return await updatePromise;
		} finally {
			if (userUpdateMutex.get(userId) === updatePromise) {
				userUpdateMutex.delete(userId);
			}
		}
	}

	private static async performBulkUpdate(userId: number, updates: Array<{ section: string; key: string; value: unknown }>): Promise<IUserNotificationPreferences> {
		const user = await OffChainDbService.GetUserById(userId);
		if (!user) {
			throw new APIError(ERROR_CODES.USER_NOT_FOUND, StatusCodes.NOT_FOUND, USER_NOT_FOUND_MESSAGE);
		}

		let currentPreferences = this.convertToNewFormat(user.notificationPreferences) || this.getDefaultPreferences();

		updates.forEach((update) => {
			if (update.section === 'networks') {
				if (!currentPreferences.networkPreferences) {
					currentPreferences.networkPreferences = {};
				}

				const updateValue = update.value as Record<string, unknown>;

				if (!currentPreferences.networkPreferences[update.key]) {
					currentPreferences.networkPreferences[update.key] = this.getDefaultNetworkPreferences() as INetworkNotificationSettings;
				}

				const existingNetworkPrefs = currentPreferences.networkPreferences[update.key] as unknown as Record<string, unknown>;

				currentPreferences.networkPreferences[update.key] = {
					...existingNetworkPrefs,
					...updateValue
				} as unknown as INetworkNotificationSettings;
			} else {
				const updateWithNetwork = update as { section: string; key: string; value: unknown; network?: string };
				currentPreferences = this.updatePreferenceSection(currentPreferences, updateWithNetwork.section, updateWithNetwork.key, updateWithNetwork.value, updateWithNetwork.network);
			}
		});

		const oldFormatPreferences = this.convertToOldFormat(currentPreferences);

		await OffChainDbService.UpdateUserProfile({
			userId,
			newProfileDetails: user.profileDetails || {},
			notificationPreferences: oldFormatPreferences
		});

		return currentPreferences;
	}
}
