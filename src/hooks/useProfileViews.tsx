// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { ClientError } from '@/app/_client-utils/clientError';
import { dayjs } from '@/_shared/_utils/dayjsInit';

interface ProfileViewsData {
	total: number;
	unique: number;
	startDate: string;
	endDate: string;
}

interface UseProfileViewsOptions {
	startDate?: Date;
	endDate?: Date;
	enabled?: boolean;
}

export const useProfileViews = (userId?: number, options: UseProfileViewsOptions = {}) => {
	const queryClient = useQueryClient();
	const defaultStartDate = dayjs().subtract(30, 'days').toDate();
	const defaultEndDate = dayjs().toDate();

	const { startDate = defaultStartDate, endDate = defaultEndDate, enabled = true } = options;

	const defaultData = {
		total: 0,
		unique: 0,
		startDate: startDate.toISOString(),
		endDate: endDate.toISOString()
	};

	const {
		data: profileViewsData,
		isLoading: isProfileViewsLoading,
		error: profileViewsError,
		refetch: refetchProfileViews
	} = useQuery({
		queryKey: ['profileViews', userId],
		queryFn: async (): Promise<ProfileViewsData> => {
			if (!userId) return defaultData;

			const { data, error } = await NextApiClientService.getProfileViews({
				userId,
				startDate: startDate.toISOString(),
				endDate: endDate.toISOString()
			});

			if (error || !data) {
				throw new ClientError(error?.message || 'Failed to fetch profile views');
			}

			return data;
		},
		enabled: !!userId && enabled,
		placeholderData: defaultData,
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 10 * 60 * 1000, // 10 minutes
		retry: 1,
		refetchOnMount: false,
		refetchOnWindowFocus: false
	});

	// Increment profile view mutation
	const {
		mutate: incrementProfileView,
		isPending: isIncrementing,
		error: incrementError
	} = useMutation({
		mutationFn: async (): Promise<void> => {
			if (!userId) return;

			const { error } = await NextApiClientService.incrementProfileView({ userId });

			if (error) {
				throw new ClientError(error.message || 'Failed to increment profile view');
			}
		},
		onSuccess: () => {
			// Invalidate and refetch profile views data
			if (userId) {
				queryClient.invalidateQueries({ queryKey: ['profileViews', userId] });
			}
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
