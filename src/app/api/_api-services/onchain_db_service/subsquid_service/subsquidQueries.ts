// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

export class SubsquidQueries {
	protected static GET_PROPOSAL_BY_INDEX_AND_TYPE = `
		query ProposalByIndexAndType($index_eq: Int!, $type_eq: ProposalType!) {
			proposals(where: {index_eq: $index_eq, type_eq: $type_eq}, limit: 1) {
				createdAt
				proposer
				status
				description
			}
		}
	`;

	protected static GET_PROPOSAL_BY_HASH_AND_TYPE = `
		query GetProposalByHash($type_eq: ProposalType!, $hash_eq: String!) {
			proposals(where: {type_eq: $type_eq, hash_eq: $hash_eq}, limit: 1) {
				createdAt
				proposer
				status
				description
			}
		}
	`;

	protected static GET_PROPOSALS_LISTING_BY_TYPE = `
		query GetProposalsListingByType($limit: Int!, $offset: Int!, $type_eq: ProposalType!) {
			proposals(limit: $limit, offset: $offset, where: {type_eq: $type_eq}) {
				createdAt
				description
				index
				origin
				proposer
				status,
				hash
			}

			proposalsConnection(orderBy: id_ASC, where: {type_eq: $type_eq}) {
				totalCount
			}
		}
	`;

	protected static GET_PROPOSALS_LISTING_BY_TYPE_AND_STATUSES = `
		query GetProposalsListingByTypeAndStatuses($limit: Int!, $offset: Int!, $type_eq: ProposalType!, $status_in: [ProposalStatus!]!) {
			proposals(limit: $limit, offset: $offset, where: {type_eq: $type_eq, status_in: $status_in}) {
				createdAt
				description
				index
				origin
				proposer
				status,
				hash
			}

			proposalsConnection(orderBy: id_ASC, where: {type_eq: $type_eq, status_in: $status_in}) {
				totalCount
			}
		}
	`;

	protected static GET_PROPOSALS_LISTING_BY_TYPE_AND_ORIGINS = `
		query GetProposalsListingByTypeAndOrigins($limit: Int!, $offset: Int!, $type_eq: ProposalType!, $origin_in: [String!]!) {
			proposals(limit: $limit, offset: $offset, where: {type_eq: $type_eq, origin_in: $origin_in}) {
				createdAt
				description
				index
				origin
				proposer
				status
				hash
			}

			proposalsConnection(orderBy: id_ASC, where: {type_eq: $type_eq, origin_in: $origin_in}) {
				totalCount
			}
		}
	`;

	protected static GET_PROPOSALS_LISTING_BY_TYPE_AND_STATUSES_AND_ORIGINS = `
		query GetProposalsListingByTypeAndStatusesAndOrigins($limit: Int!, $offset: Int!, $type_eq: ProposalType!, $status_in: [ProposalStatus!]!, $origin_in: [String!]!) {
			proposals(limit: $limit, offset: $offset, where: {type_eq: $type_eq, status_in: $status_in, origin_in: $origin_in}) {
				createdAt
				description
				index
				origin
				proposer
				status
				hash
			}

			proposalsConnection(orderBy: id_ASC, where: {type_eq: $type_eq, status_in: $status_in, origin_in: $origin_in}) {
				totalCount
			}
		}
	`;
}
