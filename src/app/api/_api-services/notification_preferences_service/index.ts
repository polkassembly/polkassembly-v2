// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { OffChainDbService } from '@/app/api/_api-services/offchain_db_service';
import { APIError } from '@/app/api/_api-utils/apiError';
import { ERROR_CODES } from '@/_shared/_constants/errorLiterals';
import { StatusCodes } from 'http-status-codes';
import { ENotificationChannel, IUserNotificationSettings, IUserNotificationChannelPreferences } from '@/_shared/types';
import { IUserNotificationPreferences, INotificationChannelSettings } from '@/_shared/types/notifications';

const USER_NOT_FOUND_MESSAGE = 'User not found';

export class NotificationPreferencesService {
	/**
	 * Get user notification preferences with defaults
	 */
	static async GetUserNotificationPreferences(userId: number): Promise<IUserNotificationPreferences> {
		const user = await OffChainDbService.GetUserById(userId);

		if (!user) {
			throw new APIError(ERROR_CODES.USER_NOT_FOUND, StatusCodes.NOT_FOUND, USER_NOT_FOUND_MESSAGE);
		}

		// Convert existing preferences to new format or return defaults
		return this.convertToNewFormat(user.notificationPreferences) || this.getDefaultPreferences();
	}

	/**
	 * Update user notification preferences
	 */
	static async UpdateUserNotificationPreferences(userId: number, section: string, key: string, value: unknown): Promise<IUserNotificationPreferences> {
		const user = await OffChainDbService.GetUserById(userId);

		if (!user) {
			throw new APIError(ERROR_CODES.USER_NOT_FOUND, StatusCodes.NOT_FOUND, USER_NOT_FOUND_MESSAGE);
		}

		const currentPreferences = this.convertToNewFormat(user.notificationPreferences) || this.getDefaultPreferences();
		const updatedPreferences = this.updatePreferenceSection(currentPreferences, section, key, value);

		// Convert back to old format for storage
		const oldFormatPreferences = this.convertToOldFormat(updatedPreferences);

		// Update user in database
		await OffChainDbService.UpdateUserProfile({
			userId,
			newProfileDetails: user.profileDetails || {},
			notificationPreferences: oldFormatPreferences
		});

		return updatedPreferences;
	}

	/**
	 * Generate verification token for notification channels
	 */
	static async GenerateVerificationToken(userId: number, channel: ENotificationChannel): Promise<string> {
		const timestamp = Date.now();
		const randomBytes = crypto.getRandomValues(new Uint8Array(16));
		const randomString = Array.from(randomBytes, (byte) => byte.toString(16).padStart(2, '0')).join('');

		const token = `${channel}_${userId}_${timestamp}_${randomString}`;

		// Update user preferences with the new token
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

	/**
	 * Verify notification channel token
	 */
	static async VerifyChannelToken(userId: number, channel: ENotificationChannel, token: string, handle: string): Promise<boolean> {
		try {
			if (!this.validateVerificationToken(token, channel, userId)) {
				return false;
			}

			// Update channel as verified
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

	/**
	 * Convert old format to new format
	 */
	private static convertToNewFormat(oldPreferences?: IUserNotificationSettings): IUserNotificationPreferences | null {
		if (!oldPreferences) {
			return null;
		}

		// Convert old format to new format
		const newFormat: IUserNotificationPreferences = {
			channelPreferences: {},
			networkPreferences: {},
			postsNotifications: {
				proposalStatusChanges: { enabled: false, channels: {} },
				newProposalsInCategories: { enabled: false, channels: {} },
				votingDeadlineReminders: { enabled: false, channels: {} },
				updatesOnFollowedProposals: { enabled: false, channels: {} },
				proposalOutcomePublished: { enabled: false, channels: {} },
				proposalsYouVotedOnEnacted: { enabled: false, channels: {} }
			},
			commentsNotifications: {
				commentsOnMyProposals: { enabled: false, channels: {} },
				repliesToMyComments: { enabled: false, channels: {} },
				mentions: { enabled: false, channels: {} }
			},
			bountiesNotifications: {
				bountyApplicationStatusUpdates: { enabled: false, channels: {} },
				bountyPayoutsAndMilestones: { enabled: false, channels: {} },
				activityOnBountiesIFollow: { enabled: false, channels: {} }
			},
			openGovTracks: {},
			gov1Items: {}
		};

		// Convert channel preferences
		if (oldPreferences.channelPreferences) {
			Object.entries(oldPreferences.channelPreferences).forEach(([channel, settings]) => {
				const channelSettings = settings as IUserNotificationChannelPreferences;
				newFormat.channelPreferences[channel as ENotificationChannel] = {
					enabled: channelSettings.enabled,
					verified: channelSettings.verified,
					handle: channelSettings.handle,
					verificationToken: channelSettings.verification_token
				};
			});
		}

		// Convert other preferences if they exist in the old format
		const extendedPreferences = oldPreferences as Record<string, unknown>;

		if (extendedPreferences.openGovTracks) {
			newFormat.openGovTracks = extendedPreferences.openGovTracks as Record<string, unknown>;
		}

		if (extendedPreferences.gov1Items) {
			newFormat.gov1Items = extendedPreferences.gov1Items as Record<string, unknown>;
		}

		if (extendedPreferences.networkPreferences) {
			newFormat.networkPreferences = extendedPreferences.networkPreferences as Record<string, unknown>;
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

	/**
	 * Convert new format back to old format for storage
	 */
	private static convertToOldFormat(newPreferences: IUserNotificationPreferences): IUserNotificationSettings {
		const oldFormat: IUserNotificationSettings = {
			channelPreferences: {},
			triggerPreferences: {}
		};

		// Convert channel preferences back
		Object.entries(newPreferences.channelPreferences).forEach(([channel, settings]) => {
			const channelSettings = settings as INotificationChannelSettings;
			const channelData: IUserNotificationChannelPreferences = {
				name: channel as ENotificationChannel,
				enabled: channelSettings.enabled,
				handle: channelSettings.handle || '',
				verified: channelSettings.verified || false
			};

			// Only include verification_token if it's not undefined
			if (channelSettings.verificationToken !== undefined) {
				(channelData as Record<string, unknown>).verification_token = channelSettings.verificationToken;
			}

			oldFormat.channelPreferences[channel] = channelData;
		});

		// Include all other preferences in the old format
		const extendedOldFormat = oldFormat as Record<string, unknown>;
		extendedOldFormat.openGovTracks = newPreferences.openGovTracks;
		extendedOldFormat.gov1Items = newPreferences.gov1Items;
		extendedOldFormat.networkPreferences = newPreferences.networkPreferences;
		extendedOldFormat.postsNotifications = newPreferences.postsNotifications;
		extendedOldFormat.commentsNotifications = newPreferences.commentsNotifications;
		extendedOldFormat.bountiesNotifications = newPreferences.bountiesNotifications;

		return oldFormat;
	}

	/**
	 * Get default notification preferences
	 */
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

		// Default advanced settings - all disabled
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

		const defaultOpenGovTracks: Record<string, unknown> = {};
		trackLabels.forEach((track) => {
			defaultOpenGovTracks[track] = { ...defaultAdvancedSettings };
		});

		const defaultGov1Items: Record<string, unknown> = {};
		gov1Labels.forEach((item) => {
			defaultGov1Items[item] = { ...defaultAdvancedSettings };
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

	/**
	 * Update specific preference section
	 */
	private static updatePreferenceSection(preferences: IUserNotificationPreferences, section: string, key: string, value: unknown): IUserNotificationPreferences {
		const updated = { ...preferences };

		switch (section) {
			case 'channels':
				if (!updated.channelPreferences) {
					updated.channelPreferences = {} as Record<ENotificationChannel, INotificationChannelSettings>;
				}
				updated.channelPreferences[key as ENotificationChannel] = {
					...updated.channelPreferences[key as ENotificationChannel],
					...(value as INotificationChannelSettings)
				};
				break;

			case 'networks':
				if (!updated.networkPreferences) {
					updated.networkPreferences = {};
				}
				updated.networkPreferences[key] = value as { enabled: boolean; importPrimarySettings: boolean };
				break;

			case 'posts':
				if (!updated.postsNotifications) {
					updated.postsNotifications = {} as IUserNotificationPreferences['postsNotifications'];
				}
				(updated.postsNotifications as Record<string, unknown>)[key] = value;
				break;

			case 'comments':
				if (!updated.commentsNotifications) {
					updated.commentsNotifications = {} as IUserNotificationPreferences['commentsNotifications'];
				}
				(updated.commentsNotifications as Record<string, unknown>)[key] = value;
				break;

			case 'bounties':
				if (!updated.bountiesNotifications) {
					updated.bountiesNotifications = {} as IUserNotificationPreferences['bountiesNotifications'];
				}
				(updated.bountiesNotifications as Record<string, unknown>)[key] = value;
				break;

			case 'opengov':
				if (!updated.openGovTracks) {
					updated.openGovTracks = {};
				}
				updated.openGovTracks[key] = value as Record<string, unknown>;
				break;

			case 'gov1':
				if (!updated.gov1Items) {
					updated.gov1Items = {};
				}
				updated.gov1Items[key] = value as Record<string, unknown>;
				break;

			default:
				throw new APIError(ERROR_CODES.INVALID_PARAMS_ERROR, StatusCodes.BAD_REQUEST, 'Invalid preference section');
		}

		return updated;
	}

	/**
	 * Validate verification token
	 */
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
		const oneHour = 60 * 60 * 1000; // 1 hour in milliseconds

		// Token expires after 1 hour
		return now - timestamp < oneHour;
	}

	/**
	 * Bulk update preferences (for importing settings across networks)
	 */
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

	/**
	 * Bulk update multiple preference sections at once
	 */
	static async BulkUpdateMultipleSections(userId: number, updates: Array<{ section: string; key: string; value: unknown }>): Promise<IUserNotificationPreferences> {
		const user = await OffChainDbService.GetUserById(userId);

		if (!user) {
			throw new APIError(ERROR_CODES.USER_NOT_FOUND, StatusCodes.NOT_FOUND, USER_NOT_FOUND_MESSAGE);
		}

		let currentPreferences = this.convertToNewFormat(user.notificationPreferences) || this.getDefaultPreferences();

		// Apply all updates
		updates.forEach((update) => {
			currentPreferences = this.updatePreferenceSection(currentPreferences, update.section, update.key, update.value);
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
