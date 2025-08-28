// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { ClientError } from '@/app/_client-utils/clientError';

interface ProfileViewsData {
	total: number;
	unique: number;
	period: string;
}

interface UseProfileViewsOptions {
	timePeriod?: 'today' | 'week' | 'month' | 'all';
	enabled?: boolean;
}

export const useProfileViews = (userId?: number, address?: string, options: UseProfileViewsOptions = {}) => {
	const { timePeriod = 'month', enabled = true } = options;
	const queryClient = useQueryClient();

	// Determine if we should use userId or address for tracking
	const useUserId = !!userId;
	const useAddress = !userId && !!address;

	// Fetch profile views data
	const {
		data: profileViewsData,
		isLoading: isProfileViewsLoading,
		error: profileViewsError,
		refetch: refetchProfileViews
	} = useQuery({
		queryKey: ['profileViews', userId || address, timePeriod],
		queryFn: async (): Promise<ProfileViewsData> => {
			if (!userId && !address) {
				throw new ClientError('Either User ID or Address is required');
			}

			if (useUserId) {
				const { data, error } = await NextApiClientService.getProfileViews({
					userId: userId!,
					timePeriod
				});

				if (error || !data) {
					throw new ClientError(error?.message || 'Failed to fetch profile views');
				}

				return data;
			}

			const { data, error } = await NextApiClientService.getProfileViewsByAddress({
				address: address!,
				timePeriod
			});

			if (error || !data) {
				throw new ClientError(error?.message || 'Failed to fetch profile views');
			}

			return data;
		},
		enabled: (useUserId || useAddress) && enabled,
		retry: false,
		refetchOnMount: false,
		refetchOnWindowFocus: false,
		staleTime: 5 * 60 * 1000 // 5 minutes
	});

	// Increment profile view mutation
	const {
		mutate: incrementProfileView,
		isPending: isIncrementing,
		error: incrementError
	} = useMutation({
		mutationFn: async (): Promise<void> => {
			if (!userId && !address) {
				throw new ClientError('Either User ID or Address is required');
			}

			if (useUserId) {
				const { error } = await NextApiClientService.incrementProfileView({ userId: userId! });

				if (error) {
					throw new ClientError(error.message || 'Failed to increment profile view');
				}
			} else {
				const { error } = await NextApiClientService.incrementProfileViewByAddress({ address: address! });

				if (error) {
					throw new ClientError(error.message || 'Failed to increment profile view');
				}
			}
		},
		onSuccess: () => {
			// Invalidate and refetch profile views data
			queryClient.invalidateQueries({ queryKey: ['profileViews', userId || address] });
		},
		onError: (error) => {
			console.error('Failed to increment profile view:', error);
		}
	});

	return {
		profileViewsData,
		isProfileViewsLoading,
		profileViewsError,
		refetchProfileViews,
		incrementProfileView,
		isIncrementing,
		incrementError
	};
};
