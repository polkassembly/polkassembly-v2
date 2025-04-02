// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { useQuery } from '@tanstack/react-query';
import { EProposalType, IContentSummary } from '@/_shared/types';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';

interface UseAISummaryProps {
	proposalType: EProposalType;
	indexOrHash: string;
}

export const useAISummary = ({ proposalType, indexOrHash }: UseAISummaryProps) => {
	return useQuery<IContentSummary, Error>({
		queryKey: ['ai-summary', proposalType, indexOrHash],
		enabled: !!proposalType && !!indexOrHash,
		queryFn: async () => {
			const { data, error } = await NextApiClientService.fetchContentSummary({ proposalType, indexOrHash });

			if (error) {
				throw new Error(error.message);
			}

			if (!data) {
				throw new Error('No summary data found.');
			}

			return data;
		}
	});
};
