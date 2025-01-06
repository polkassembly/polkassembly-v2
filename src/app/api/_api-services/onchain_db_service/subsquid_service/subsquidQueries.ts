// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

export class SubsquidQueries {
	protected static GET_PROPOSAL_BY_INDEX_AND_TYPE = `
		query ProposalByIndexAndType($index_eq: Int!, $type_eq: ProposalType!) {
			proposals(where: {index_eq: $index_eq, type_eq: $type_eq}, limit: 1) {
				index
				hash
				createdAt
				proposer
				status
				description
				origin
			}
		}
	`;

	protected static GET_PROPOSAL_BY_HASH_AND_TYPE = `
		query GetProposalByHash($type_eq: ProposalType!, $hash_eq: String!) {
			proposals(where: {type_eq: $type_eq, hash_eq: $hash_eq}, limit: 1) {
				index
				hash
				createdAt
				proposer
				status
				description
				origin
			}
		}
	`;

	protected static GET_PROPOSALS_LISTING_BY_TYPE = `
		query GetProposalsListingByType($limit: Int!, $offset: Int!, $type_eq: ProposalType!) {
			proposals(limit: $limit, offset: $offset, where: {type_eq: $type_eq}, orderBy: index_DESC) {
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
			proposals(limit: $limit, offset: $offset, where: {type_eq: $type_eq, status_in: $status_in}, orderBy: index_DESC) {
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
			proposals(limit: $limit, offset: $offset, where: {type_eq: $type_eq, origin_in: $origin_in}, orderBy: index_DESC) {
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
			proposals(limit: $limit, offset: $offset, where: {type_eq: $type_eq, status_in: $status_in, origin_in: $origin_in}, orderBy: index_DESC) {
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

	protected static GET_VOTE_METRICS_BY_PROPOSAL_TYPE_AND_INDEX = `
		query GetVoteMetricsByProposalTypeAndIndex($type_eq: ProposalType!, $index_eq: Int!) {
			noCount: votesConnection(where: {decision_eq: no, proposal: {index_eq: $index_eq, type_eq: $type_eq}}, orderBy: id_ASC) {
				totalCount
			}
			yesCount: votesConnection(where: {decision_eq: yes, proposal: {index_eq: $index_eq, type_eq: $type_eq}}, orderBy: id_ASC) {
				totalCount
			}
			abstainCount: votesConnection(where: {decision_eq: abstain, proposal: {index_eq: $index_eq, type_eq: $type_eq}}, orderBy: id_ASC) {
				totalCount
			}
			splitCount: votesConnection(where: {decision_eq: split, proposal: {index_eq: $index_eq, type_eq: $type_eq}}, orderBy: id_ASC) {
				totalCount
			}
			splitAbstainCount: votesConnection(where: {decision_eq: splitAbstain, proposal: {index_eq: $index_eq, type_eq: $type_eq}}, orderBy: id_ASC) {
				totalCount
			}
			tally: proposals(where:{index_eq: $index_eq, type_eq: $type_eq}) {
				tally {
					ayes
					bareAyes
					nays
					support
				}
			}
		}
	`;

	protected static GET_CONVICTION_VOTE_METRICS_BY_PROPOSAL_TYPE_AND_INDEX = `
		query GetConvictionVoteMetricsByProposalTypeAndIndex($type_eq: ProposalType!, $index_eq: Int!) {
			noCount: convictionVotesConnection(where: {decision_eq: no, proposal: {index_eq: $index_eq, type_eq: $type_eq}}, orderBy: id_ASC) {
				totalCount
			}
			yesCount: convictionVotesConnection(where: {decision_eq: yes, proposal: {index_eq: $index_eq, type_eq: $type_eq}}, orderBy: id_ASC) {
				totalCount
			}
			abstainCount: convictionVotesConnection(where: {decision_eq: abstain, proposal: {index_eq: $index_eq, type_eq: $type_eq}}, orderBy: id_ASC) {
				totalCount
			}
			splitCount: convictionVotesConnection(where: {decision_eq: split, proposal: {index_eq: $index_eq, type_eq: $type_eq}}, orderBy: id_ASC) {
				totalCount
			}
			splitAbstainCount: convictionVotesConnection(where: {decision_eq: splitAbstain, proposal: {index_eq: $index_eq, type_eq: $type_eq}}, orderBy: id_ASC) {
				totalCount
			}
			tally: proposals(where:{index_eq: $index_eq, type_eq: $type_eq}) {
				tally {
					ayes
					bareAyes
					nays
					support
				}
			}
		}
	`;

	protected static GET_VOTES_BY_PROPOSAL_TYPE_AND_INDEX = `
		query GetVotesByProposalTypeAndIndex($type_eq: ProposalType!, $index_eq: Int!, $limit: Int!, $offset: Int!) {
			votes(where: {proposal: {index_eq: $index_eq, type_eq: $type_eq}}, orderBy: id_ASC, limit: $limit, offset: $offset) {
				id
				balance {
					... on StandardVoteBalance {
						value
					}
					... on SplitVoteBalance {
						aye
						nay
						abstain
					}
				}
				decision
				lockPeriod
				timestamp
				voter
			}
		}
	`;

	protected static GET_CONVICTION_VOTES_BY_PROPOSAL_TYPE_AND_INDEX = `
		query GetConvictionVotesByProposalTypeAndIndex($type_eq: ProposalType!, $index_eq: Int!, $limit: Int!, $offset: Int!) {
			votes:convictionVotes(where: {proposal: {index_eq: $index_eq, type_eq: $type_eq}, removedAt_isNull: false}, orderBy: id_ASC, limit: $limit, offset: $offset) {
				id
				balance {
					... on StandardVoteBalance {
						value
					}
					... on SplitVoteBalance {
						aye
						nay
						abstain
					}
				}
				decision
				lockPeriod
				voter
				createdAt
				selfVotingPower
				totalVotingPower
				delegatedVotingPower
			}
		}
	`;

	protected static GET_VOTES_BY_PROPOSAL_TYPE_AND_HASH = `
		query GetVotesByProposalTypeAndHash($type_eq: ProposalType!, $hash_eq: String!, $limit: Int!, $offset: Int!) {
			votes(where: {proposal: {hash_eq: $hash_eq, type_eq: $type_eq}}, orderBy: id_ASC, limit: $limit, offset: $offset) {
				id
				balance {
					... on StandardVoteBalance {
						value
					}
					... on SplitVoteBalance {
						aye
						nay
						abstain
					}
				}
				decision
				lockPeriod
				timestamp
				voter
			}
		}
	`;
}
