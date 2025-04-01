// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { useEffect, useState } from 'react';
import { EProposalType, IContentSummary } from '@/_shared/types';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';

interface UseAISummaryProps {
	proposalType: EProposalType;
	indexOrHash: string;
}

export const useAISummary = ({ proposalType, indexOrHash }: UseAISummaryProps) => {
	const [summary, setSummary] = useState<IContentSummary | null>(null);
	const [loading, setLoading] = useState(true);
	const [fetchError, setFetchError] = useState<string | null>(null);

	const fetchSummary = async () => {
		try {
			const { data, error } = await NextApiClientService.fetchContentSummary({ proposalType, indexOrHash });
			if (error) {
				setFetchError(error.message);
			}
			setSummary(data);
		} catch (err: unknown) {
			if (err instanceof Error) {
				setFetchError(err.message);
			} else {
				setFetchError('Unknown error occurred');
			}
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (!proposalType || !indexOrHash) {
			setFetchError('Missing proposalType or index/hash');
			setLoading(false);
			return;
		}
		fetchSummary();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [proposalType, indexOrHash]);

	return { summary, loading, error: fetchError };
};
