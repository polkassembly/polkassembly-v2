// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { getSharedEnvVars } from '@/_shared/_utils/getSharedEnvVars';
import { IS_NOTIFICATION_SERVICE_ENABLED, NOTIFICATION_ENGINE_API_KEY } from '@api/_api-constants/apiEnvVars';
import { APIError } from '@api/_api-utils/apiError';
import { ERROR_CODES } from '@shared/_constants/errorLiterals';
import { ENetwork, ENotificationTrigger, ESocial, IUser } from '@shared/types';
import { StatusCodes } from 'http-status-codes';
import { OffChainDbService } from '@api/_api-services/offchain_db_service';

interface IChannelPreference {
	enabled: boolean;
	verified: boolean;
}

interface ITrackPreference {
	enabled: boolean;
}

if (IS_NOTIFICATION_SERVICE_ENABLED && !NOTIFICATION_ENGINE_API_KEY) {
	throw new APIError(ERROR_CODES.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR, 'IS_NOTIFICATION_SERVICE_ENABLED is true but NOTIFICATION_ENGINE_API_KEY is not set');
}

export class NotificationService {
	private static NOTIFICATION_ENGINE_URL = 'https://us-central1-notification-engine-672e0.cloudfunctions.net';

	private static DEFAULT_NOTIFICATION_NETWORK = getSharedEnvVars().NEXT_PUBLIC_DEFAULT_NETWORK as ENetwork;

	private static firebaseFunctionsHeader = (network: string) => ({
		Accept: 'application/json',
		'Content-Type': 'application/json',
		'x-api-key': NOTIFICATION_ENGINE_API_KEY,
		'x-network': network,
		'x-source': 'polkassembly_v2'
	});

	private static async getUsersWithEnabledNotifications({ network, trigger }: { network: ENetwork; trigger: ENotificationTrigger }): Promise<number[]> {
		try {
			if (!Object.values(ENetwork).includes(network)) {
				console.error('Invalid network parameter:', network);
				return [];
			}

			const users = await OffChainDbService.GetUsersWithNotificationPreferences();

			return users
				.filter((user: IUser) => {
					if (!user.notificationPreferences) return false;

					const { triggerPreferences } = user.notificationPreferences;
					if (!triggerPreferences || !Object.prototype.hasOwnProperty.call(triggerPreferences, network)) {
						return false;
					}
					const networkPrefs = Object.prototype.hasOwnProperty.call(triggerPreferences, network) ? triggerPreferences[network as keyof typeof triggerPreferences] : null;
					if (!networkPrefs) return false;

					const hasEnabledChannels = Object.values(user.notificationPreferences.channelPreferences || {}).some(
						(channel: IChannelPreference) => channel.enabled && channel.verified
					);

					if (!hasEnabledChannels) return false;

					switch (trigger) {
						case ENotificationTrigger.NEW_PROPOSAL:
							return networkPrefs.myProposals?.enabled || false;
						case ENotificationTrigger.NEW_COMMENT:
							return networkPrefs.subscribedPosts?.enabled || false;
						case ENotificationTrigger.STATUS_CHANGE:
							return networkPrefs.myProposals?.enabled || false;
						case ENotificationTrigger.NEW_REFERENDUM:
							return networkPrefs.openGov?.tracks ? Object.values(networkPrefs.openGov.tracks).some((track: ITrackPreference) => track.enabled) : false;
						default:
							return false;
					}
				})
				.map((user: IUser) => user.id);
		} catch (error) {
			console.error('Error getting users with enabled notifications:', error);
			return [];
		}
	}

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
			const res = await fetch(`${this.NOTIFICATION_ENGINE_URL}/notify`, {
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

	static async SendVerificationEmail(user: IUser, network: ENetwork, token: string, email?: string): Promise<void> {
		if (!email) return;

		await this.sendNotification({
			network: user.primaryNetwork || this.DEFAULT_NOTIFICATION_NETWORK,
			trigger: ENotificationTrigger.VERIFY_EMAIL,
			args: {
				email: email || user.email,
				verifyUrl: `https://${network}.polkassembly.io/confirm-verification?social=${ESocial.EMAIL}&token=${token}`
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

	static async SendProposalNotification({
		network = this.DEFAULT_NOTIFICATION_NETWORK,
		proposalId,
		proposalTitle,
		proposalType,
		userId
	}: {
		network?: ENetwork;
		proposalId: string;
		proposalTitle: string;
		proposalType: string;
		userId?: number;
	}) {
		const enabledUserIds = await this.getUsersWithEnabledNotifications({
			network,
			trigger: ENotificationTrigger.NEW_PROPOSAL
		});

		if (enabledUserIds.length === 0) {
			console.log(`No users have enabled NEW_PROPOSAL notifications for ${network}`);
			return;
		}

		await this.SendBulkNotification({
			network,
			trigger: ENotificationTrigger.NEW_PROPOSAL,
			userIds: enabledUserIds,
			commonArgs: {
				proposalId,
				proposalTitle,
				proposalType,
				...(userId && { authorUserId: userId.toString() })
			}
		});
	}

	static async SendCommentNotification({
		network = this.DEFAULT_NOTIFICATION_NETWORK,
		postId,
		commentId,
		commentContent,
		userId
	}: {
		network?: ENetwork;
		postId: string;
		commentId: string;
		commentContent: string;
		userId?: number;
	}) {
		const enabledUserIds = await this.getUsersWithEnabledNotifications({
			network,
			trigger: ENotificationTrigger.NEW_COMMENT
		});

		if (enabledUserIds.length === 0) {
			console.log(`No users have enabled NEW_COMMENT notifications for ${network}`);
			return;
		}

		await this.SendBulkNotification({
			network,
			trigger: ENotificationTrigger.NEW_COMMENT,
			userIds: enabledUserIds,
			commonArgs: {
				postId,
				commentId,
				commentContent: commentContent.substring(0, 200),
				...(userId && { authorUserId: userId.toString() })
			}
		});
	}

	static async SendStatusChangeNotification({
		network = this.DEFAULT_NOTIFICATION_NETWORK,
		postId,
		newStatus,
		oldStatus,
		userId
	}: {
		network?: ENetwork;
		postId: string;
		newStatus: string;
		oldStatus: string;
		userId?: number;
	}) {
		const enabledUserIds = await this.getUsersWithEnabledNotifications({
			network,
			trigger: ENotificationTrigger.STATUS_CHANGE
		});

		if (enabledUserIds.length === 0) {
			console.log(`No users have enabled STATUS_CHANGE notifications for ${network}`);
			return;
		}

		await this.SendBulkNotification({
			network,
			trigger: ENotificationTrigger.STATUS_CHANGE,
			userIds: enabledUserIds,
			commonArgs: {
				postId,
				newStatus,
				oldStatus,
				...(userId && { authorUserId: userId.toString() })
			}
		});
	}

	static async SendReferendumNotification({
		network = this.DEFAULT_NOTIFICATION_NETWORK,
		referendumId,
		referendumTitle,
		track,
		userId
	}: {
		network?: ENetwork;
		referendumId: string;
		referendumTitle: string;
		track?: string;
		userId?: number;
	}) {
		const enabledUserIds = await this.getUsersWithEnabledNotifications({
			network,
			trigger: ENotificationTrigger.NEW_REFERENDUM
		});

		if (enabledUserIds.length === 0) {
			console.log(`No users have enabled NEW_REFERENDUM notifications for ${network}`);
			return;
		}

		await this.SendBulkNotification({
			network,
			trigger: ENotificationTrigger.NEW_REFERENDUM,
			userIds: enabledUserIds,
			commonArgs: {
				referendumId,
				referendumTitle,
				...(track && { track }),
				...(userId && { authorUserId: userId.toString() })
			}
		});
	}

	static async SendBulkNotification({
		network = this.DEFAULT_NOTIFICATION_NETWORK,
		trigger,
		userIds,
		commonArgs,
		batchSize = 50
	}: {
		network?: ENetwork;
		trigger: ENotificationTrigger;
		userIds: number[];
		commonArgs: Record<string, string>;
		batchSize?: number;
	}) {
		const batches: number[][] = [];
		let currentIndex = 0;
		while (currentIndex < userIds.length) {
			batches.push(userIds.slice(currentIndex, currentIndex + batchSize));
			currentIndex += batchSize;
		}

		const processBatch = async (batch: number[], isLastBatch: boolean) => {
			await Promise.all(
				batch.map((userId) =>
					this.sendNotification({
						network,
						trigger,
						args: {
							...commonArgs,
							userId: userId.toString()
						}
					})
				)
			);

			if (!isLastBatch) {
				await new Promise((resolve) => {
					setTimeout(resolve, 100);
				});
			}
		};

		await batches.reduce(async (previousPromise, batch, index) => {
			await previousPromise;
			return processBatch(batch, index === batches.length - 1);
		}, Promise.resolve());
	}

	static async SendTestNotification({
		network = this.DEFAULT_NOTIFICATION_NETWORK,
		userId,
		message = 'Test notification from Polkassembly'
	}: {
		network?: ENetwork;
		userId: number;
		message?: string;
	}) {
		await this.sendNotification({
			network,
			trigger: ENotificationTrigger.TEST,
			args: {
				userId: userId.toString(),
				message
			}
		});
	}

	static async GetChannelVerifyToken({ network = this.DEFAULT_NOTIFICATION_NETWORK, channel, userId }: { network?: ENetwork; channel: string; userId: string }): Promise<string> {
		if (!IS_NOTIFICATION_SERVICE_ENABLED || !NOTIFICATION_ENGINE_API_KEY) {
			throw new APIError(ERROR_CODES.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR, 'IS_NOTIFICATION_SERVICE_ENABLED or NOTIFICATION_ENGINE_API_KEY not found');
		}

		try {
			const res = await fetch(`${this.NOTIFICATION_ENGINE_URL}/getChannelVerifyToken`, {
				body: JSON.stringify({
					channel,
					userId
				}),
				headers: this.firebaseFunctionsHeader(network),
				method: 'POST'
			});

			const { data: verifyToken, error: verifyTokenError } = (await res.json()) as {
				data: string;
				error: string;
			};

			if (verifyTokenError) {
				throw new APIError(ERROR_CODES.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR, verifyTokenError);
			}

			if (!verifyToken) {
				throw new APIError(ERROR_CODES.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR, 'No verification token received');
			}

			return verifyToken;
		} catch (error) {
			console.error('Error generating verification token:', error);
			throw new APIError(ERROR_CODES.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR, 'Error in generating token');
		}
	}
}
