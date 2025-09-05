// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useCallback, useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
	IUpdateNotificationPreferencesRequest,
	IUserNotificationChannelPreferences,
	ENotificationChannel,
	ENotifications,
	EPostOrigin,
	EProposalType,
	IUserNotificationSettings,
	IUserNotificationTriggerPreferences
} from '@/_shared/types';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { STALE_TIME } from '@/_shared/_constants/listingLimit';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { useUser } from './useUser';

const DEFAULT_CHANNELS = {
	[ENotificationChannel.EMAIL]: false,
	[ENotificationChannel.TELEGRAM]: false,
	[ENotificationChannel.DISCORD]: false,
	[ENotificationChannel.SLACK]: false,
	[ENotificationChannel.ELEMENT]: false
};

const updateChannelPreferences = (data: IUserNotificationSettings, key: string, value: IUserNotificationChannelPreferences): IUserNotificationSettings => {
	const newData = { ...data };

	if (!newData.channelPreferences) {
		newData.channelPreferences = {} as Record<ENotificationChannel, IUserNotificationChannelPreferences>;
	}

	const channelKey = key as ENotificationChannel;
	newData.channelPreferences = {
		...newData.channelPreferences,
		[channelKey]: {
			...newData.channelPreferences[channelKey],
			...value
		}
	};

	return newData;
};

const ensureTriggerPreferences = (data: IUserNotificationSettings, networkKey: string): IUserNotificationSettings => {
	const newData = { ...data };

	if (!newData.triggerPreferences) {
		newData.triggerPreferences = {};
	}
	if (!newData.triggerPreferences[networkKey]) {
		newData.triggerPreferences[networkKey] = {
			name: networkKey,
			enabled: true,
			importPrimarySettings: false
		};
	}

	return newData;
};

const updateTriggerPreferences = (data: IUserNotificationSettings, key: string, value: unknown): IUserNotificationSettings => {
	const newData = { ...data };

	if (!newData.triggerPreferences) {
		newData.triggerPreferences = {};
	}

	if (key.includes('.')) {
		const [networkKey, ...pathParts] = key.split('.');

		if (!networkKey || pathParts.length === 0) return newData;

		const updatedData = ensureTriggerPreferences(newData, networkKey);

		if (!updatedData.triggerPreferences) {
			return updatedData;
		}

		const networkSettings = JSON.parse(JSON.stringify(updatedData.triggerPreferences[networkKey])) as Record<string, unknown>;
		let pointer = networkSettings;

		for (let i = 0; i < pathParts.length - 1; i += 1) {
			const pathPart = pathParts[i];
			if (pathPart) {
				if (!Object.prototype.hasOwnProperty.call(pointer, pathPart)) {
					pointer[pathPart] = {};
				}
				pointer = pointer[pathPart] as Record<string, unknown>;
			}
		}

		const lastPathPart = pathParts[pathParts.length - 1];
		if (lastPathPart) {
			pointer[lastPathPart] = value;
		}

		updatedData.triggerPreferences[networkKey] = networkSettings as IUserNotificationTriggerPreferences;
		return updatedData;
	}

	const { triggerPreferences } = newData;
	triggerPreferences[key] = {
		...triggerPreferences[key],
		...(value as Record<string, unknown>)
	};

	return newData;
};

const applyOptimisticUpdate = (currentData: IUserNotificationSettings, update: IUpdateNotificationPreferencesRequest): IUserNotificationSettings => {
	const { section, key, value } = update;
	const newData = JSON.parse(JSON.stringify(currentData)) as IUserNotificationSettings;

	switch (section) {
		case ENotifications.CHANNELS:
			return updateChannelPreferences(newData, key, value as IUserNotificationChannelPreferences);
		case ENotifications.NETWORKS:
		case 'networks':
			return updateTriggerPreferences(newData, key, value);
		default:
			return newData;
	}
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
		queryFn: async () => {
			const response = await NextApiClientService.fetchNotificationPreferences({
				userId: user!.id,
				getAllNetworks
			});
			if (response.error) {
				throw new Error(response.error.message || 'Failed to fetch notification preferences');
			}

			if (response.data && typeof response.data === 'object' && 'data' in response.data) {
				return (response.data as { data: IUserNotificationSettings }).data;
			}
			return response.data;
		},
		enabled: !!user?.id,
		staleTime: STALE_TIME * 1000,
		refetchOnWindowFocus: false,
		refetchOnMount: false,
		refetchOnReconnect: false,
		refetchInterval: false
	});

	const mutation = useMutation({
		mutationFn: async (updateData: IUpdateNotificationPreferencesRequest) => {
			const response = await NextApiClientService.updateNotificationPreferences({
				userId: user!.id,
				updateData
			});
			if (response.error) {
				throw new Error(response.error.message || 'Failed to update notification preferences');
			}
			return response.data;
		},
		onMutate: async (updateData) => {
			await queryClient.cancelQueries({ queryKey });

			const previousData = queryClient.getQueryData<IUserNotificationSettings>(queryKey);

			if (previousData) {
				const optimisticData = applyOptimisticUpdate(previousData, updateData);
				queryClient.setQueryData(queryKey, optimisticData);
			}

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
			queryClient.refetchQueries({
				queryKey: ['notificationPreferences', user?.id],
				exact: false
			});
		}
	});

	const bulkMutation = useMutation({
		mutationFn: async (updates: Array<{ section: string; key: string; value: unknown; network?: string }>) => {
			const response = await NextApiClientService.bulkUpdateNotificationPreferences({
				userId: user!.id,
				updates,
				network: currentNetwork
			});
			if (response.error) {
				throw new Error(response.error.message || 'Failed to bulk update notification preferences');
			}
			return response.data;
		},
		onMutate: async (updates) => {
			await queryClient.cancelQueries({ queryKey });

			const previousData = queryClient.getQueryData<IUserNotificationSettings>(queryKey);

			if (previousData) {
				let optimisticData = previousData;
				updates.forEach((update) => {
					const typedUpdate: IUpdateNotificationPreferencesRequest = {
						section: update.section as ENotifications,
						key: update.key,
						value: update.value,
						network: update.network
					};
					optimisticData = applyOptimisticUpdate(optimisticData, typedUpdate);
				});
				queryClient.setQueryData(queryKey, optimisticData);
			}

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
			queryClient.refetchQueries({
				queryKey: ['notificationPreferences', user?.id],
				exact: false
			});
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
				const networkPostsNotifications = preferences?.triggerPreferences?.[network]?.postsNotifications;
				const currentSettings =
					networkPostsNotifications && Object.prototype.hasOwnProperty.call(networkPostsNotifications, key)
						? networkPostsNotifications[key as keyof typeof networkPostsNotifications]
						: undefined;

				const updatedSettings = currentSettings ? { ...currentSettings, enabled } : { enabled, channels: DEFAULT_CHANNELS };

				updates.push({
					section: ENotifications.NETWORKS,
					key: `${network}.postsNotifications.${key}`,
					value: updatedSettings,
					network
				});
			});

			bulkMutation.mutate(updates);
		},
		[user?.id, preferences, bulkMutation]
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

	const bulkUpdateNetworkCommentsNotifications = useCallback(
		(network: string, enabled: boolean) => {
			if (!user?.id || !preferences) return;

			const commentsKeys = ['commentsOnMyProposals', 'repliesToMyComments', 'mentions'];

			const updates: Array<{ section: string; key: string; value: unknown; network?: string }> = [];

			commentsKeys.forEach((key) => {
				const networkCommentsNotifications = preferences?.triggerPreferences?.[network]?.commentsNotifications;
				const currentSettings =
					networkCommentsNotifications && Object.prototype.hasOwnProperty.call(networkCommentsNotifications, key)
						? networkCommentsNotifications[key as keyof typeof networkCommentsNotifications]
						: undefined;

				const updatedSettings = currentSettings ? { ...currentSettings, enabled } : { enabled, channels: DEFAULT_CHANNELS };

				updates.push({
					section: ENotifications.NETWORKS,
					key: `${network}.commentsNotifications.${key}`,
					value: updatedSettings,
					network
				});
			});

			bulkMutation.mutate(updates);
		},
		[user?.id, preferences, bulkMutation]
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

	const bulkUpdateNetworkBountiesNotifications = useCallback(
		(network: string, enabled: boolean) => {
			if (!user?.id || !preferences) return;

			const bountiesKeys = ['bountyApplicationStatusUpdates', 'bountyPayoutsAndMilestones', 'activityOnBountiesIFollow'];

			const updates: Array<{ section: string; key: string; value: unknown; network?: string }> = [];

			bountiesKeys.forEach((key) => {
				const networkBountiesNotifications = preferences?.triggerPreferences?.[network]?.bountiesNotifications;
				const currentSettings =
					networkBountiesNotifications && Object.prototype.hasOwnProperty.call(networkBountiesNotifications, key)
						? networkBountiesNotifications[key as keyof typeof networkBountiesNotifications]
						: undefined;

				const updatedSettings = currentSettings ? { ...currentSettings, enabled } : { enabled, channels: DEFAULT_CHANNELS };

				updates.push({
					section: ENotifications.NETWORKS,
					key: `${network}.bountiesNotifications.${key}`,
					value: updatedSettings,
					network
				});
			});

			bulkMutation.mutate(updates);
		},
		[user?.id, preferences, bulkMutation]
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

	const bulkUpdateNetworkAdvancedSettings = useCallback(
		(network: string, enabled: boolean) => {
			if (!user?.id || !preferences) return;

			const trackLabels = {
				root: EPostOrigin.ROOT,
				stakingAdmin: EPostOrigin.STAKING_ADMIN,
				auctionAdmin: EPostOrigin.AUCTION_ADMIN,
				treasurer: EPostOrigin.TREASURER,
				referendumCanceller: EPostOrigin.REFERENDUM_CANCELLER,
				referendumKiller: EPostOrigin.REFERENDUM_KILLER,
				leaseAdmin: EPostOrigin.LEASE_ADMIN,
				memberReferenda: EPostOrigin.MEMBERS,
				smallTipper: EPostOrigin.SMALL_TIPPER,
				bigTipper: EPostOrigin.BIG_TIPPER,
				smallSpender: EPostOrigin.SMALL_SPENDER,
				mediumSpender: EPostOrigin.MEDIUM_SPENDER,
				bigSpender: EPostOrigin.BIG_SPENDER,
				fellowshipAdmin: EPostOrigin.FELLOWSHIP_ADMIN,
				generalAdmin: EPostOrigin.GENERAL_ADMIN,
				whitelistedCaller: EPostOrigin.WHITELISTED_CALLER
			};

			const gov1Labels = {
				mentionsIReceive: 'mentionsIReceive',
				[EProposalType.REFERENDUM]: EProposalType.REFERENDUM,
				[EProposalType.DEMOCRACY_PROPOSAL]: EProposalType.DEMOCRACY_PROPOSAL,
				[EProposalType.BOUNTY]: EProposalType.BOUNTY,
				[EProposalType.CHILD_BOUNTY]: EProposalType.CHILD_BOUNTY,
				[EProposalType.TIP]: EProposalType.TIP,
				[EProposalType.TECHNICAL_COMMITTEE]: EProposalType.TECHNICAL_COMMITTEE,
				[EProposalType.COUNCIL_MOTION]: EProposalType.COUNCIL_MOTION
			};

			const updates: Array<{ section: string; key: string; value: unknown; network?: string }> = [];

			Object.keys(trackLabels).forEach((key) => {
				const networkPrefs = preferences?.triggerPreferences?.[network];
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
					section: ENotifications.NETWORKS,
					key: `${network}.openGovTracks.${key}`,
					value: updatedSettings,
					network
				});
			});

			Object.keys(gov1Labels).forEach((key) => {
				const networkPrefs = preferences?.triggerPreferences?.[network];
				const currentSettings = networkPrefs?.gov1Items?.[key as keyof typeof networkPrefs.gov1Items];

				let defaultNotifications = {};
				switch (key) {
					case EProposalType.REFERENDUM:
						defaultNotifications = {
							newReferendumSubmitted: enabled,
							referendumInVoting: enabled,
							referendumClosed: enabled
						};
						break;
					case EProposalType.DEMOCRACY_PROPOSAL:
						defaultNotifications = {
							newProposalsSubmitted: enabled,
							proposalInVoting: enabled,
							proposalClosed: enabled
						};
						break;
					case EProposalType.BOUNTY:
						defaultNotifications = {
							bountiesSubmitted: enabled,
							bountiesClosed: enabled
						};
						break;
					case EProposalType.CHILD_BOUNTY:
						defaultNotifications = {
							childBountiesSubmitted: enabled,
							childBountiesClosed: enabled
						};
						break;
					case EProposalType.TIP:
						defaultNotifications = {
							newTipsSubmitted: enabled,
							tipsOpened: enabled,
							tipsClosed: enabled
						};
						break;
					case EProposalType.TECHNICAL_COMMITTEE:
						defaultNotifications = {
							newTechCommitteeProposalsSubmitted: enabled,
							proposalsClosed: enabled
						};
						break;
					case EProposalType.COUNCIL_MOTION:
						defaultNotifications = {
							newMotionsSubmitted: enabled,
							motionInVoting: enabled,
							motionClosed: enabled
						};
						break;
					case 'mentionsIReceive':
						defaultNotifications = {};
						break;
					default:
						defaultNotifications = {};
				}

				const updatedSettings = {
					...(currentSettings || {}),
					enabled,
					notifications: currentSettings?.notifications ? { ...currentSettings.notifications } : defaultNotifications
				};
				updates.push({
					section: ENotifications.NETWORKS,
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

			const section = ENotifications.NETWORKS;
			const key = trackType === 'opengov' ? `${network}.openGovTracks.${trackKey}` : `${network}.gov1Items.${trackKey}`;

			const networkPrefs = preferences.triggerPreferences?.[network];
			const currentSettings =
				trackType === 'opengov'
					? networkPrefs?.openGovTracks?.[trackKey as keyof typeof networkPrefs.openGovTracks]
					: networkPrefs?.gov1Items?.[trackKey as keyof typeof networkPrefs.gov1Items];

			let notifications = {};

			if (trackType === 'opengov') {
				notifications = {
					newReferendumSubmitted: enabled,
					referendumInVoting: enabled,
					referendumClosed: enabled
				};
			} else {
				switch (trackKey) {
					case EProposalType.REFERENDUM:
						notifications = {
							newReferendumSubmitted: enabled,
							referendumInVoting: enabled,
							referendumClosed: enabled
						};
						break;
					case EProposalType.DEMOCRACY_PROPOSAL:
						notifications = {
							newProposalsSubmitted: enabled,
							proposalInVoting: enabled,
							proposalClosed: enabled
						};
						break;
					case EProposalType.BOUNTY:
						notifications = {
							bountiesSubmitted: enabled,
							bountiesClosed: enabled
						};
						break;
					case EProposalType.CHILD_BOUNTY:
						notifications = {
							childBountiesSubmitted: enabled,
							childBountiesClosed: enabled
						};
						break;
					case EProposalType.TIP:
						notifications = {
							newTipsSubmitted: enabled,
							tipsOpened: enabled,
							tipsClosed: enabled
						};
						break;
					case EProposalType.TECHNICAL_COMMITTEE:
						notifications = {
							newTechCommitteeProposalsSubmitted: enabled,
							proposalsClosed: enabled
						};
						break;
					case EProposalType.COUNCIL_MOTION:
						notifications = {
							newMotionsSubmitted: enabled,
							motionInVoting: enabled,
							motionClosed: enabled
						};
						break;
					case 'mentionsIReceive':
						notifications = {};
						break;
					default:
						notifications = {};
				}
			}

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
				const fromSettings = preferences.triggerPreferences?.[fromNetwork];
				if (!fromSettings) return false;

				const updates = [
					{
						section: ENotifications.NETWORKS,
						key: toNetwork,
						value: {
							...fromSettings,
							isPrimary: false
						}
					}
				];

				const response = await NextApiClientService.bulkUpdateNotificationPreferences({
					userId: user.id,
					updates
				});
				if (response.error) {
					throw new Error(response.error.message || 'Failed to import network settings');
				}
				return true;
			} catch {
				return false;
			}
		},
		[user?.id, preferences]
	);
	const bulkUpdateTriggerPreferences = useCallback(
		async (updates: Array<{ section: string; key: string; value: unknown; network?: string }>) => {
			if (!user?.id) return;

			const updatesByNetwork = updates.reduce(
				(acc, update) => {
					const networkKey = update.network || currentNetwork;
					if (!acc[networkKey]) {
						acc[networkKey] = [];
					}
					acc[networkKey].push(update);
					return acc;
				},
				{} as Record<string, typeof updates>
			);

			const promises = Object.entries(updatesByNetwork).map(([network, networkUpdates]) =>
				NextApiClientService.bulkUpdateNotificationPreferences({
					userId: user.id,
					updates: networkUpdates,
					network
				})
			);

			const responses = await Promise.all(promises);

			responses.forEach((response) => {
				if (response.error) {
					throw new Error(response.error.message || 'Failed to bulk update trigger preferences');
				}
			});
		},
		[user?.id, currentNetwork]
	);

	const generateToken = useCallback(
		async (channel: ENotificationChannel) => {
			if (!user?.id) return '';

			try {
				const response = await NextApiClientService.generateVerificationToken({
					userId: user.id,
					channel
				});
				if (response.error) {
					throw new Error(response.error.message || 'Failed to generate verification token');
				}
				return response.data?.token || '';
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
				const response = await NextApiClientService.verifyChannelToken({
					userId: user.id,
					channel,
					token,
					handle
				});
				if (response.error) {
					return false;
				}
				return response.data?.verified || false;
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
		bulkUpdateTriggerPreferences,

		updateNetworkPostsNotification,
		bulkUpdateNetworkPostsNotifications,

		updateNetworkCommentsNotification,
		bulkUpdateNetworkCommentsNotifications,

		updateNetworkBountiesNotification,
		bulkUpdateNetworkBountiesNotifications,

		updateNetworkOpenGovTrack,
		updateNetworkGov1Item,
		bulkUpdateNetworkAdvancedSettings,
		bulkUpdateNetworkTrackNotifications,

		generateToken,
		verifyToken
	};
};
