// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { useState, useEffect } from 'react';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { IDVDelegatesResponse, IDVReferendaInfluenceResponse, IDVVotingMatrixResponse, EDVTrackFilter } from '@/_shared/types';

const UNEXPECTED_ERROR = 'An unexpected error occurred';

export const useDVDelegates = (cohortId?: number, trackFilter = EDVTrackFilter.DV_TRACKS) => {
	const [data, setData] = useState<IDVDelegatesResponse | null>(null);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchData = async () => {
			setLoading(true);
			setError(null);
			try {
				const { data: result, error: apiError } = await NextApiClientService.fetchDVDelegates({ cohortId, trackFilter });
				if (apiError) {
					setError(apiError.message || 'Failed to fetch DV delegates');
				} else {
					setData(result);
				}
			} catch {
				setError(UNEXPECTED_ERROR);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, [cohortId, trackFilter]);

	return { data, loading, error };
};

export const useDVInfluence = (cohortId?: number, sortBy?: 'status' | 'votes', trackFilter = EDVTrackFilter.DV_TRACKS) => {
	const [data, setData] = useState<IDVReferendaInfluenceResponse | null>(null);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchData = async () => {
			setLoading(true);
			setError(null);
			try {
				const { data: result, error: apiError } = await NextApiClientService.fetchDVInfluence({ cohortId, trackFilter, sortBy });
				if (apiError) {
					setError(apiError.message || 'Failed to fetch DV influence');
				} else {
					setData(result);
				}
			} catch {
				setError(UNEXPECTED_ERROR);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, [cohortId, trackFilter, sortBy]);

	return { data, loading, error };
};

export const useDVVotingMatrix = (cohortId?: number, trackFilter = EDVTrackFilter.DV_TRACKS) => {
	const [data, setData] = useState<IDVVotingMatrixResponse | null>(null);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchData = async () => {
			setLoading(true);
			setError(null);
			try {
				const { data: result, error: apiError } = await NextApiClientService.fetchDVVotingMatrix({ cohortId, trackFilter });
				if (apiError) {
					setError(apiError.message || 'Failed to fetch DV voting matrix');
				} else {
					setData(result);
				}
			} catch {
				setError(UNEXPECTED_ERROR);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, [cohortId, trackFilter]);

	return { data, loading, error };
};
