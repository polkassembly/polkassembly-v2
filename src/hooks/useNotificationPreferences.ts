// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useCallback, useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { IUpdateNotificationPreferencesRequest, IUserNotificationChannelPreferences, ENotificationChannel, ENotifications, EPostOrigin, EProposalType } from '@/_shared/types';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { STALE_TIME } from '@/_shared/_constants/listingLimit';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { useUser } from './useUser';

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
				network: currentNetwork,
				getAllNetworks
			});
			if (response.error) {
				throw new Error(response.error.message || 'Failed to fetch notification preferences');
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
				updateData,
				network: currentNetwork
			});
			if (response.error) {
				throw new Error(response.error.message || 'Failed to update notification preferences');
			}
			return response.data;
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
				mentionsIReceive: 'Mentions I receive',
				referendums: EProposalType.REFERENDUM,
				proposals: EProposalType.DEMOCRACY_PROPOSAL,
				bounties: EProposalType.BOUNTY,
				childBounties: EProposalType.CHILD_BOUNTY,
				tips: EProposalType.TIP,
				techCommittee: EProposalType.TECHNICAL_COMMITTEE,
				councilMotion: EProposalType.COUNCIL_MOTION
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

				const response = await NextApiClientService.bulkUpdateNotificationPreferences({
					userId: user.id,
					updates
				});
				if (response.error) {
					throw new Error(response.error.message || 'Failed to import network settings');
				}
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

			const response = await NextApiClientService.bulkUpdateNotificationPreferences({
				userId: user.id,
				updates
			});
			if (response.error) {
				throw new Error(response.error.message || 'Failed to bulk update network preferences');
			}
		},
		[user?.id]
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
		bulkUpdateNetworkPreferences,

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
