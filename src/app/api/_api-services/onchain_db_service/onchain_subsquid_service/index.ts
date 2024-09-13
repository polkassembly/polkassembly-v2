// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ENetwork, EProposalStatus, EProposalType, IOnChainPostInfo, IOnChainPostListing } from '@shared/types';
import { cacheExchange, Client as UrqlClient, fetchExchange } from '@urql/core';
import { NETWORKS_DETAILS } from '@shared/_constants/networks';
import { APIError } from '@api/_api-utils/apiError';
import { ERROR_CODES } from '@shared/_constants/errorLiterals';
import { StatusCodes } from 'http-status-codes';
import { SubsquidQueries } from './subsquidQueries';

export class OnChainSubsquidService extends SubsquidQueries {
	private static subsquidGqlClient = (network: ENetwork) => {
		const subsquidUrl = NETWORKS_DETAILS[network.toString() as keyof typeof NETWORKS_DETAILS]?.subsquidUrl;

		if (!subsquidUrl) {
			throw new APIError(ERROR_CODES.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR, 'Subsquid URL not found for the given network');
		}

		return new UrqlClient({
			url: subsquidUrl,
			exchanges: [cacheExchange, fetchExchange]
		});
	};

	static async GetOnChainPostInfo({ network, indexOrHash, proposalType }: { network: ENetwork; indexOrHash: string; proposalType: EProposalType }) {
		const gqlClient = this.subsquidGqlClient(network);

		const query = proposalType === EProposalType.TIP ? this.GET_PROPOSAL_BY_HASH_AND_TYPE : this.GET_PROPOSAL_BY_INDEX_AND_TYPE;
		const variables = proposalType === EProposalType.TIP ? { hash_eq: indexOrHash, type_eq: proposalType } : { index_eq: Number(indexOrHash), type_eq: proposalType };

		const { data: subsquidData, error: subsquidErr } = await gqlClient.query(query, variables).toPromise();

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

	static async GetOnChainPostsListing({ network, proposalType, limit, page }: { network: ENetwork; proposalType: EProposalType; limit: number; page: number }) {
		const gqlClient = this.subsquidGqlClient(network);

		const { data: subsquidData, error: subsquidErr } = await gqlClient
			.query(this.GET_PROPOSALS_LISTING_BY_TYPE, {
				limit,
				offset: (page - 1) * limit,
				type_eq: proposalType
			})
			.toPromise();

		if (subsquidErr || !subsquidData) {
			console.error(`Error fetching on-chain posts listing from Subsquid: ${subsquidErr}`);
			throw new APIError(ERROR_CODES.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR, 'Error fetching on-chain posts listing from Subsquid');
		}

		if (subsquidData.proposals.length === 0) return [];

		const posts: IOnChainPostListing[] = [];

		subsquidData.proposals.forEach(
			(proposal: { createdAt: Date; description?: string; index: number; origin: string; proposer?: string; status?: EProposalStatus; hash?: string }) => {
				posts.push({
					createdAt: proposal.createdAt,
					description: proposal.description || '',
					index: proposal.index,
					origin: proposal.origin,
					proposer: proposal.proposer || '',
					status: proposal.status || EProposalStatus.UNKNOWN,
					type: proposalType,
					hash: proposal.hash || ''
				});
			}
		);

		return posts;
	}
}
