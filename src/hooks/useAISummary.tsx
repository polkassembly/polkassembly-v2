// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { useQuery } from '@tanstack/react-query';
import { EProposalType, IContentSummary } from '@/_shared/types';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { ClientError } from '@/app/_client-utils/clientError';
import { ERROR_CODES } from '@/_shared/_constants/errorLiterals';
import { ValidatorService } from '@/_shared/_services/validator_service';

interface Props {
	initialData?: IContentSummary;
	proposalType: EProposalType;
	indexOrHash: string;
}

export const useAISummary = ({ initialData, proposalType, indexOrHash }: Props) => {
	return useQuery<IContentSummary, Error>({
		queryKey: ['ai-summary', proposalType, indexOrHash],
		enabled: Boolean(proposalType) && ValidatorService.isValidIndexOrHash(indexOrHash),
		placeholderData: (previousData) => previousData || initialData,
		retry: true,
		refetchOnReconnect: true,
		refetchOnWindowFocus: true,
		refetchOnMount: true,
		queryFn: async () => {
			const { data, error } = await NextApiClientService.fetchContentSummary({ proposalType, indexOrHash });

			if (error) {
				throw new ClientError(ERROR_CODES.API_FETCH_ERROR, error.message);
			}

			if (!data) {
				throw new ClientError(ERROR_CODES.NOT_FOUND, 'No summary data found.');
			}

			return data;
		}
	});
};
