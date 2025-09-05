// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useCallback, useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { IUserNotificationSettings, IUpdateNotificationPreferencesRequest, IUserNotificationChannelPreferences, ENotificationChannel, ENotifications } from '@/_shared/types';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { STALE_TIME } from '@/_shared/_constants/listingLimit';
import { useUser } from './useUser';

const fetchNotificationPreferences = async (userId: number, network?: string, getAllNetworks?: boolean): Promise<IUserNotificationSettings> => {
	const headers: Record<string, string> = {
		'Content-Type': 'application/json'
	};

	if (network) {
		headers['x-network'] = network;
	}

	const url = new URL(`/api/v2/users/id/${userId}/notifications`, window.location.origin);
	if (getAllNetworks) {
		url.searchParams.set('allNetworks', 'true');
	}

	const response = await fetch(url.toString(), {
		method: 'GET',
		headers
	});

	if (!response.ok) {
		throw new Error('Failed to fetch notification preferences');
	}

	const result = await response.json();
	return result.data;
};

const updateNotificationPreferences = async (userId: number, updateData: IUpdateNotificationPreferencesRequest, network?: string): Promise<IUserNotificationSettings> => {
	const headers: Record<string, string> = {
		'Content-Type': 'application/json'
	};

	if (network) {
		headers['x-network'] = network;
	}

	const response = await fetch(`/api/v2/users/id/${userId}/notifications`, {
		method: 'PUT',
		headers,
		body: JSON.stringify(updateData)
	});

	if (!response.ok) {
		throw new Error('Failed to update notification preferences');
	}

	const result = await response.json();
	return result.data;
};

const bulkUpdateNotificationPreferences = async (
	userId: number,
	updates: Array<{ section: string; key: string; value: unknown; network?: string }>,
	network?: string
): Promise<IUserNotificationSettings> => {
	const headers: Record<string, string> = {
		'Content-Type': 'application/json'
	};

	if (network) {
		headers['x-network'] = network;
	}

	const response = await fetch(`/api/v2/users/id/${userId}/notifications`, {
		method: 'PUT',
		headers,
		body: JSON.stringify({ updates })
	});

	if (!response.ok) {
		throw new Error('Failed to bulk update notification preferences');
	}

	const result = await response.json();
	return result.data;
};

const generateVerificationToken = async (userId: number, channel: ENotificationChannel): Promise<string> => {
	const response = await fetch(`/api/v2/users/id/${userId}/notifications/generate-token`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ channel })
	});

	if (!response.ok) {
		throw new Error('Failed to generate verification token');
	}

	const result = await response.json();
	return result.data.token;
};

const verifyChannelToken = async (userId: number, channel: ENotificationChannel, token: string, handle: string): Promise<boolean> => {
	const response = await fetch(`/api/v2/users/id/${userId}/notifications/verify-token`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ channel, token, handle })
	});

	if (!response.ok) {
		return false;
	}

	const result = await response.json();
	return result.data.verified;
};

export const useNotificationPreferences = (getAllNetworks?: boolean) => {
	const { user } = useUser();
	const queryClient = useQueryClient();
	const currentNetwork = getCurrentNetwork();

	const queryKey = useMemo(() => ['notificationPreferences', user?.id, getAllNetworks ? 'all' : currentNetwork], [user?.id, currentNetwork, getAllNetworks]);

	const {
		data: preferences,
		isLoading: isFetching,
		error: queryError
	} = useQuery({
		queryKey,
		queryFn: () => fetchNotificationPreferences(user!.id, getAllNetworks ? undefined : currentNetwork, getAllNetworks),
		enabled: !!user?.id,
		staleTime: STALE_TIME,
		refetchOnWindowFocus: false,
		refetchOnMount: false,
		refetchOnReconnect: false,
		refetchInterval: false
	});

	const mutation = useMutation({
		mutationFn: (updateData: IUpdateNotificationPreferencesRequest) => updateNotificationPreferences(user!.id, updateData, getAllNetworks ? undefined : currentNetwork),
		onSuccess: (data) => {
			queryClient.setQueryData(queryKey, data);
			if (getAllNetworks) {
				queryClient.setQueryData(['notificationPreferences', user?.id, currentNetwork], data);
			}
			queryClient.invalidateQueries({ queryKey: ['notificationPreferences', user?.id] });
		}
	});

	const bulkMutation = useMutation({
		mutationFn: (updates: Array<{ section: string; key: string; value: unknown; network?: string }>) =>
			bulkUpdateNotificationPreferences(user!.id, updates, getAllNetworks ? undefined : currentNetwork),
		onSuccess: (data) => {
			queryClient.setQueryData(queryKey, data);
			if (getAllNetworks) {
				queryClient.setQueryData(['notificationPreferences', user?.id, currentNetwork], data);
			}
			queryClient.invalidateQueries({ queryKey: ['notificationPreferences', user?.id] });
		}
	});

	const updateChannelPreference = useCallback(
		(channel: ENotificationChannel, settings: Partial<IUserNotificationChannelPreferences>) => {
			if (!user?.id) return;

			mutation.mutate({
				section: ENotifications.CHANNELS,
				key: channel,
				value: settings
			});
		},
		[user?.id, mutation]
	);

	const updateNetworkPreference = useCallback(
		(networkId: string, settings: { enabled: boolean; isPrimary?: boolean; importPrimarySettings: boolean }) => {
			if (!user?.id) return;

			mutation.mutate({
				section: ENotifications.NETWORKS,
				key: networkId,
				value: settings
			});
		},
		[user?.id, mutation]
	);

	const updatePostsNotification = useCallback(
		(type: string, settings: unknown) => {
			if (!user?.id) return;

			mutation.mutate({
				section: ENotifications.POSTS,
				key: type,
				value: settings
			});
		},
		[user?.id, mutation]
	);

	const updateNetworkPostsNotification = useCallback(
		(network: string, type: string, settings: unknown) => {
			if (!user?.id) return;

			mutation.mutate({
				section: ENotifications.NETWORKS,
				key: `${network}.postsNotifications.${type}`,
				value: settings,
				network
			});
		},
		[user?.id, mutation]
	);

	const bulkUpdatePostsNotifications = useCallback(
		(enabled: boolean) => {
			if (!user?.id || !preferences) return;

			const postsKeys = [
				'proposalStatusChanges',
				'newProposalsInCategories',
				'votingDeadlineReminders',
				'updatesOnFollowedProposals',
				'proposalOutcomePublished',
				'proposalsYouVotedOnEnacted'
			];

			const updates: Array<{ section: string; key: string; value: unknown; network?: string }> = [];

			postsKeys.forEach((key) => {
				const { postsNotifications } = preferences;
				const currentSettings =
					postsNotifications && Object.prototype.hasOwnProperty.call(postsNotifications, key) ? postsNotifications[key as keyof typeof postsNotifications] : undefined;
				const updatedSettings = currentSettings ? { ...currentSettings, enabled } : { enabled, channels: {} };
				updates.push({
					section: 'posts',
					key,
					value: updatedSettings
				});
			});

			bulkMutation.mutate(updates);
		},
		[user?.id, preferences, bulkMutation]
	);

	const bulkUpdateNetworkPostsNotifications = useCallback(
		(network: string, enabled: boolean) => {
			if (!user?.id || !preferences) return;

			const postsKeys = [
				'proposalStatusChanges',
				'newProposalsInCategories',
				'votingDeadlineReminders',
				'updatesOnFollowedProposals',
				'proposalOutcomePublished',
				'proposalsYouVotedOnEnacted'
			];

			const updates: Array<{ section: string; key: string; value: unknown; network?: string }> = [];

			postsKeys.forEach((key) => {
				const networkPostsNotifications = preferences.networkPreferences?.[network]?.postsNotifications;
				const currentSettings =
					networkPostsNotifications && Object.prototype.hasOwnProperty.call(networkPostsNotifications, key)
						? networkPostsNotifications[key as keyof typeof networkPostsNotifications]
						: undefined;
				const updatedSettings = currentSettings ? { ...currentSettings, enabled } : { enabled, channels: {} };
				updates.push({
					section: 'networks',
					key: `${network}.postsNotifications.${key}`,
					value: updatedSettings,
					network
				});
			});

			bulkMutation.mutate(updates);
		},
		[user?.id, preferences, bulkMutation]
	);

	const updateCommentsNotification = useCallback(
		(type: string, settings: unknown) => {
			if (!user?.id) return;

			mutation.mutate({
				section: ENotifications.COMMENTS,
				key: type,
				value: settings
			});
		},
		[user?.id, mutation]
	);

	const updateNetworkCommentsNotification = useCallback(
		(network: string, type: string, settings: unknown) => {
			if (!user?.id) return;

			mutation.mutate({
				section: ENotifications.NETWORKS,
				key: `${network}.commentsNotifications.${type}`,
				value: settings,
				network
			});
		},
		[user?.id, mutation]
	);

	const bulkUpdateCommentsNotifications = useCallback(
		(enabled: boolean) => {
			if (!user?.id || !preferences) return;

			const commentsKeys = ['commentsOnMyProposals', 'repliesToMyComments', 'mentions'];

			const updates: Array<{ section: string; key: string; value: unknown; network?: string }> = [];

			commentsKeys.forEach((key) => {
				const { commentsNotifications } = preferences;
				const currentSettings =
					commentsNotifications && Object.prototype.hasOwnProperty.call(commentsNotifications, key) ? commentsNotifications[key as keyof typeof commentsNotifications] : undefined;
				const updatedSettings = currentSettings ? { ...currentSettings, enabled } : { enabled, channels: {} };
				updates.push({
					section: 'comments',
					key,
					value: updatedSettings
				});
			});

			bulkMutation.mutate(updates);
		},
		[user?.id, preferences, bulkMutation]
	);

	const bulkUpdateNetworkCommentsNotifications = useCallback(
		(network: string, enabled: boolean) => {
			if (!user?.id || !preferences) return;

			const commentsKeys = ['commentsOnMyProposals', 'repliesToMyComments', 'mentions'];

			const updates: Array<{ section: string; key: string; value: unknown; network?: string }> = [];

			commentsKeys.forEach((key) => {
				const networkCommentsNotifications = preferences.networkPreferences?.[network]?.commentsNotifications;
				const currentSettings =
					networkCommentsNotifications && Object.prototype.hasOwnProperty.call(networkCommentsNotifications, key)
						? networkCommentsNotifications[key as keyof typeof networkCommentsNotifications]
						: undefined;
				const updatedSettings = currentSettings ? { ...currentSettings, enabled } : { enabled, channels: {} };
				updates.push({
					section: 'networks',
					key: `${network}.commentsNotifications.${key}`,
					value: updatedSettings,
					network
				});
			});

			bulkMutation.mutate(updates);
		},
		[user?.id, preferences, bulkMutation]
	);

	const updateBountiesNotification = useCallback(
		(type: string, settings: unknown) => {
			if (!user?.id) return;

			mutation.mutate({
				section: ENotifications.BOUNTIES,
				key: type,
				value: settings
			});
		},
		[user?.id, mutation]
	);

	const updateNetworkBountiesNotification = useCallback(
		(network: string, type: string, settings: unknown) => {
			if (!user?.id) return;

			mutation.mutate({
				section: ENotifications.NETWORKS,
				key: `${network}.bountiesNotifications.${type}`,
				value: settings,
				network
			});
		},
		[user?.id, mutation]
	);

	const bulkUpdateBountiesNotifications = useCallback(
		(enabled: boolean) => {
			if (!user?.id || !preferences) return;

			const bountiesKeys = ['bountyApplicationStatusUpdates', 'bountyPayoutsAndMilestones', 'activityOnBountiesIFollow'];

			const updates: Array<{ section: string; key: string; value: unknown; network?: string }> = [];

			bountiesKeys.forEach((key) => {
				const { bountiesNotifications } = preferences;
				const currentSettings =
					bountiesNotifications && Object.prototype.hasOwnProperty.call(bountiesNotifications, key) ? bountiesNotifications[key as keyof typeof bountiesNotifications] : undefined;
				const updatedSettings = currentSettings ? { ...currentSettings, enabled } : { enabled, channels: {} };
				updates.push({
					section: 'bounties',
					key,
					value: updatedSettings
				});
			});

			bulkMutation.mutate(updates);
		},
		[user?.id, preferences, bulkMutation]
	);

	const bulkUpdateNetworkBountiesNotifications = useCallback(
		(network: string, enabled: boolean) => {
			if (!user?.id || !preferences) return;

			const bountiesKeys = ['bountyApplicationStatusUpdates', 'bountyPayoutsAndMilestones', 'activityOnBountiesIFollow'];

			const updates: Array<{ section: string; key: string; value: unknown; network?: string }> = [];

			bountiesKeys.forEach((key) => {
				const networkBountiesNotifications = preferences.networkPreferences?.[network]?.bountiesNotifications;
				const currentSettings =
					networkBountiesNotifications && Object.prototype.hasOwnProperty.call(networkBountiesNotifications, key)
						? networkBountiesNotifications[key as keyof typeof networkBountiesNotifications]
						: undefined;
				const updatedSettings = currentSettings ? { ...currentSettings, enabled } : { enabled, channels: {} };
				updates.push({
					section: 'networks',
					key: `${network}.bountiesNotifications.${key}`,
					value: updatedSettings,
					network
				});
			});

			bulkMutation.mutate(updates);
		},
		[user?.id, preferences, bulkMutation]
	);

	const updateOpenGovTrack = useCallback(
		(trackKey: string, settings: unknown) => {
			if (!user?.id) return;

			mutation.mutate({
				section: ENotifications.OPENGOV,
				key: trackKey,
				value: settings
			});
		},
		[user?.id, mutation]
	);

	const updateNetworkOpenGovTrack = useCallback(
		(network: string, trackKey: string, settings: unknown) => {
			if (!user?.id) return;

			mutation.mutate({
				section: ENotifications.NETWORKS,
				key: `${network}.openGovTracks.${trackKey}`,
				value: settings,
				network
			});
		},
		[user?.id, mutation]
	);

	const updateGov1Item = useCallback(
		(itemKey: string, settings: unknown) => {
			if (!user?.id) return;

			mutation.mutate({
				section: ENotifications.GOV1,
				key: itemKey,
				value: settings
			});
		},
		[user?.id, mutation]
	);

	const updateNetworkGov1Item = useCallback(
		(network: string, itemKey: string, settings: unknown) => {
			if (!user?.id) return;

			mutation.mutate({
				section: ENotifications.NETWORKS,
				key: `${network}.gov1Items.${itemKey}`,
				value: settings,
				network
			});
		},
		[user?.id, mutation]
	);

	const bulkUpdateAdvancedSettings = useCallback(
		(enabled: boolean) => {
			if (!user?.id || !preferences) return;

			const trackLabels = {
				root: 'Root',
				stakingAdmin: 'Staking Admin',
				auctionAdmin: 'Auction Admin',
				treasurer: 'Treasurer',
				referendumCanceller: 'Referendum Canceller',
				referendumKiller: 'Referendum Killer',
				leaseAdmin: 'Lease Admin',
				memberReferenda: 'Member Referenda',
				smallTipper: 'Small Tipper',
				bigTipper: 'Big Tipper',
				smallSpender: 'Small Spender',
				mediumSpender: 'Medium Spender',
				bigSpender: 'Big Spender',
				fellowshipAdmin: 'Fellowship Admin',
				generalAdmin: 'General Admin',
				whitelistedCaller: 'Whitelisted Caller'
			};

			const gov1Labels = {
				mentionsIReceive: 'Mentions I receive',
				referendums: 'Referendums',
				proposals: 'Proposals',
				bounties: 'Bounties',
				childBounties: 'Child Bounties',
				tips: 'Tips',
				techCommittee: 'Tech Committee',
				councilMotion: 'Council Motion'
			};

			const updates: Array<{ section: string; key: string; value: unknown; network?: string }> = [];

			Object.keys(trackLabels).forEach((key) => {
				const currentSettings = preferences.openGovTracks?.[key as keyof typeof preferences.openGovTracks];
				const updatedSettings = {
					...(currentSettings || {}),
					enabled,
					notifications: {
						newReferendumSubmitted: enabled,
						referendumInVoting: enabled,
						referendumClosed: enabled
					}
				};
				updates.push({
					section: 'opengov',
					key,
					value: updatedSettings
				});
			});

			Object.keys(gov1Labels).forEach((key) => {
				const currentSettings = preferences.gov1Items?.[key as keyof typeof preferences.gov1Items];
				const updatedSettings = {
					...(currentSettings || {}),
					enabled,
					notifications: { ...(currentSettings?.notifications || {}) }
				};
				updates.push({
					section: 'gov1',
					key,
					value: updatedSettings
				});
			});

			bulkMutation.mutate(updates);
		},
		[user?.id, preferences, bulkMutation]
	);

	const bulkUpdateNetworkAdvancedSettings = useCallback(
		(network: string, enabled: boolean) => {
			if (!user?.id || !preferences) return;

			const trackLabels = {
				root: 'Root',
				stakingAdmin: 'Staking Admin',
				auctionAdmin: 'Auction Admin',
				treasurer: 'Treasurer',
				referendumCanceller: 'Referendum Canceller',
				referendumKiller: 'Referendum Killer',
				leaseAdmin: 'Lease Admin',
				memberReferenda: 'Member Referenda',
				smallTipper: 'Small Tipper',
				bigTipper: 'Big Tipper',
				smallSpender: 'Small Spender',
				mediumSpender: 'Medium Spender',
				bigSpender: 'Big Spender',
				fellowshipAdmin: 'Fellowship Admin',
				generalAdmin: 'General Admin',
				whitelistedCaller: 'Whitelisted Caller'
			};

			const gov1Labels = {
				mentionsIReceive: 'Mentions I receive',
				referendums: 'Referendums',
				proposals: 'Proposals',
				bounties: 'Bounties',
				childBounties: 'Child Bounties',
				tips: 'Tips',
				techCommittee: 'Tech Committee',
				councilMotion: 'Council Motion'
			};

			const updates: Array<{ section: string; key: string; value: unknown; network?: string }> = [];

			Object.keys(trackLabels).forEach((key) => {
				const networkPrefs = preferences.networkPreferences?.[network];
				const currentSettings = networkPrefs?.openGovTracks?.[key as keyof typeof networkPrefs.openGovTracks];
				const updatedSettings = {
					...(currentSettings || {}),
					enabled,
					notifications: {
						newReferendumSubmitted: enabled,
						referendumInVoting: enabled,
						referendumClosed: enabled
					}
				};
				updates.push({
					section: 'networks',
					key: `${network}.openGovTracks.${key}`,
					value: updatedSettings,
					network
				});
			});

			Object.keys(gov1Labels).forEach((key) => {
				const networkPrefs = preferences.networkPreferences?.[network];
				const currentSettings = networkPrefs?.gov1Items?.[key as keyof typeof networkPrefs.gov1Items];
				const updatedSettings = {
					...(currentSettings || {}),
					enabled,
					notifications: { ...(currentSettings?.notifications || {}) }
				};
				updates.push({
					section: 'networks',
					key: `${network}.gov1Items.${key}`,
					value: updatedSettings,
					network
				});
			});

			bulkMutation.mutate(updates);
		},
		[user?.id, preferences, bulkMutation]
	);

	const bulkUpdateTrackNotifications = useCallback(
		(trackKey: string, enabled: boolean, trackType: 'opengov' | 'gov1' = 'opengov') => {
			if (!user?.id || !preferences) return;

			const section = trackType === ENotifications.OPENGOV ? ENotifications.OPENGOV : ENotifications.GOV1;
			const currentSettings =
				trackType === ENotifications.OPENGOV
					? preferences.openGovTracks?.[trackKey as keyof typeof preferences.openGovTracks]
					: preferences.gov1Items?.[trackKey as keyof typeof preferences.gov1Items];

			const notifications =
				trackType === ENotifications.OPENGOV
					? {
							newReferendumSubmitted: enabled,
							referendumInVoting: enabled,
							referendumClosed: enabled
						}
					: {};

			const updatedSettings = {
				...currentSettings,
				enabled,
				notifications
			};

			mutation.mutate({
				section,
				key: trackKey,
				value: updatedSettings
			});
		},
		[user?.id, preferences, mutation]
	);

	const bulkUpdateNetworkTrackNotifications = useCallback(
		(network: string, trackKey: string, enabled: boolean, trackType: 'opengov' | 'gov1' = 'opengov') => {
			if (!user?.id || !preferences) return;

			const section = ENotifications.NETWORKS;
			const key = trackType === ENotifications.OPENGOV ? `${network}.openGovTracks.${trackKey}` : `${network}.gov1Items.${trackKey}`;

			const networkPrefs = preferences.networkPreferences?.[network];
			const currentSettings =
				trackType === ENotifications.OPENGOV
					? networkPrefs?.openGovTracks?.[trackKey as keyof typeof networkPrefs.openGovTracks]
					: networkPrefs?.gov1Items?.[trackKey as keyof typeof networkPrefs.gov1Items];

			const notifications =
				trackType === ENotifications.OPENGOV
					? {
							newReferendumSubmitted: enabled,
							referendumInVoting: enabled,
							referendumClosed: enabled
						}
					: {};

			const updatedSettings = {
				...(currentSettings || {}),
				enabled,
				notifications
			};

			mutation.mutate({
				section,
				key,
				value: updatedSettings,
				network
			});
		},
		[user?.id, preferences, mutation]
	);

	const importNetworkSettings = useCallback(
		async (fromNetwork: string, toNetwork: string) => {
			if (!user?.id || !preferences) return false;

			try {
				const fromSettings = preferences.networkPreferences?.[fromNetwork];
				if (!fromSettings) return false;

				const updates = [
					{
						section: 'networks',
						key: toNetwork,
						value: {
							...fromSettings,
							isPrimary: false
						}
					}
				];

				await bulkUpdateNotificationPreferences(user.id, updates);
				return true;
			} catch (error) {
				console.error('Failed to import network settings:', error);
				return false;
			}
		},
		[user?.id, preferences]
	);

	const bulkUpdateNetworkPreferences = useCallback(
		async (updates: Array<{ section: string; key: string; value: unknown; network?: string }>) => {
			if (!user?.id) return;

			try {
				await bulkUpdateNotificationPreferences(user.id, updates);
			} catch (error) {
				console.error('Failed to bulk update network preferences:', error);
				throw error;
			}
		},
		[user?.id]
	);

	const generateToken = useCallback(
		async (channel: ENotificationChannel) => {
			if (!user?.id) return '';

			try {
				return await generateVerificationToken(user.id, channel);
			} catch {
				return '';
			}
		},
		[user?.id]
	);

	const verifyToken = useCallback(
		async (channel: ENotificationChannel, token: string, handle: string) => {
			if (!user?.id) return false;

			try {
				return await verifyChannelToken(user.id, channel, token, handle);
			} catch {
				return false;
			}
		},
		[user?.id]
	);

	return {
		preferences,
		isLoading: isFetching,
		error: queryError || mutation.error || bulkMutation.error,

		updateChannelPreference,

		updateNetworkPreference,
		importNetworkSettings,
		bulkUpdateNetworkPreferences,

		updatePostsNotification,
		updateNetworkPostsNotification,
		bulkUpdatePostsNotifications,
		bulkUpdateNetworkPostsNotifications,

		updateCommentsNotification,
		updateNetworkCommentsNotification,
		bulkUpdateCommentsNotifications,
		bulkUpdateNetworkCommentsNotifications,

		updateBountiesNotification,
		updateNetworkBountiesNotification,
		bulkUpdateBountiesNotifications,
		bulkUpdateNetworkBountiesNotifications,

		updateOpenGovTrack,
		updateNetworkOpenGovTrack,
		updateGov1Item,
		updateNetworkGov1Item,
		bulkUpdateAdvancedSettings,
		bulkUpdateNetworkAdvancedSettings,
		bulkUpdateTrackNotifications,
		bulkUpdateNetworkTrackNotifications,

		generateToken,
		verifyToken
	};
};
