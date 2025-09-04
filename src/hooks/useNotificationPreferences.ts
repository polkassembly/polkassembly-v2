// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useCallback, useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
	IUserNotificationPreferences,
	IUpdateNotificationPreferencesRequest,
	INotificationChannelSettings,
	ENotificationChannel,
	INetworkNotificationSettings,
	IOpenGovTrackSettings,
	IGov1ItemSettings
} from '@/_shared/types';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { useUser } from './useUser';

const fetchNotificationPreferences = async (userId: number, network?: string, getAllNetworks?: boolean): Promise<IUserNotificationPreferences> => {
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

const updateNotificationPreferences = async (userId: number, updateData: IUpdateNotificationPreferencesRequest, network?: string): Promise<IUserNotificationPreferences> => {
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
): Promise<IUserNotificationPreferences> => {
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
		staleTime: 10 * 60 * 1000,
		gcTime: 15 * 60 * 1000,
		refetchOnWindowFocus: false,
		refetchOnMount: false,
		refetchOnReconnect: false,
		refetchInterval: false
	});

	const updateNetworkPreference = useCallback((updated: IUserNotificationPreferences, key: string, value: unknown) => {
		const networkPreferences = updated.networkPreferences || {};

		if (key.includes('.')) {
			const [networkId, ...pathParts] = key.split('.');
			const networkSettings = networkPreferences[networkId] || ({} as INetworkNotificationSettings);

			const updatedSettings = JSON.parse(JSON.stringify(networkSettings)) as Record<string, unknown>;
			let pointer = updatedSettings;

			for (let i = 0; i < pathParts.length - 1; i += 1) {
				const pathPart = pathParts[i];
				if (!pointer[pathPart]) pointer[pathPart] = {};
				pointer = pointer[pathPart] as Record<string, unknown>;
			}
			const lastPathPart = pathParts[pathParts.length - 1];
			pointer[lastPathPart] = value;

			return {
				...updated,
				networkPreferences: {
					...networkPreferences,
					[networkId]: updatedSettings as unknown as INetworkNotificationSettings
				}
			};
		}

		const existingValue = networkPreferences[key] || ({} as INetworkNotificationSettings);
		const newValue = typeof value === 'object' && value !== null ? (value as Partial<INetworkNotificationSettings>) : {};

		return {
			...updated,
			networkPreferences: {
				...networkPreferences,
				[key]: { ...existingValue, ...newValue }
			}
		};
	}, []);

	const updateChannelPreference = useCallback((updated: IUserNotificationPreferences, key: string, value: unknown) => {
		const channelPreferences = updated.channelPreferences || ({} as Record<ENotificationChannel, INotificationChannelSettings>);
		const existingValue = channelPreferences[key as ENotificationChannel] || {};
		const newValue = typeof value === 'object' && value !== null ? (value as Partial<INotificationChannelSettings>) : {};

		return {
			...updated,
			channelPreferences: {
				...channelPreferences,
				[key as ENotificationChannel]: { ...existingValue, ...newValue }
			}
		};
	}, []);

	const mutation = useMutation({
		mutationFn: (updateData: IUpdateNotificationPreferencesRequest) => updateNotificationPreferences(user!.id, updateData, getAllNetworks ? undefined : currentNetwork),
		onMutate: async (updateData) => {
			await queryClient.cancelQueries({ queryKey });

			const previousData = queryClient.getQueryData(queryKey);

			queryClient.setQueryData(queryKey, (old: IUserNotificationPreferences | undefined) => {
				if (!old) return old;

				const updated = { ...old };
				const { section, key, value } = updateData;

				if (section === 'networks') {
					return updateNetworkPreference(updated, key, value);
				}
				if (section === 'channels') {
					return updateChannelPreference(updated, key, value);
				}

				return updated;
			});

			return { previousData };
		},
		onError: (err, updateData, context) => {
			if (context?.previousData) {
				queryClient.setQueryData(queryKey, context.previousData);
			}
		},
		onSuccess: (data) => {
			queryClient.setQueryData(queryKey, data);

			if (getAllNetworks) {
				queryClient.setQueryData(['notificationPreferences', user?.id, currentNetwork], data);
			}

			queryClient.invalidateQueries({ queryKey: ['notificationPreferences', user?.id] });
		}
	});

	const processGroupedUpdates = useCallback(
		(updated: IUserNotificationPreferences, groupedUpdates: Map<string, { section: string; key: string; value: unknown }>) => {
			let result = { ...updated };

			groupedUpdates.forEach(({ section, key, value }) => {
				if (section === 'networks') {
					result = updateNetworkPreference(result, key, value);
				} else if (section === 'opengov') {
					const openGovTracks = result.openGovTracks || {};
					result = {
						...result,
						openGovTracks: {
							...openGovTracks,
							[key]: value as IOpenGovTrackSettings
						}
					};
				} else if (section === 'gov1') {
					const gov1Items = result.gov1Items || {};
					result = {
						...result,
						gov1Items: {
							...gov1Items,
							[key]: value as IGov1ItemSettings
						}
					};
				}
			});
			return result;
		},
		[updateNetworkPreference]
	);

	const groupUpdates = useCallback((updates: Array<{ section: string; key: string; value: unknown; network?: string }>) => {
		const groupedUpdates = new Map<string, { section: string; key: string; value: unknown }>();

		updates.forEach((update) => {
			const updateKey = `${update.section}:${update.key}`;

			if (groupedUpdates.has(updateKey)) {
				const existing = groupedUpdates.get(updateKey)!;
				if (typeof existing.value === 'object' && existing.value !== null && typeof update.value === 'object' && update.value !== null) {
					existing.value = { ...existing.value, ...update.value };
				} else {
					existing.value = update.value;
				}
			} else {
				groupedUpdates.set(updateKey, { section: update.section, key: update.key, value: update.value });
			}
		});

		return groupedUpdates;
	}, []);

	const bulkMutation = useMutation({
		mutationFn: (updates: Array<{ section: string; key: string; value: unknown; network?: string }>) =>
			bulkUpdateNotificationPreferences(user!.id, updates, getAllNetworks ? undefined : currentNetwork),
		onMutate: async (updates) => {
			await queryClient.cancelQueries({ queryKey });

			const previousData = queryClient.getQueryData(queryKey);

			queryClient.setQueryData(queryKey, (old: IUserNotificationPreferences | undefined) => {
				if (!old) return old;

				const updated = { ...old };
				const groupedUpdates = groupUpdates(updates);
				return processGroupedUpdates(updated, groupedUpdates);
			});

			return { previousData };
		},
		onError: (err, updates, context) => {
			if (context?.previousData) {
				queryClient.setQueryData(queryKey, context.previousData);
			}
		},
		onSuccess: (data) => {
			queryClient.setQueryData(queryKey, data);
			if (getAllNetworks) {
				queryClient.setQueryData(['notificationPreferences', user?.id, currentNetwork], data);
			}
			queryClient.invalidateQueries({ queryKey: ['notificationPreferences', user?.id] });
		}
	});

	const updateChannelPreferenceMutation = useCallback(
		(channel: ENotificationChannel, settings: Partial<INotificationChannelSettings>) => {
			if (!user?.id) return;

			mutation.mutate({
				section: 'channels',
				key: channel,
				value: settings
			});
		},
		[user?.id, mutation]
	);

	const updateNetworkPreferenceMutation = useCallback(
		(networkId: string, settings: { enabled: boolean; isPrimary?: boolean; importPrimarySettings: boolean }) => {
			if (!user?.id) return;

			mutation.mutate({
				section: 'networks',
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
				section: 'posts',
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
				section: 'networks',
				key: `${network}.postsNotifications.${type}`,
				value: settings,
				network
			});
		},
		[user?.id, mutation]
	);

	const updateCommentsNotification = useCallback(
		(type: string, settings: unknown) => {
			if (!user?.id) return;

			mutation.mutate({
				section: 'comments',
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
				section: 'networks',
				key: `${network}.commentsNotifications.${type}`,
				value: settings,
				network
			});
		},
		[user?.id, mutation]
	);

	const updateBountiesNotification = useCallback(
		(type: string, settings: unknown) => {
			if (!user?.id) return;

			mutation.mutate({
				section: 'bounties',
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
				section: 'networks',
				key: `${network}.bountiesNotifications.${type}`,
				value: settings,
				network
			});
		},
		[user?.id, mutation]
	);

	const updateOpenGovTrack = useCallback(
		(trackKey: string, settings: unknown) => {
			if (!user?.id) return;

			mutation.mutate({
				section: 'opengov',
				key: trackKey,
				value: settings
			});
		},
		[user?.id, mutation]
	);

	const updateGov1Item = useCallback(
		(itemKey: string, settings: unknown) => {
			if (!user?.id) return;

			mutation.mutate({
				section: 'gov1',
				key: itemKey,
				value: settings
			});
		},
		[user?.id, mutation]
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

	const createOpenGovTrackUpdates = useCallback((enabled: boolean, userPreferences: IUserNotificationPreferences) => {
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

		return Object.keys(trackLabels).map((key) => {
			const currentSettings = userPreferences.openGovTracks?.[key] as { enabled: boolean; notifications?: Record<string, boolean> } | undefined;
			const updatedSettings: { enabled: boolean; notifications: Record<string, boolean> } = {
				...currentSettings,
				enabled,
				notifications: {
					newReferendumSubmitted: enabled,
					referendumInVoting: enabled,
					referendumClosed: enabled
				}
			};

			return {
				section: 'opengov',
				key,
				value: updatedSettings
			};
		});
	}, []);

	const createGov1ItemUpdates = useCallback((enabled: boolean, userPreferences: IUserNotificationPreferences) => {
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

		return Object.keys(gov1Labels).map((key) => {
			const currentSettings = userPreferences.gov1Items?.[key] as { enabled: boolean; notifications?: Record<string, boolean> } | undefined;
			const updatedSettings: { enabled: boolean; notifications: Record<string, boolean> } = {
				...currentSettings,
				enabled,
				notifications: { ...(currentSettings?.notifications || {}) }
			};

			const notificationMappings: Record<string, Record<string, boolean>> = {
				referendums: { newReferendumSubmitted: enabled, referendumInVoting: enabled, referendumClosed: enabled },
				proposals: { newProposalsSubmitted: enabled, proposalInVoting: enabled, proposalClosed: enabled },
				bounties: { bountiesSubmitted: enabled, bountiesClosed: enabled },
				childBounties: { childBountiesSubmitted: enabled, childBountiesClosed: enabled },
				tips: { newTipsSubmitted: enabled, tipsOpened: enabled, tipsClosed: enabled },
				techCommittee: { newTechCommitteeProposalsSubmitted: enabled, proposalsClosed: enabled },
				councilMotion: { newMotionsSubmitted: enabled, motionInVoting: enabled, motionClosed: enabled }
			};

			if (notificationMappings[key]) {
				updatedSettings.notifications = { ...updatedSettings.notifications, ...notificationMappings[key] };
			}

			return {
				section: 'gov1',
				key,
				value: updatedSettings
			};
		});
	}, []);

	const bulkUpdateAdvancedSettings = useCallback(
		(enabled: boolean) => {
			if (!user?.id || !preferences) return;

			const openGovUpdates = createOpenGovTrackUpdates(enabled, preferences);
			const gov1Updates = createGov1ItemUpdates(enabled, preferences);
			const updates = [...openGovUpdates, ...gov1Updates];

			bulkMutation.mutate(updates);
		},
		[user?.id, preferences, bulkMutation, createOpenGovTrackUpdates, createGov1ItemUpdates]
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
				const currentSettings = postsNotifications?.[key as keyof typeof postsNotifications];
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
				const currentSettings = networkPostsNotifications?.[key as keyof typeof networkPostsNotifications];
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

	const bulkUpdateCommentsNotifications = useCallback(
		(enabled: boolean) => {
			if (!user?.id || !preferences) return;

			const commentsKeys = ['commentsOnMyProposals', 'repliesToMyComments', 'mentions'];

			const updates: Array<{ section: string; key: string; value: unknown; network?: string }> = [];

			commentsKeys.forEach((key) => {
				const { commentsNotifications } = preferences;
				const currentSettings = commentsNotifications?.[key as keyof typeof commentsNotifications];
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
				const currentSettings = networkCommentsNotifications?.[key as keyof typeof networkCommentsNotifications];
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

	const bulkUpdateBountiesNotifications = useCallback(
		(enabled: boolean) => {
			if (!user?.id || !preferences) return;

			const bountiesKeys = ['bountyApplicationStatusUpdates', 'bountyPayoutsAndMilestones', 'activityOnBountiesIFollow'];

			const updates: Array<{ section: string; key: string; value: unknown; network?: string }> = [];

			bountiesKeys.forEach((key) => {
				const { bountiesNotifications } = preferences;
				const currentSettings = bountiesNotifications?.[key as keyof typeof bountiesNotifications];
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
				const currentSettings = networkBountiesNotifications?.[key as keyof typeof networkBountiesNotifications];
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

	const getOpenGovNotifications = useCallback(
		(enabled: boolean) => ({
			newReferendumSubmitted: enabled,
			referendumInVoting: enabled,
			referendumClosed: enabled
		}),
		[]
	);

	const getGov1Notifications = useCallback((trackKey: string, enabled: boolean, currentSettings?: { notifications?: Record<string, boolean> }) => {
		const baseNotifications = { ...(currentSettings?.notifications || {}) };

		const notificationMappings: Record<string, Record<string, boolean>> = {
			referendums: {
				newReferendumSubmitted: enabled,
				referendumInVoting: enabled,
				referendumClosed: enabled
			},
			proposals: {
				newProposalsSubmitted: enabled,
				proposalInVoting: enabled,
				proposalClosed: enabled
			},
			bounties: {
				bountiesSubmitted: enabled,
				bountiesClosed: enabled
			},
			childBounties: {
				childBountiesSubmitted: enabled,
				childBountiesClosed: enabled
			},
			tips: {
				newTipsSubmitted: enabled,
				tipsOpened: enabled,
				tipsClosed: enabled
			},
			techCommittee: {
				newTechCommitteeProposalsSubmitted: enabled,
				proposalsClosed: enabled
			},
			councilMotion: {
				newMotionsSubmitted: enabled,
				motionInVoting: enabled,
				motionClosed: enabled
			}
		};

		return {
			...baseNotifications,
			...(notificationMappings[trackKey] || {})
		};
	}, []);

	const bulkUpdateTrackNotifications = useCallback(
		(trackKey: string, enabled: boolean, trackType: 'opengov' | 'gov1' = 'opengov') => {
			if (!user?.id || !preferences) return;

			const currentSettings =
				trackType === 'opengov'
					? (preferences.openGovTracks?.[trackKey] as { enabled: boolean; notifications?: Record<string, boolean> } | undefined)
					: (preferences.gov1Items?.[trackKey] as { enabled: boolean; notifications?: Record<string, boolean> } | undefined);

			const notifications = trackType === 'opengov' ? getOpenGovNotifications(enabled) : getGov1Notifications(trackKey, enabled, currentSettings);

			const updatedSettings = {
				...currentSettings,
				enabled,
				notifications
			};

			const section = trackType === 'opengov' ? 'opengov' : 'gov1';
			mutation.mutate({
				section,
				key: trackKey,
				value: updatedSettings
			});
		},
		[user?.id, preferences, mutation, getOpenGovNotifications, getGov1Notifications]
	);

	const updateNetworkOpenGovTrack = useCallback(
		(network: string, trackKey: string, settings: unknown) => {
			if (!user?.id) return;

			mutation.mutate({
				section: 'networks',
				key: `${network}.openGovTracks.${trackKey}`,
				value: settings,
				network
			});
		},
		[user?.id, mutation]
	);

	const updateNetworkGov1Item = useCallback(
		(network: string, itemKey: string, settings: unknown) => {
			if (!user?.id) return;

			mutation.mutate({
				section: 'networks',
				key: `${network}.gov1Items.${itemKey}`,
				value: settings,
				network
			});
		},
		[user?.id, mutation]
	);

	const createNetworkOpenGovTrackUpdates = useCallback((network: string, enabled: boolean, userPreferences: IUserNotificationPreferences) => {
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

		return Object.keys(trackLabels).map((key) => {
			const currentSettings = userPreferences.networkPreferences?.[network]?.openGovTracks?.[key] as { enabled: boolean; notifications?: Record<string, boolean> } | undefined;
			const updatedSettings: { enabled: boolean; notifications: Record<string, boolean> } = {
				...currentSettings,
				enabled,
				notifications: {
					newReferendumSubmitted: enabled,
					referendumInVoting: enabled,
					referendumClosed: enabled
				}
			};

			return {
				section: 'networks',
				key: `${network}.openGovTracks.${key}`,
				value: updatedSettings,
				network
			};
		});
	}, []);

	const createNetworkGov1ItemUpdates = useCallback((network: string, enabled: boolean, userPreferences: IUserNotificationPreferences) => {
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

		return Object.keys(gov1Labels).map((key) => {
			const currentSettings = userPreferences.networkPreferences?.[network]?.gov1Items?.[key] as { enabled: boolean; notifications?: Record<string, boolean> } | undefined;
			const updatedSettings: { enabled: boolean; notifications: Record<string, boolean> } = {
				...currentSettings,
				enabled,
				notifications: { ...(currentSettings?.notifications || {}) }
			};

			const notificationMappings: Record<string, Record<string, boolean>> = {
				referendums: { newReferendumSubmitted: enabled, referendumInVoting: enabled, referendumClosed: enabled },
				proposals: { newProposalsSubmitted: enabled, proposalInVoting: enabled, proposalClosed: enabled },
				bounties: { bountiesSubmitted: enabled, bountiesClosed: enabled },
				childBounties: { childBountiesSubmitted: enabled, childBountiesClosed: enabled },
				tips: { newTipsSubmitted: enabled, tipsOpened: enabled, tipsClosed: enabled },
				techCommittee: { newTechCommitteeProposalsSubmitted: enabled, proposalsClosed: enabled },
				councilMotion: { newMotionsSubmitted: enabled, motionInVoting: enabled, motionClosed: enabled }
			};

			if (notificationMappings[key]) {
				updatedSettings.notifications = { ...updatedSettings.notifications, ...notificationMappings[key] };
			}

			return {
				section: 'networks',
				key: `${network}.gov1Items.${key}`,
				value: updatedSettings,
				network
			};
		});
	}, []);

	const bulkUpdateNetworkAdvancedSettings = useCallback(
		(network: string, enabled: boolean) => {
			if (!user?.id || !preferences) return;

			const openGovUpdates = createNetworkOpenGovTrackUpdates(network, enabled, preferences);
			const gov1Updates = createNetworkGov1ItemUpdates(network, enabled, preferences);
			const updates = [...openGovUpdates, ...gov1Updates];

			bulkMutation.mutate(updates);
		},
		[user?.id, preferences, bulkMutation, createNetworkOpenGovTrackUpdates, createNetworkGov1ItemUpdates]
	);

	const bulkUpdateNetworkTrackNotifications = useCallback(
		(network: string, trackKey: string, enabled: boolean, trackType: 'opengov' | 'gov1' = 'opengov') => {
			if (!user?.id || !preferences) return;

			const currentSettings =
				trackType === 'opengov'
					? (preferences.networkPreferences?.[network]?.openGovTracks?.[trackKey] as { enabled: boolean; notifications?: Record<string, boolean> } | undefined)
					: (preferences.networkPreferences?.[network]?.gov1Items?.[trackKey] as { enabled: boolean; notifications?: Record<string, boolean> } | undefined);

			const notifications = trackType === 'opengov' ? getOpenGovNotifications(enabled) : getGov1Notifications(trackKey, enabled, currentSettings);

			const updatedSettings = {
				...currentSettings,
				enabled,
				notifications
			};

			const section = 'networks';
			const key = trackType === 'opengov' ? `${network}.openGovTracks.${trackKey}` : `${network}.gov1Items.${trackKey}`;

			mutation.mutate({
				section,
				key,
				value: updatedSettings,
				network
			});
		},
		[user?.id, preferences, mutation, getOpenGovNotifications, getGov1Notifications]
	);

	const importNetworkSettings = useCallback(
		(fromNetwork: string, toNetwork: string) => {
			if (!user?.id || !preferences) return;

			const sourceSettings = preferences.networkPreferences?.[fromNetwork];
			if (!sourceSettings) return;

			const targetSettings = {
				...sourceSettings,
				enabled: true,
				isPrimary: false,
				importPrimarySettings: true
			};

			mutation.mutate({
				section: 'networks',
				key: toNetwork,
				value: targetSettings,
				network: toNetwork
			});
		},
		[user?.id, preferences, mutation]
	);

	const bulkUpdateNetworkPreferences = useCallback(
		(updates: Array<{ section: string; key: string; value: unknown; network?: string }>) => {
			if (!user?.id) return;
			bulkMutation.mutate(updates);
		},
		[user?.id, bulkMutation]
	);

	return {
		preferences,
		isLoading: isFetching || mutation.isPending || bulkMutation.isPending,
		error: queryError || mutation.error || bulkMutation.error,
		updateChannelPreference: updateChannelPreferenceMutation,
		updateNetworkPreference: updateNetworkPreferenceMutation,
		updatePostsNotification,
		updateNetworkPostsNotification,
		updateCommentsNotification,
		updateNetworkCommentsNotification,
		updateBountiesNotification,
		updateNetworkBountiesNotification,
		updateOpenGovTrack,
		updateNetworkOpenGovTrack,
		updateGov1Item,
		updateNetworkGov1Item,
		bulkUpdateAdvancedSettings,
		bulkUpdateNetworkAdvancedSettings,
		bulkUpdatePostsNotifications,
		bulkUpdateNetworkPostsNotifications,
		bulkUpdateCommentsNotifications,
		bulkUpdateNetworkCommentsNotifications,
		bulkUpdateBountiesNotifications,
		bulkUpdateNetworkBountiesNotifications,
		bulkUpdateTrackNotifications,
		bulkUpdateNetworkTrackNotifications,
		bulkUpdateNetworkPreferences,
		importNetworkSettings,
		generateToken,
		verifyToken
	};
};
