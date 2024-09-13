// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NETWORKS_DETAILS } from '@shared/_constants/networks';
import { ENetwork, EProposalType, IOnChainPostInfo } from '@shared/types';
import { cacheExchange, Client as UrqlClient, fetchExchange } from '@urql/core';
import { ValidatorService } from '@shared/_services/validator_service';
import { APIError } from '@api/_api-utils/apiError';
import { ERROR_CODES } from '@shared/_constants/errorLiterals';
import { StatusCodes } from 'http-status-codes';
import { SubsquidQueries } from './subsquidQueries';

export class OnChainDbService extends SubsquidQueries {
	private static graphqlClient = (network: ENetwork) => {
		return new UrqlClient({
			url: NETWORKS_DETAILS[network.toString() as keyof typeof NETWORKS_DETAILS]?.subsquidUrl,
			exchanges: [cacheExchange, fetchExchange]
		});
	};

	private static async GetOnChainPostInfoWithSubsquid({ network, indexOrHash, proposalType }: { network: ENetwork; indexOrHash: string; proposalType: EProposalType }) {
		const client = this.graphqlClient(network);

		const query = proposalType === EProposalType.TIP ? this.GET_PROPOSAL_BY_HASH_AND_TYPE : this.GET_PROPOSAL_BY_INDEX_AND_TYPE;
		const variables = proposalType === EProposalType.TIP ? { hash_eq: indexOrHash, type_eq: proposalType } : { index_eq: Number(indexOrHash), type_eq: proposalType };

		const { data: subsquidData, error: subsquidErr } = await client.query(query, variables).toPromise();

		if (subsquidErr || !subsquidData) {
			console.error(`Error fetching on-chain post info from Subsquid: ${subsquidErr}`);
			throw new APIError(ERROR_CODES.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR, 'Error fetching on-chain post info from Subsquid');
		}

		if (subsquidData.proposals.length === 0) return null;

		const proposal = subsquidData.proposals[0];

		return {
			createdAt: proposal.createdAt,
			proposer: proposal.proposer || '',
			status: proposal.status,
			description: proposal.description || ''
		} as IOnChainPostInfo;
	}

	static async GetOnChainPostInfo({ network, indexOrHash, proposalType }: { network: ENetwork; indexOrHash: string; proposalType: EProposalType }) {
		if (ValidatorService.isValidOffChainProposalType(proposalType)) {
			throw new APIError(ERROR_CODES.INVALID_PARAMS_ERROR, StatusCodes.BAD_REQUEST);
		}

		// fetch from subsquid
		const onChainPostInfo = await this.GetOnChainPostInfoWithSubsquid({ network, indexOrHash, proposalType });

		if (onChainPostInfo) return onChainPostInfo;

		// TODO: fallback to fetch from subsquare
		// TODO: fallback to fetch from subscan

		return null;
	}
}
