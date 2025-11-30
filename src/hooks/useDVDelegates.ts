// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { useQuery } from '@tanstack/react-query';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { IDVDelegatesResponse, IDVReferendaInfluenceResponse, IDVVotingMatrixResponse, EDVTrackFilter } from '@/_shared/types';
import { ClientError } from '@/app/_client-utils/clientError';
import { ERROR_CODES } from '@/_shared/_constants/errorLiterals';

interface UseDVDelegatesProps {
	cohortId?: number;
	trackFilter?: EDVTrackFilter;
	initialData?: IDVDelegatesResponse;
}

export const useDVDelegates = ({ cohortId, trackFilter = EDVTrackFilter.DV_TRACKS }: UseDVDelegatesProps) => {
	return useQuery<IDVDelegatesResponse, Error>({
		queryKey: ['dv-delegates', cohortId, trackFilter],
		enabled: Boolean(cohortId),
		retry: true,
		refetchOnReconnect: true,
		refetchOnWindowFocus: false,
		refetchOnMount: true,
		staleTime: 0,
		queryFn: async () => {
			const { data, error } = await NextApiClientService.fetchDVDelegates({ cohortId, trackFilter });

			if (error) {
				throw new ClientError(ERROR_CODES.API_FETCH_ERROR, error.message || 'Failed to fetch DV delegates');
			}

			if (!data) {
				throw new ClientError(ERROR_CODES.NOT_FOUND, 'No DV delegates data found.');
			}

			return data;
		}
	});
};

interface UseDVInfluenceProps {
	cohortId?: number;
	sortBy?: 'status' | 'votes';
	trackFilter?: EDVTrackFilter;
	initialData?: IDVReferendaInfluenceResponse;
}

export const useDVInfluence = ({ cohortId, sortBy, trackFilter = EDVTrackFilter.DV_TRACKS }: UseDVInfluenceProps) => {
	return useQuery<IDVReferendaInfluenceResponse, Error>({
		queryKey: ['dv-influence', cohortId, trackFilter, sortBy],
		enabled: Boolean(cohortId),
		retry: true,
		refetchOnReconnect: true,
		refetchOnWindowFocus: false,
		refetchOnMount: true,
		staleTime: 0,
		queryFn: async () => {
			const { data, error } = await NextApiClientService.fetchDVInfluence({ cohortId, trackFilter, sortBy });

			if (error) {
				throw new ClientError(ERROR_CODES.API_FETCH_ERROR, error.message || 'Failed to fetch DV influence');
			}

			if (!data) {
				throw new ClientError(ERROR_CODES.NOT_FOUND, 'No DV influence data found.');
			}

			return data;
		}
	});
};

interface UseDVVotingMatrixProps {
	cohortId?: number;
	trackFilter?: EDVTrackFilter;
	initialData?: IDVVotingMatrixResponse;
}

export const useDVVotingMatrix = ({ cohortId, trackFilter = EDVTrackFilter.DV_TRACKS }: UseDVVotingMatrixProps) => {
	return useQuery<IDVVotingMatrixResponse, Error>({
		queryKey: ['dv-voting-matrix', cohortId, trackFilter],
		enabled: Boolean(cohortId),
		retry: true,
		refetchOnReconnect: true,
		refetchOnWindowFocus: false,
		refetchOnMount: true,
		staleTime: 0,
		queryFn: async () => {
			const { data, error } = await NextApiClientService.fetchDVVotingMatrix({ cohortId, trackFilter });

			if (error) {
				throw new ClientError(ERROR_CODES.API_FETCH_ERROR, error.message || 'Failed to fetch DV voting matrix');
			}

			if (!data) {
				throw new ClientError(ERROR_CODES.NOT_FOUND, 'No DV voting matrix data found.');
			}

			return data;
		}
	});
};
