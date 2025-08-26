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

export const useProfileViews = (userId?: number, options: UseProfileViewsOptions = {}) => {
	const { timePeriod = 'all', enabled = true } = options;
	const queryClient = useQueryClient();

	// Fetch profile views data
	const {
		data: profileViewsData,
		isLoading: isProfileViewsLoading,
		error: profileViewsError,
		refetch: refetchProfileViews
	} = useQuery({
		queryKey: ['profileViews', userId, timePeriod],
		queryFn: async (): Promise<ProfileViewsData> => {
			if (!userId) {
				throw new ClientError('User ID is required');
			}

			const { data, error } = await NextApiClientService.getProfileViews({
				userId,
				timePeriod
			});

			if (error || !data) {
				throw new ClientError(error?.message || 'Failed to fetch profile views');
			}

			return data;
		},
		enabled: !!userId && enabled,
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
			if (!userId) {
				throw new ClientError('User ID is required');
			}

			const { error } = await NextApiClientService.incrementProfileView({ userId });

			if (error) {
				throw new ClientError(error.message || 'Failed to increment profile view');
			}
		},
		onSuccess: () => {
			// Invalidate and refetch profile views data
			queryClient.invalidateQueries({ queryKey: ['profileViews', userId] });
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
