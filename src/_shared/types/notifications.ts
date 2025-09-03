// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ENotificationChannel } from '@/_shared/types';

export interface INotificationChannelSettings {
	enabled: boolean;
	handle?: string;
	verification_token?: string;
	verified?: boolean;
}

export interface INotificationTypeSettings {
	enabled: boolean;
	channels: Record<ENotificationChannel, boolean>;
}

export interface IOpenGovTrackSettings {
	enabled: boolean;
	notifications: {
		newReferendumSubmitted: boolean;
		referendumInVoting: boolean;
		referendumClosed: boolean;
	};
}

export interface IGov1ItemSettings {
	enabled: boolean;
	notifications?: Record<string, boolean>;
}

export interface IUserNotificationPreferences {
	channelPreferences: Record<ENotificationChannel, INotificationChannelSettings>;
	networkPreferences: Record<
		string,
		{
			enabled: boolean;
			importPrimarySettings: boolean;
		}
	>;
	postsNotifications: {
		proposalStatusChanges: INotificationTypeSettings;
		newProposalsInCategories: INotificationTypeSettings;
		votingDeadlineReminders: INotificationTypeSettings;
		updatesOnFollowedProposals: INotificationTypeSettings;
		proposalOutcomePublished: INotificationTypeSettings;
		proposalsYouVotedOnEnacted: INotificationTypeSettings;
	};
	commentsNotifications: {
		commentsOnMyProposals: INotificationTypeSettings;
		repliesToMyComments: INotificationTypeSettings;
		mentions: INotificationTypeSettings;
	};
	bountiesNotifications: {
		bountyApplicationStatusUpdates: INotificationTypeSettings;
		bountyPayoutsAndMilestones: INotificationTypeSettings;
		activityOnBountiesIFollow: INotificationTypeSettings;
	};
	openGovTracks: Record<string, IOpenGovTrackSettings>;
	gov1Items: Record<string, IGov1ItemSettings>;
}

export interface IUpdateNotificationPreferencesRequest {
	section: 'channels' | 'networks' | 'posts' | 'comments' | 'bounties' | 'opengov' | 'gov1';
	key: string;
	value: unknown;
	network?: string;
}

export interface INetworkSettings {
	id: string;
	name: string;
	color: string;
	removable: boolean;
}
