// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useCallback, useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { IUserNotificationPreferences, IUpdateNotificationPreferencesRequest, INotificationChannelSettings } from '@/_shared/types/notifications';
import { ENotificationChannel } from '@/_shared/types';
import { useUser } from './useUser';

const fetchNotificationPreferences = async (userId: number): Promise<IUserNotificationPreferences> => {
	const response = await fetch(`/api/v2/users/id/${userId}/notifications`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json'
		}
	});

	if (!response.ok) {
		throw new Error('Failed to fetch notification preferences');
	}

	const result = await response.json();
	return result.data;
};

const updateNotificationPreferences = async (userId: number, updateData: IUpdateNotificationPreferencesRequest): Promise<IUserNotificationPreferences> => {
	const response = await fetch(`/api/v2/users/id/${userId}/notifications`, {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(updateData)
	});

	if (!response.ok) {
		throw new Error('Failed to update notification preferences');
	}

	const result = await response.json();
	return result.data;
};

const bulkUpdateNotificationPreferences = async (userId: number, updates: Array<{ section: string; key: string; value: unknown }>): Promise<IUserNotificationPreferences> => {
	const response = await fetch(`/api/v2/users/id/${userId}/notifications`, {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json'
		},
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

export const useNotificationPreferences = () => {
	const { user } = useUser();
	const queryClient = useQueryClient();

	const queryKey = useMemo(() => ['notificationPreferences', user?.id], [user?.id]);

	const {
		data: preferences,
		isLoading: isFetching,
		error: queryError
	} = useQuery({
		queryKey,
		queryFn: () => fetchNotificationPreferences(user!.id),
		enabled: !!user?.id,
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 10 * 60 * 1000 // 10 minutes
	});

	const mutation = useMutation({
		mutationFn: (updateData: IUpdateNotificationPreferencesRequest) => updateNotificationPreferences(user!.id, updateData),
		onMutate: async (updateData) => {
			// Cancel any outgoing refetches
			await queryClient.cancelQueries({ queryKey });

			// Snapshot the previous value
			const previousPreferences = queryClient.getQueryData<IUserNotificationPreferences>(queryKey);

			// Optimistically update to the new value
			if (previousPreferences) {
				const optimisticUpdate = { ...previousPreferences };

				switch (updateData.section) {
					case 'channels':
						optimisticUpdate.channelPreferences = {
							...optimisticUpdate.channelPreferences,
							[updateData.key]: {
								...optimisticUpdate.channelPreferences[updateData.key as ENotificationChannel],
								...(updateData.value as Partial<INotificationChannelSettings>)
							}
						};
						break;
					case 'opengov':
						optimisticUpdate.openGovTracks = {
							...optimisticUpdate.openGovTracks,
							[updateData.key]: updateData.value as Record<string, unknown>
						};
						break;
					case 'gov1':
						optimisticUpdate.gov1Items = {
							...optimisticUpdate.gov1Items,
							[updateData.key]: updateData.value as Record<string, unknown>
						};
						break;
					case 'posts':
						optimisticUpdate.postsNotifications = {
							...optimisticUpdate.postsNotifications,
							[updateData.key]: updateData.value as Record<string, unknown>
						};
						break;
					case 'comments':
						optimisticUpdate.commentsNotifications = {
							...optimisticUpdate.commentsNotifications,
							[updateData.key]: updateData.value as Record<string, unknown>
						};
						break;
					case 'bounties':
						optimisticUpdate.bountiesNotifications = {
							...optimisticUpdate.bountiesNotifications,
							[updateData.key]: updateData.value as Record<string, unknown>
						};
						break;
					default:
						// Handle unknown section types
						break;
				}

				queryClient.setQueryData(queryKey, optimisticUpdate);
			}

			// Return a context object with the snapshotted value
			return { previousPreferences };
		},
		onSuccess: (data) => {
			queryClient.setQueryData(queryKey, data);
		},
		onError: (mutationError, _, context) => {
			// If the mutation fails, use the context returned from onMutate to roll back
			if (context?.previousPreferences) {
				queryClient.setQueryData(queryKey, context.previousPreferences);
			}
			// Handle mutation error silently
		},
		onSettled: () => {
			// Always refetch after error or success
			queryClient.invalidateQueries({ queryKey });
		}
	});

	const bulkMutation = useMutation({
		mutationFn: (updates: Array<{ section: string; key: string; value: unknown }>) => bulkUpdateNotificationPreferences(user!.id, updates),
		onMutate: async (updates) => {
			// Cancel any outgoing refetches
			await queryClient.cancelQueries({ queryKey });

			// Snapshot the previous value
			const previousPreferences = queryClient.getQueryData<IUserNotificationPreferences>(queryKey);

			// Optimistically update to the new value
			if (previousPreferences) {
				const optimisticUpdate = { ...previousPreferences };

				updates.forEach((update) => {
					switch (update.section) {
						case 'opengov':
							optimisticUpdate.openGovTracks = {
								...optimisticUpdate.openGovTracks,
								[update.key]: update.value as Record<string, unknown>
							};
							break;
						case 'gov1':
							optimisticUpdate.gov1Items = {
								...optimisticUpdate.gov1Items,
								[update.key]: update.value as Record<string, unknown>
							};
							break;
						case 'posts':
							optimisticUpdate.postsNotifications = {
								...optimisticUpdate.postsNotifications,
								[update.key]: update.value as Record<string, unknown>
							};
							break;
						case 'comments':
							optimisticUpdate.commentsNotifications = {
								...optimisticUpdate.commentsNotifications,
								[update.key]: update.value as Record<string, unknown>
							};
							break;
						case 'bounties':
							optimisticUpdate.bountiesNotifications = {
								...optimisticUpdate.bountiesNotifications,
								[update.key]: update.value as Record<string, unknown>
							};
							break;
						default:
							// Handle unknown section types
							break;
					}
				});

				queryClient.setQueryData(queryKey, optimisticUpdate);
			}

			// Return a context object with the snapshotted value
			return { previousPreferences };
		},
		onSuccess: (data) => {
			queryClient.setQueryData(queryKey, data);
		},
		onError: (bulkMutationError, _, context) => {
			// If the mutation fails, use the context returned from onMutate to roll back
			if (context?.previousPreferences) {
				queryClient.setQueryData(queryKey, context.previousPreferences);
			}
			// Handle bulk mutation error silently
		},
		onSettled: () => {
			// Always refetch after error or success
			queryClient.invalidateQueries({ queryKey });
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
		(networkId: string, settings: { enabled: boolean; importPrimarySettings: boolean }) => {
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
				const isVerified = await verifyChannelToken(user.id, channel, token, handle);
				if (isVerified) {
					// Refresh preferences after verification
					queryClient.invalidateQueries({ queryKey });
				}
				return isVerified;
			} catch {
				return false;
			}
		},
		[user?.id, queryClient, queryKey]
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

			// Add OpenGov track updates
			Object.keys(trackLabels).forEach((key) => {
				const currentSettings = preferences.openGovTracks?.[key] as Record<string, unknown> | undefined;
				const updatedSettings = {
					...currentSettings,
					enabled
				};

				// Handle notifications based on enabled state
				if (enabled) {
					// If enabling, also enable all notifications
					updatedSettings.notifications = {
						newReferendumSubmitted: true,
						referendumInVoting: true,
						referendumClosed: true
					};
				} else {
					// If disabling, also disable all notifications
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

			// Add Gov1 item updates
			Object.keys(gov1Labels).forEach((key) => {
				const currentSettings = preferences.gov1Items?.[key] as Record<string, unknown> | undefined;
				const updatedSettings = {
					...currentSettings,
					enabled
				};

				// Handle notifications based on enabled state
				if (enabled) {
					// If enabling, also enable all notifications for each item type
					updatedSettings.notifications = {
						...currentSettings?.notifications,
						// Enable all available notifications for this item
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
					// If disabling, also disable all notifications for each item type
					updatedSettings.notifications = {
						...currentSettings?.notifications,
						// Disable all available notifications for this item
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

	const getOpenGovNotifications = useCallback(
		(enabled: boolean) => ({
			newReferendumSubmitted: enabled,
			referendumInVoting: enabled,
			referendumClosed: enabled
		}),
		[]
	);

	const getGov1Notifications = useCallback((trackKey: string, enabled: boolean, currentSettings?: Record<string, unknown>) => {
		const baseNotifications = { ...currentSettings?.notifications };

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
					? (preferences.openGovTracks?.[trackKey] as Record<string, unknown> | undefined)
					: (preferences.gov1Items?.[trackKey] as Record<string, unknown> | undefined);

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

	return {
		preferences,
		isLoading: isFetching || mutation.isPending || bulkMutation.isPending,
		error: queryError || mutation.error || bulkMutation.error,
		updateChannelPreference,
		updateNetworkPreference,
		updatePostsNotification,
		updateCommentsNotification,
		updateBountiesNotification,
		updateOpenGovTrack,
		updateGov1Item,
		bulkUpdateAdvancedSettings,
		bulkUpdatePostsNotifications,
		bulkUpdateCommentsNotifications,
		bulkUpdateBountiesNotifications,
		bulkUpdateTrackNotifications,
		generateToken,
		verifyToken
	};
};
