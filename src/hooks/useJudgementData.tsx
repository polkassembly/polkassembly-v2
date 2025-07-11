// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useQuery } from '@tanstack/react-query';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { IJudgementStats, IJudgementListingResponse, IRegistrarsListingResponse } from '@/_shared/types';
import { FIVE_MIN_IN_MILLI } from '@/app/api/_api-constants/timeConstants';
import { DEFAULT_LISTING_LIMIT } from '@/_shared/_constants/listingLimit';

export const useJudgementStats = () => {
	return useQuery<IJudgementStats>({
		queryKey: ['judgementStats'],
		queryFn: async () => {
			const { data, error } = await NextApiClientService.fetchJudgementStats();
			if (error || !data) {
				throw new Error(error?.message || 'Failed to fetch judgement stats');
			}
			return data;
		},
		staleTime: FIVE_MIN_IN_MILLI,
		retry: 3,
		refetchOnWindowFocus: false
	});
};

export const useJudgementRequests = (page: number, limit: number = DEFAULT_LISTING_LIMIT) => {
	return useQuery<IJudgementListingResponse>({
		queryKey: ['judgementRequests', page, limit],
		queryFn: async () => {
			const { data, error } = await NextApiClientService.fetchJudgementRequests({ page, limit });
			if (error || !data) {
				throw new Error(error?.message || 'Failed to fetch judgement requests');
			}
			return data;
		},
		staleTime: FIVE_MIN_IN_MILLI,
		retry: 3,
		refetchOnWindowFocus: false
	});
};

export const useRegistrars = () => {
	return useQuery<IRegistrarsListingResponse>({
		queryKey: ['registrars'],
		queryFn: async () => {
			const { data, error } = await NextApiClientService.fetchRegistrars();
			if (error || !data) {
				throw new Error(error?.message || 'Failed to fetch registrars');
			}
			return data;
		},
		staleTime: FIVE_MIN_IN_MILLI,
		retry: 3,
		refetchOnWindowFocus: false
	});
};
