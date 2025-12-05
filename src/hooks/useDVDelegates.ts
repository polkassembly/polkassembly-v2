// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { useQuery } from '@tanstack/react-query';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { IDVCohort, IDVDReferendumResponse, IDVCohortVote } from '@/_shared/types';
import { ClientError } from '@/app/_client-utils/clientError';
import { ERROR_CODES } from '@/_shared/_constants/errorLiterals';

export const useDVCohorts = () => {
	return useQuery<IDVCohort[], Error>({
		queryKey: ['dv-cohorts'],
		retry: true,
		refetchOnReconnect: true,
		refetchOnWindowFocus: false,
		refetchOnMount: true,
		staleTime: 0,
		queryFn: async () => {
			const { data, error } = await NextApiClientService.fetchDVCohorts();

			if (error) {
				throw new ClientError(ERROR_CODES.API_FETCH_ERROR, error.message || 'Failed to fetch DV cohorts');
			}

			if (!data) {
				throw new ClientError(ERROR_CODES.NOT_FOUND, 'No DV cohorts data found.');
			}

			return data;
		}
	});
};

export const useDVCohortDetails = (id: number) => {
	return useQuery<IDVCohort, Error>({
		queryKey: ['dv-cohort-details', id],
		enabled: Boolean(id),
		retry: true,
		refetchOnReconnect: true,
		refetchOnWindowFocus: false,
		refetchOnMount: true,
		staleTime: 0,
		queryFn: async () => {
			const { data, error } = await NextApiClientService.fetchDVCohortDetails(id);

			if (error) {
				throw new ClientError(ERROR_CODES.API_FETCH_ERROR, error.message || 'Failed to fetch DV cohort details');
			}

			if (!data) {
				throw new ClientError(ERROR_CODES.NOT_FOUND, 'No DV cohort details found.');
			}

			return data;
		}
	});
};

export const useDVCohortReferenda = (id: number) => {
	return useQuery<IDVDReferendumResponse[], Error>({
		queryKey: ['dv-cohort-referenda', id],
		enabled: Boolean(id),
		retry: true,
		refetchOnReconnect: true,
		refetchOnWindowFocus: false,
		refetchOnMount: true,
		staleTime: 0,
		queryFn: async () => {
			const { data, error } = await NextApiClientService.fetchDVCohortReferenda(id);

			if (error) {
				throw new ClientError(ERROR_CODES.API_FETCH_ERROR, error.message || 'Failed to fetch DV cohort referenda');
			}

			if (!data) {
				throw new ClientError(ERROR_CODES.NOT_FOUND, 'No DV cohort referenda found.');
			}

			return data;
		}
	});
};

export const useDVCohortVotes = (id: number) => {
	return useQuery<IDVCohortVote[], Error>({
		queryKey: ['dv-cohort-votes', id],
		enabled: Boolean(id),
		retry: true,
		refetchOnReconnect: true,
		refetchOnWindowFocus: false,
		refetchOnMount: true,
		staleTime: 0,
		queryFn: async () => {
			const { data, error } = await NextApiClientService.fetchDVCohortVotes(id);

			if (error) {
				throw new ClientError(ERROR_CODES.API_FETCH_ERROR, error.message || 'Failed to fetch DV cohort votes');
			}

			if (!data) {
				throw new ClientError(ERROR_CODES.NOT_FOUND, 'No DV cohort votes found.');
			}

			return data;
		}
	});
};
