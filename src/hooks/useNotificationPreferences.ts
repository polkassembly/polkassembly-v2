// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useCallback, useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { IUserNotificationPreferences, IUpdateNotificationPreferencesRequest, INotificationChannelSettings, ENotificationChannel } from '@/_shared/types';
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
	updates: Array<{ section: string; key: string; value: unknown }>,
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

	const mutation = useMutation({
		mutationFn: (updateData: IUpdateNotificationPreferencesRequest) => updateNotificationPreferences(user!.id, updateData, getAllNetworks ? undefined : currentNetwork),
		onMutate: async () => {
			await queryClient.cancelQueries({ queryKey });

			return {};
		},
		onSuccess: (data) => {
			queryClient.setQueryData(queryKey, data);

			if (getAllNetworks) {
				queryClient.setQueryData(['notificationPreferences', user?.id, currentNetwork], data);
			}

			queryClient.invalidateQueries({ queryKey: ['notificationPreferences', user?.id] });
		}
	});

	const bulkMutation = useMutation({
		mutationFn: (updates: Array<{ section: string; key: string; value: unknown }>) =>
			bulkUpdateNotificationPreferences(user!.id, updates, getAllNetworks ? undefined : currentNetwork),
		onMutate: async () => {
			await queryClient.cancelQueries({ queryKey });
			return {};
		},
		onSuccess: (data) => {
			queryClient.setQueryData(queryKey, data);
			if (getAllNetworks) {
				queryClient.setQueryData(['notificationPreferences', user?.id, currentNetwork], data);
			}
			queryClient.invalidateQueries({ queryKey: ['notificationPreferences', user?.id] });
		}
	});

	const updateChannelPreference = useCallback(
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

	const updateNetworkPreference = useCallback(
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

			const updates: Array<{ section: string; key: string; value: unknown }> = [];

			Object.keys(trackLabels).forEach((key) => {
				const currentSettings = preferences.openGovTracks?.[key] as { enabled: boolean; notifications?: Record<string, boolean> } | undefined;
				const updatedSettings: { enabled: boolean; notifications: Record<string, boolean> } = {
					...currentSettings,
					enabled,
					notifications: currentSettings?.notifications || {}
				};

				if (enabled) {
					updatedSettings.notifications = {
						newReferendumSubmitted: true,
						referendumInVoting: true,
						referendumClosed: true
					};
				} else {
					updatedSettings.notifications = {
						newReferendumSubmitted: false,
						referendumInVoting: false,
						referendumClosed: false
					};
				}

				updates.push({
					section: 'opengov',
					key,
					value: updatedSettings
				});
			});

			Object.keys(gov1Labels).forEach((key) => {
				const currentSettings = preferences.gov1Items?.[key] as { enabled: boolean; notifications?: Record<string, boolean> } | undefined;
				const updatedSettings: { enabled: boolean; notifications: Record<string, boolean> } = {
					...currentSettings,
					enabled,
					notifications: currentSettings?.notifications || {}
				};

				if (enabled) {
					updatedSettings.notifications = {
						...(currentSettings?.notifications || {}),
						...(key === 'referendums' && {
							newReferendumSubmitted: true,
							referendumInVoting: true,
							referendumClosed: true
						}),
						...(key === 'proposals' && {
							newProposalsSubmitted: true,
							proposalInVoting: true,
							proposalClosed: true
						}),
						...(key === 'bounties' && {
							bountiesSubmitted: true,
							bountiesClosed: true
						}),
						...(key === 'childBounties' && {
							childBountiesSubmitted: true,
							childBountiesClosed: true
						}),
						...(key === 'tips' && {
							newTipsSubmitted: true,
							tipsOpened: true,
							tipsClosed: true
						}),
						...(key === 'techCommittee' && {
							newTechCommitteeProposalsSubmitted: true,
							proposalsClosed: true
						}),
						...(key === 'councilMotion' && {
							newMotionsSubmitted: true,
							motionInVoting: true,
							motionClosed: true
						})
					};
				} else {
					updatedSettings.notifications = {
						...(currentSettings?.notifications || {}),
						...(key === 'referendums' && {
							newReferendumSubmitted: false,
							referendumInVoting: false,
							referendumClosed: false
						}),
						...(key === 'proposals' && {
							newProposalsSubmitted: false,
							proposalInVoting: false,
							proposalClosed: false
						}),
						...(key === 'bounties' && {
							bountiesSubmitted: false,
							bountiesClosed: false
						}),
						...(key === 'childBounties' && {
							childBountiesSubmitted: false,
							childBountiesClosed: false
						}),
						...(key === 'tips' && {
							newTipsSubmitted: false,
							tipsOpened: false,
							tipsClosed: false
						}),
						...(key === 'techCommittee' && {
							newTechCommitteeProposalsSubmitted: false,
							proposalsClosed: false
						}),
						...(key === 'councilMotion' && {
							newMotionsSubmitted: false,
							motionInVoting: false,
							motionClosed: false
						})
					};
				}

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

			const updates: Array<{ section: string; key: string; value: unknown }> = [];

			postsKeys.forEach((key) => {
				const currentSettings = preferences.postsNotifications?.[key as keyof typeof preferences.postsNotifications];
				updates.push({
					section: 'posts',
					key,
					value: {
						...currentSettings,
						enabled
					}
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
				const currentSettings = preferences.networkPreferences?.[network]?.postsNotifications?.[key as keyof (typeof preferences.networkPreferences)[string]['postsNotifications']];
				updates.push({
					section: 'networks',
					key: `${network}.postsNotifications.${key}`,
					value: {
						...currentSettings,
						enabled
					},
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

			const updates: Array<{ section: string; key: string; value: unknown }> = [];

			commentsKeys.forEach((key) => {
				const currentSettings = preferences.commentsNotifications?.[key as keyof typeof preferences.commentsNotifications];
				updates.push({
					section: 'comments',
					key,
					value: {
						...currentSettings,
						enabled
					}
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
				const currentSettings =
					preferences.networkPreferences?.[network]?.commentsNotifications?.[key as keyof (typeof preferences.networkPreferences)[string]['commentsNotifications']];
				updates.push({
					section: 'networks',
					key: `${network}.commentsNotifications.${key}`,
					value: {
						...currentSettings,
						enabled
					},
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

			const updates: Array<{ section: string; key: string; value: unknown }> = [];

			bountiesKeys.forEach((key) => {
				const currentSettings = preferences.bountiesNotifications?.[key as keyof typeof preferences.bountiesNotifications];
				updates.push({
					section: 'bounties',
					key,
					value: {
						...currentSettings,
						enabled
					}
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
				const currentSettings =
					preferences.networkPreferences?.[network]?.bountiesNotifications?.[key as keyof (typeof preferences.networkPreferences)[string]['bountiesNotifications']];
				updates.push({
					section: 'networks',
					key: `${network}.bountiesNotifications.${key}`,
					value: {
						...currentSettings,
						enabled
					},
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
				const currentSettings = preferences.networkPreferences?.[network]?.openGovTracks?.[key] as { enabled: boolean; notifications?: Record<string, boolean> } | undefined;
				const updatedSettings: { enabled: boolean; notifications: Record<string, boolean> } = {
					...currentSettings,
					enabled,
					notifications: currentSettings?.notifications || {}
				};

				if (enabled) {
					updatedSettings.notifications = {
						newReferendumSubmitted: true,
						referendumInVoting: true,
						referendumClosed: true
					};
				} else {
					updatedSettings.notifications = {
						newReferendumSubmitted: false,
						referendumInVoting: false,
						referendumClosed: false
					};
				}

				updates.push({
					section: 'networks',
					key: `${network}.openGovTracks.${key}`,
					value: updatedSettings,
					network
				});
			});

			Object.keys(gov1Labels).forEach((key) => {
				const currentSettings = preferences.networkPreferences?.[network]?.gov1Items?.[key] as { enabled: boolean; notifications?: Record<string, boolean> } | undefined;
				const updatedSettings: { enabled: boolean; notifications: Record<string, boolean> } = {
					...currentSettings,
					enabled,
					notifications: currentSettings?.notifications || {}
				};

				if (enabled) {
					updatedSettings.notifications = {
						...(currentSettings?.notifications || {}),
						...(key === 'referendums' && {
							newReferendumSubmitted: true,
							referendumInVoting: true,
							referendumClosed: true
						}),
						...(key === 'proposals' && {
							newProposalsSubmitted: true,
							proposalInVoting: true,
							proposalClosed: true
						}),
						...(key === 'bounties' && {
							bountiesSubmitted: true,
							bountiesClosed: true
						}),
						...(key === 'childBounties' && {
							childBountiesSubmitted: true,
							childBountiesClosed: true
						}),
						...(key === 'tips' && {
							newTipsSubmitted: true,
							tipsOpened: true,
							tipsClosed: true
						}),
						...(key === 'techCommittee' && {
							newTechCommitteeProposalsSubmitted: true,
							proposalsClosed: true
						}),
						...(key === 'councilMotion' && {
							newMotionsSubmitted: true,
							motionInVoting: true,
							motionClosed: true
						})
					};
				} else {
					updatedSettings.notifications = {
						...(currentSettings?.notifications || {}),
						...(key === 'referendums' && {
							newReferendumSubmitted: false,
							referendumInVoting: false,
							referendumClosed: false
						}),
						...(key === 'proposals' && {
							newProposalsSubmitted: false,
							proposalInVoting: false,
							proposalClosed: false
						}),
						...(key === 'bounties' && {
							bountiesSubmitted: false,
							bountiesClosed: false
						}),
						...(key === 'childBounties' && {
							childBountiesSubmitted: false,
							childBountiesClosed: false
						}),
						...(key === 'tips' && {
							newTipsSubmitted: false,
							tipsOpened: false,
							tipsClosed: false
						}),
						...(key === 'techCommittee' && {
							newTechCommitteeProposalsSubmitted: false,
							proposalsClosed: false
						}),
						...(key === 'councilMotion' && {
							newMotionsSubmitted: false,
							motionInVoting: false,
							motionClosed: false
						})
					};
				}

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
		(updates: Array<{ section: string; key: string; value: unknown }>) => {
			if (!user?.id) return;
			bulkMutation.mutate(updates);
		},
		[user?.id, bulkMutation]
	);

	return {
		preferences,
		isLoading: isFetching || mutation.isPending || bulkMutation.isPending,
		error: queryError || mutation.error || bulkMutation.error,
		updateChannelPreference,
		updateNetworkPreference,
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
