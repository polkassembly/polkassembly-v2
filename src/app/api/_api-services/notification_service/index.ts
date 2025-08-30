// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { getSharedEnvVars } from '@/_shared/_utils/getSharedEnvVars';
import { IS_NOTIFICATION_SERVICE_ENABLED, NOTIFICATION_ENGINE_API_KEY } from '@api/_api-constants/apiEnvVars';
import { APIError } from '@api/_api-utils/apiError';
import { ERROR_CODES } from '@shared/_constants/errorLiterals';
import { ENetwork, ENotificationChannel, ENotificationTrigger, EProposalType, ESocial, IUser } from '@shared/types';
import { StatusCodes } from 'http-status-codes';
import { OffChainDbService } from '@api/_api-services/offchain_db_service';

interface IChannelPreference {
	enabled: boolean;
	verified: boolean;
}

if (IS_NOTIFICATION_SERVICE_ENABLED && !NOTIFICATION_ENGINE_API_KEY) {
	throw new APIError(ERROR_CODES.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR, 'IS_NOTIFICATION_SERVICE_ENABLED is true but NOTIFICATION_ENGINE_API_KEY is not set');
}

export class NotificationService {
	private static NOTIFICATION_ENGINE_URL = 'https://us-central1-notification-engine-672e0.cloudfunctions.net';

	private static DEFAULT_NOTIFICATION_NETWORK = getSharedEnvVars().NEXT_PUBLIC_DEFAULT_NETWORK as ENetwork;

	private static NOTIFICATION_SERVICE_ERROR_MESSAGE = 'IS_NOTIFICATION_SERVICE_ENABLED or NOTIFICATION_ENGINE_API_KEY not found';

	private static firebaseFunctionsHeader = (network: string) => ({
		Accept: 'application/json',
		'Content-Type': 'application/json',
		'x-api-key': NOTIFICATION_ENGINE_API_KEY,
		'x-network': network,
		'x-source': 'polkassembly_v2'
	});

	private static async getUsersWithEnabledNotifications({ network, trigger, track }: { network: ENetwork; trigger: ENotificationTrigger; track?: string }): Promise<number[]> {
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

					const hasEnabledChannels = Object.entries(user.notificationPreferences.channelPreferences || {}).some(
						([channelType, channel]: [string, IChannelPreference]) => channel.enabled && (channelType === ENotificationChannel.IN_APP || channel.verified)
					);

					if (!hasEnabledChannels) return false;

					const prefs = networkPrefs as Record<string, unknown>;
					switch (trigger) {
						case ENotificationTrigger.NEW_PROPOSAL:
						case ENotificationTrigger.OWN_PROPOSAL_CREATED:
							return (prefs?.myProposals as { enabled?: boolean })?.enabled || false;
						case ENotificationTrigger.NEW_COMMENT:
						case ENotificationTrigger.SUBSCRIBED_POST_COMMENT:
							return (prefs?.subscribedPosts as { enabled?: boolean })?.enabled || false;
						case ENotificationTrigger.STATUS_CHANGE:
							return (prefs?.myProposals as { enabled?: boolean })?.enabled || false;
						case ENotificationTrigger.NEW_REFERENDUM:
						case ENotificationTrigger.REFERENDUM_VOTING:
						case ENotificationTrigger.REFERENDUM_CLOSED: {
							const tracks = (prefs?.openGov as { tracks?: Record<string, { enabled?: boolean }> })?.tracks || {};
							if (track && Object.prototype.hasOwnProperty.call(tracks, track)) {
								return !!tracks[track]?.enabled;
							}
							return Object.values(tracks).some((trackConfig) => trackConfig.enabled);
						}
						case ENotificationTrigger.COUNCIL_MOTION_SUBMITTED:
						case ENotificationTrigger.COUNCIL_MOTION_VOTING:
						case ENotificationTrigger.COUNCIL_MOTION_CLOSED:
							return (prefs?.gov1 as { councilMotions?: { enabled?: boolean } })?.councilMotions?.enabled || false;
						case ENotificationTrigger.TREASURY_PROPOSAL_SUBMITTED:
						case ENotificationTrigger.TREASURY_PROPOSAL_VOTING:
						case ENotificationTrigger.TREASURY_PROPOSAL_CLOSED:
							return (prefs?.gov1 as { treasuryProposals?: { enabled?: boolean } })?.treasuryProposals?.enabled || false;
						case ENotificationTrigger.BOUNTY_SUBMITTED:
						case ENotificationTrigger.BOUNTY_CLOSED:
						case ENotificationTrigger.BOUNTY_CLAIMED:
							return (prefs?.gov1 as { bounties?: { enabled?: boolean } })?.bounties?.enabled || false;
						case ENotificationTrigger.CHILD_BOUNTY_SUBMITTED:
						case ENotificationTrigger.CHILD_BOUNTY_CLOSED:
							return (prefs?.gov1 as { childBounties?: { enabled?: boolean } })?.childBounties?.enabled || false;
						case ENotificationTrigger.TIP_SUBMITTED:
						case ENotificationTrigger.TIP_OPENED:
						case ENotificationTrigger.TIP_CLOSED:
							return (prefs?.gov1 as { tips?: { enabled?: boolean } })?.tips?.enabled || false;
						case ENotificationTrigger.TECH_COMMITTEE_SUBMITTED:
						case ENotificationTrigger.TECH_COMMITTEE_CLOSED:
							return (prefs?.gov1 as { techCommittee?: { enabled?: boolean } })?.techCommittee?.enabled || false;
						case ENotificationTrigger.MENTION:
							return (prefs?.mentions as { enabled?: boolean })?.enabled || false;
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
			throw new APIError(ERROR_CODES.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR, this.NOTIFICATION_SERVICE_ERROR_MESSAGE);
		}

		try {
			const ac = new AbortController();
			const timeout = setTimeout(() => ac.abort(), 10_000);

			const res = await fetch(`${this.NOTIFICATION_ENGINE_URL}/notify`, {
				body: JSON.stringify({
					args,
					trigger
				}),
				headers: this.firebaseFunctionsHeader(network),
				method: 'POST',
				signal: ac.signal
			});

			clearTimeout(timeout);

			if (!res.ok) {
				throw new APIError(ERROR_CODES.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR, `Notification HTTP ${res.status}`);
			}

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
		proposalType: EProposalType;
		userId?: number;
	}) {
		if (!userId) {
			console.log('No author userId provided for proposal notification');
			return;
		}

		const enabledUserIds = await this.getUsersWithEnabledNotifications({
			network,
			trigger: ENotificationTrigger.OWN_PROPOSAL_CREATED
		});

		const authorNotificationIds = enabledUserIds.filter((id) => id === userId);

		if (authorNotificationIds.length === 0) {
			console.log(`Author ${userId} does not have OWN_PROPOSAL_CREATED notifications enabled for ${network}`);
			return;
		}

		await this.SendBulkNotification({
			network,
			trigger: ENotificationTrigger.OWN_PROPOSAL_CREATED,
			userIds: authorNotificationIds,
			commonArgs: {
				proposalId,
				proposalTitle,
				proposalType,
				authorUserId: userId.toString()
			}
		});
	}

	static async SendCommentNotification({
		network = this.DEFAULT_NOTIFICATION_NETWORK,
		postId,
		commentId,
		commentContent,
		userId,
		proposalType
	}: {
		network?: ENetwork;
		postId: string;
		commentId: string;
		commentContent: string;
		userId?: number;
		proposalType: EProposalType;
	}) {
		try {
			const postSubscribers = await OffChainDbService.GetPostSubscribers({
				network,
				indexOrHash: postId,
				proposalType
			});

			if (postSubscribers.length === 0) {
				console.log(`No subscribers found for post ${postId} on ${network}`);
				return;
			}

			const enabledUserIds = await this.getUsersWithEnabledNotifications({
				network,
				trigger: ENotificationTrigger.SUBSCRIBED_POST_COMMENT
			});

			const targetUserIds = enabledUserIds.filter((id) => postSubscribers.includes(id) && id !== userId);

			if (targetUserIds.length === 0) {
				console.log(`No eligible subscribers for comment notification on post ${postId}`);
				return;
			}

			await this.SendBulkNotification({
				network,
				trigger: ENotificationTrigger.SUBSCRIBED_POST_COMMENT,
				userIds: targetUserIds,
				commonArgs: {
					postId,
					commentId,
					commentContent: commentContent.substring(0, 200),
					...(userId && { authorUserId: userId.toString() })
				}
			});
		} catch (error) {
			console.error('Error sending comment notification:', error);
		}
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
			trigger: ENotificationTrigger.NEW_REFERENDUM,
			track
		});

		if (enabledUserIds.length === 0) {
			const trackInfo = track ? ` (track: ${track})` : '';
			console.log(`No users have enabled NEW_REFERENDUM notifications for ${network}${trackInfo}`);
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

	static async SendCouncilMotionNotification({
		network = this.DEFAULT_NOTIFICATION_NETWORK,
		motionId,
		motionTitle,
		trigger,
		userId
	}: {
		network?: ENetwork;
		motionId: string;
		motionTitle: string;
		trigger: ENotificationTrigger.COUNCIL_MOTION_SUBMITTED | ENotificationTrigger.COUNCIL_MOTION_VOTING | ENotificationTrigger.COUNCIL_MOTION_CLOSED;
		userId?: number;
	}) {
		const enabledUserIds = await this.getUsersWithEnabledNotifications({ network, trigger });
		if (enabledUserIds.length === 0) return;

		await this.SendBulkNotification({
			network,
			trigger,
			userIds: enabledUserIds,
			commonArgs: {
				motionId,
				motionTitle,
				...(userId && { authorUserId: userId.toString() })
			}
		});
	}

	static async SendTreasuryProposalNotification({
		network = this.DEFAULT_NOTIFICATION_NETWORK,
		proposalId,
		proposalTitle,
		trigger,
		userId
	}: {
		network?: ENetwork;
		proposalId: string;
		proposalTitle: string;
		trigger: ENotificationTrigger.TREASURY_PROPOSAL_SUBMITTED | ENotificationTrigger.TREASURY_PROPOSAL_VOTING | ENotificationTrigger.TREASURY_PROPOSAL_CLOSED;
		userId?: number;
	}) {
		const enabledUserIds = await this.getUsersWithEnabledNotifications({ network, trigger });
		if (enabledUserIds.length === 0) return;

		await this.SendBulkNotification({
			network,
			trigger,
			userIds: enabledUserIds,
			commonArgs: {
				proposalId,
				proposalTitle,
				...(userId && { authorUserId: userId.toString() })
			}
		});
	}

	static async SendBountyNotification({
		network = this.DEFAULT_NOTIFICATION_NETWORK,
		bountyId,
		bountyTitle,
		trigger,
		userId
	}: {
		network?: ENetwork;
		bountyId: string;
		bountyTitle: string;
		trigger: ENotificationTrigger.BOUNTY_SUBMITTED | ENotificationTrigger.BOUNTY_CLOSED | ENotificationTrigger.BOUNTY_CLAIMED;
		userId?: number;
	}) {
		const enabledUserIds = await this.getUsersWithEnabledNotifications({ network, trigger });
		if (enabledUserIds.length === 0) return;

		await this.SendBulkNotification({
			network,
			trigger,
			userIds: enabledUserIds,
			commonArgs: {
				bountyId,
				bountyTitle,
				...(userId && { authorUserId: userId.toString() })
			}
		});
	}

	static async SendChildBountyNotification({
		network = this.DEFAULT_NOTIFICATION_NETWORK,
		childBountyId,
		childBountyTitle,
		parentBountyId,
		trigger,
		userId
	}: {
		network?: ENetwork;
		childBountyId: string;
		childBountyTitle: string;
		parentBountyId: string;
		trigger: ENotificationTrigger.CHILD_BOUNTY_SUBMITTED | ENotificationTrigger.CHILD_BOUNTY_CLOSED;
		userId?: number;
	}) {
		const enabledUserIds = await this.getUsersWithEnabledNotifications({ network, trigger });
		if (enabledUserIds.length === 0) return;

		await this.SendBulkNotification({
			network,
			trigger,
			userIds: enabledUserIds,
			commonArgs: {
				childBountyId,
				childBountyTitle,
				parentBountyId,
				...(userId && { authorUserId: userId.toString() })
			}
		});
	}

	static async SendTipNotification({
		network = this.DEFAULT_NOTIFICATION_NETWORK,
		tipId,
		tipTitle,
		trigger,
		userId
	}: {
		network?: ENetwork;
		tipId: string;
		tipTitle: string;
		trigger: ENotificationTrigger.TIP_SUBMITTED | ENotificationTrigger.TIP_OPENED | ENotificationTrigger.TIP_CLOSED;
		userId?: number;
	}) {
		const enabledUserIds = await this.getUsersWithEnabledNotifications({ network, trigger });
		if (enabledUserIds.length === 0) return;

		await this.SendBulkNotification({
			network,
			trigger,
			userIds: enabledUserIds,
			commonArgs: {
				tipId,
				tipTitle,
				...(userId && { authorUserId: userId.toString() })
			}
		});
	}

	static async SendTechCommitteeNotification({
		network = this.DEFAULT_NOTIFICATION_NETWORK,
		techCommitteeProposalId,
		techCommitteeProposalTitle,
		trigger,
		userId
	}: {
		network?: ENetwork;
		techCommitteeProposalId: string;
		techCommitteeProposalTitle: string;
		trigger: ENotificationTrigger.TECH_COMMITTEE_SUBMITTED | ENotificationTrigger.TECH_COMMITTEE_CLOSED;
		userId?: number;
	}) {
		const enabledUserIds = await this.getUsersWithEnabledNotifications({ network, trigger });
		if (enabledUserIds.length === 0) return;

		await this.SendBulkNotification({
			network,
			trigger,
			userIds: enabledUserIds,
			commonArgs: {
				techCommitteeProposalId,
				techCommitteeProposalTitle,
				...(userId && { authorUserId: userId.toString() })
			}
		});
	}

	static async SendReferendumVotingNotification({
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
			trigger: ENotificationTrigger.REFERENDUM_VOTING,
			track
		});
		if (enabledUserIds.length === 0) return;

		await this.SendBulkNotification({
			network,
			trigger: ENotificationTrigger.REFERENDUM_VOTING,
			userIds: enabledUserIds,
			commonArgs: {
				referendumId,
				referendumTitle,
				...(track && { track }),
				...(userId && { authorUserId: userId.toString() })
			}
		});
	}

	static async SendReferendumClosedNotification({
		network = this.DEFAULT_NOTIFICATION_NETWORK,
		referendumId,
		referendumTitle,
		track,
		result,
		userId
	}: {
		network?: ENetwork;
		referendumId: string;
		referendumTitle: string;
		track?: string;
		result?: string;
		userId?: number;
	}) {
		const enabledUserIds = await this.getUsersWithEnabledNotifications({
			network,
			trigger: ENotificationTrigger.REFERENDUM_CLOSED,
			track
		});
		if (enabledUserIds.length === 0) return;

		await this.SendBulkNotification({
			network,
			trigger: ENotificationTrigger.REFERENDUM_CLOSED,
			userIds: enabledUserIds,
			commonArgs: {
				referendumId,
				referendumTitle,
				...(track && { track }),
				...(result && { result }),
				...(userId && { authorUserId: userId.toString() })
			}
		});
	}

	static async SendMentionNotification({
		network = this.DEFAULT_NOTIFICATION_NETWORK,
		postId,
		postTitle,
		mentionedUserId,
		mentionerUserId,
		commentId
	}: {
		network?: ENetwork;
		postId: string;
		postTitle: string;
		mentionedUserId: number;
		mentionerUserId: number;
		commentId?: string;
	}) {
		const enabled = (await this.getUsersWithEnabledNotifications({ network, trigger: ENotificationTrigger.MENTION })).includes(mentionedUserId);
		if (!enabled) return;

		await this.sendNotification({
			network,
			trigger: ENotificationTrigger.MENTION,
			args: {
				userId: mentionedUserId.toString(),
				postId,
				postTitle,
				mentionerUserId: mentionerUserId.toString(),
				...(commentId && { commentId })
			}
		});
	}

	static async GetChannelVerifyToken({ network = this.DEFAULT_NOTIFICATION_NETWORK, channel, userId }: { network?: ENetwork; channel: string; userId: string }): Promise<string> {
		if (!IS_NOTIFICATION_SERVICE_ENABLED || !NOTIFICATION_ENGINE_API_KEY) {
			throw new APIError(ERROR_CODES.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR, this.NOTIFICATION_SERVICE_ERROR_MESSAGE);
		}

		try {
			const ac = new AbortController();
			const timeout = setTimeout(() => ac.abort(), 10_000);

			const res = await fetch(`${this.NOTIFICATION_ENGINE_URL}/getChannelVerifyToken`, {
				body: JSON.stringify({
					channel,
					userId
				}),
				headers: this.firebaseFunctionsHeader(network),
				method: 'POST',
				signal: ac.signal
			});

			clearTimeout(timeout);

			if (!res.ok) {
				throw new APIError(ERROR_CODES.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR, `Token generation HTTP ${res.status}`);
			}

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

	static async VerifyChannelToken({
		network = this.DEFAULT_NOTIFICATION_NETWORK,
		channel,
		userId,
		handle,
		token
	}: {
		network?: ENetwork;
		channel: string;
		userId: string;
		handle: string;
		token: string;
	}): Promise<boolean> {
		if (!IS_NOTIFICATION_SERVICE_ENABLED || !NOTIFICATION_ENGINE_API_KEY) {
			throw new APIError(ERROR_CODES.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR, this.NOTIFICATION_SERVICE_ERROR_MESSAGE);
		}

		try {
			const ac = new AbortController();
			const timeout = setTimeout(() => ac.abort(), 10_000);

			const res = await fetch(`${this.NOTIFICATION_ENGINE_URL}/verifyChannelToken`, {
				method: 'POST',
				headers: this.firebaseFunctionsHeader(network),
				body: JSON.stringify({ channel, userId, handle, token }),
				signal: ac.signal
			});

			clearTimeout(timeout);

			if (!res.ok) {
				throw new APIError(ERROR_CODES.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR, `Channel verification HTTP ${res.status}`);
			}

			const { data, error } = (await res.json()) as { data?: { verified: boolean }; error?: string };

			if (error || !data) {
				throw new APIError(ERROR_CODES.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR, error || 'Error in verifying token');
			}

			return !!data.verified;
		} catch (error) {
			console.error('Channel verification failed', error);
			throw new APIError(ERROR_CODES.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR, 'Channel verification failed');
		}
	}
}
