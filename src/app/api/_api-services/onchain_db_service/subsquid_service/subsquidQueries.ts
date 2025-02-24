// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

export class SubsquidQueries {
	// single proposal queries

	protected static GET_PROPOSAL_BY_INDEX_AND_TYPE = `
		query ProposalByIndexAndType($index_eq: Int!, $type_eq: ProposalType!) {
			proposals(where: {index_eq: $index_eq, type_eq: $type_eq}, limit: 1) {
				index
				hash
				createdAt
				proposer
				status
				curator
				description
				origin,
				preimage {
					proposedCall {
						args
					}
				}
				statusHistory {
					status
					timestamp
					block
				}
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
				origin,
				preimage {
					proposedCall {
						args
					}
				}
				statusHistory {
					status
					timestamp
					block
				}
			}
		}
	`;

	// proposal listing queries

	protected static GET_PROPOSALS_LISTING_BY_TYPE = `
		query GetProposalsListingByType($limit: Int!, $offset: Int!, $type_eq: ProposalType!) {
			proposals(limit: $limit, offset: $offset, where: {type_eq: $type_eq}, orderBy: index_DESC) {
				createdAt
				description
				index
				origin
				proposer
				reward
				status,
				curator,
				hash,
				preimage {
					proposedCall {
						args
					}
				}
				statusHistory {
					status
					timestamp
				}
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
				reward
				hash,
				curator
				preimage {
					proposedCall {
						args
					}
				}
				statusHistory {
					status
					timestamp
				}
			}

			proposalsConnection(orderBy: id_ASC, where: {type_eq: $type_eq, status_in: $status_in}) {
				totalCount
			}
		}
	`;

	protected static GET_PROPOSALS_LISTING_BY_TYPE_STATUSES_WHERE_NOT_VOTED = `
		query GetProposalsListingByTypeAndStatuses($limit: Int!, $offset: Int!, $type_eq: ProposalType!, $status_in: [ProposalStatus!]!, $voters: [String!]!) {
			proposals(
					limit: $limit, 
					offset: $offset, 
					where: {
							type_eq: $type_eq, 
							status_in: $status_in,
							convictionVoting_none: { voter_in: $voters }
					}, 
					orderBy: index_DESC
			) {
					createdAt
					description
					index
					origin
					proposer
					reward
					curator
					status,
					hash,
					preimage {
							proposedCall {
									args
							}
					}
					statusHistory {
							status
							timestamp
					}
				}

			proposalsConnection(
				orderBy: id_ASC, 
				where: {
						type_eq: $type_eq, 
						status_in: $status_in,
						convictionVoting_none: { voter_in: $voters }
				}
			) {
					totalCount
			}
		}
	`;

	protected static GET_PROPOSALS_LISTING_BY_TYPE_STATUSES_AND_ORIGINS_WHERE_NOT_VOTED = `
		query GetProposalsListingByTypeAndStatusesAndOrigins($limit: Int!, $offset: Int!, $type_eq: ProposalType!, $status_in: [ProposalStatus!]!, $origin_in: [String!]!, $voters: [String!]!) {
			proposals(
					limit: $limit, 
					offset: $offset, 
					where: {
							type_eq: $type_eq, 
							status_in: $status_in,
							origin_in: $origin_in,
							convictionVoting_none: { voter_in: $voters }
					}, 
					orderBy: index_DESC
			) {
					createdAt
					description
					index
					origin
					proposer
					reward
					curator
					status,
					hash,
					preimage {
							proposedCall {
									args
							}
					}
					statusHistory {
							status
							timestamp
					}
				}

			proposalsConnection(
				orderBy: id_ASC, 
				where: {
						type_eq: $type_eq, 
						status_in: $status_in,
						origin_in: $origin_in,
						convictionVoting_none: { voter_in: $voters }
				}
			) {
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
				reward
				status
				hash,
				curator
				preimage {
					proposedCall {
						args
					}
				}
				statusHistory {
					status
					timestamp
				}
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
				reward
				status
				curator
				hash,
				preimage {
					proposedCall {
						args
					}
				}
				statusHistory {
					status
					timestamp
				}
			}

			proposalsConnection(orderBy: id_ASC, where: {type_eq: $type_eq, status_in: $status_in, origin_in: $origin_in}) {
				totalCount
			}
		}
	`;

	// vote metrics queries

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
			noCount: convictionVotesConnection(where: {decision_eq: no, proposal: {index_eq: $index_eq, type_eq: $type_eq}, removedAtBlock_isNull: true}, orderBy: id_ASC) {
				totalCount
			}
			yesCount: convictionVotesConnection(where: {decision_eq: yes, proposal: {index_eq: $index_eq, type_eq: $type_eq}, removedAtBlock_isNull: true}, orderBy: id_ASC) {
				totalCount
			}
			abstainCount: convictionVotesConnection(where: {decision_eq: abstain, proposal: {index_eq: $index_eq, type_eq: $type_eq}, removedAtBlock_isNull: true}, orderBy: id_ASC) {
				totalCount
			}
			splitCount: convictionVotesConnection(where: {decision_eq: split, proposal: {index_eq: $index_eq, type_eq: $type_eq}, removedAtBlock_isNull: true}, orderBy: id_ASC) {
				totalCount
			}
			splitAbstainCount: convictionVotesConnection(where: {decision_eq: splitAbstain, proposal: {index_eq: $index_eq, type_eq: $type_eq}, removedAtBlock_isNull: true}, orderBy: id_ASC) {
				totalCount
			}
			tally: proposals(where: {index_eq: $index_eq, type_eq: $type_eq}) {
				tally {
					ayes
					bareAyes
					nays
					support
				}
			}
		}
	`;

	// vote listing queries

	protected static GET_VOTES_LISTING_BY_PROPOSAL_TYPE_AND_INDEX = `
		query GetVotesListingByProposalTypeAndIndex($type_eq: ProposalType!, $index_eq: Int!, $limit: Int!, $offset: Int!) {
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

			votesConnection(where: {proposal: {index_eq: $index_eq, type_eq: $type_eq}}, orderBy: id_ASC) {
				totalCount
			}
		}
	`;

	protected static GET_CONVICTION_VOTES_LISTING_BY_PROPOSAL_TYPE_AND_INDEX = `
		query GetConvictionVotesListingByProposalTypeAndIndex($type_eq: ProposalType!, $index_eq: Int!, $limit: Int!, $offset: Int!) {
			votes:convictionVotes(where: {proposal: {index_eq: $index_eq, type_eq: $type_eq}, removedAtBlock_isNull: true}, orderBy: id_ASC, limit: $limit, offset: $offset) {
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
			votesConnection: convictionVotesConnection(where: {proposal: {index_eq: $index_eq, type_eq: $type_eq}, removedAtBlock_isNull: true}, orderBy: id_ASC) {
				totalCount
			}
		}
	`;

	protected static GET_VOTES_LISTING_BY_PROPOSAL_TYPE_AND_HASH = `
		query GetVotesListingByProposalTypeAndHash($type_eq: ProposalType!, $hash_eq: String!, $limit: Int!, $offset: Int!) {
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

			votesConnection(where: {proposal: {hash_eq: $hash_eq, type_eq: $type_eq}}, orderBy: id_ASC) {
				totalCount
			}
		}
	`;

	protected static GET_VOTES_LISTING_BY_PROPOSAL_TYPE_AND_INDEX_AND_DECISION = `
		query GetVotesListingByProposalTypeAndIndexAndDecision($type_eq: ProposalType!, $index_eq: Int!, $limit: Int!, $offset: Int!, $decision_eq: VoteDecision!) {
			votes(where: {proposal: {index_eq: $index_eq, type_eq: $type_eq}, decision_eq: $decision_eq}, orderBy: id_ASC, limit: $limit, offset: $offset) {
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
			votesConnection(where: {proposal: {index_eq: $index_eq, type_eq: $type_eq}, decision_eq: $decision_eq}, orderBy: id_ASC) {
				totalCount
			}
		}
	`;

	protected static GET_CONVICTION_VOTES_LISTING_BY_PROPOSAL_TYPE_AND_INDEX_AND_DECISION = `
		query GetConvictionVotesListingByProposalTypeAndIndex($type_eq: ProposalType!, $index_eq: Int!, $limit: Int!, $offset: Int!, $decision_eq: VoteDecision!) {
			votes: convictionVotes(where: {proposal: {index_eq: $index_eq, type_eq: $type_eq}, removedAtBlock_isNull: true, decision_eq: $decision_eq}, orderBy: id_ASC, limit: $limit, offset: $offset) {
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
			votesConnection: convictionVotesConnection(where: {proposal: {index_eq: $index_eq, type_eq: $type_eq}, removedAtBlock_isNull: true, decision_eq: $decision_eq}, orderBy: id_ASC) {
				totalCount
			}
		}
	`;

	protected static GET_VOTES_LISTING_BY_PROPOSAL_TYPE_AND_HASH_AND_DECISION = `
		query GetVotesListingByProposalTypeAndHash($type_eq: ProposalType!, $hash_eq: String!, $limit: Int!, $offset: Int!, $decision_eq: VoteDecision!) {
			votes(where: {proposal: {hash_eq: $hash_eq, type_eq: $type_eq}, decision_eq: $decision_eq}, orderBy: id_ASC, limit: $limit, offset: $offset) {
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
			votesConnection(where: {proposal: {hash_eq: $hash_eq, type_eq: $type_eq}, decision_eq: $decision_eq}, orderBy: id_ASC) {
				totalCount
			}
		}
	`;

	protected static GET_VOTES_CURVE_DATA_BY_POST_INDEX = `
		query CurveDataByIndex($index_eq: Int, $block_gte: Int, $limit: Int = 1000) {
			curveData(limit: $limit, where: {index_eq: $index_eq, block_gte: $block_gte}, orderBy: block_ASC) {
				approvalPercent
				block
				id
				index
				supportPercent
				timestamp
			}
		}
	`;

	// preimage queries

	protected static GET_PREIMAGE_BY_PROPOSAL_INDEX_AND_TYPE = `
		query GetPreimageByProposalIndexAndType($type_eq: ProposalType!, $index_eq: Int!) {
			proposals(where: {type_eq: $type_eq, index_eq: $index_eq}) {
				preimage {
					createdAt
					createdAtBlock
					deposit
					hash
					id
					length
					method
					proposedCall {
						args
						description
						method
						section
					}
					proposer
					section
					status
					updatedAt
					updatedAtBlock
				}
			}
		}
	`;

	protected static GET_PREIMAGE_BY_PROPOSAL_HASH_AND_TYPE = `
		query GetPreimageByProposalHashAndType($type_eq: ProposalType!, $hash_eq: String!) {
			proposals(where: {type_eq: $type_eq, hash_eq: $hash_eq}) {
				preimage {
					createdAt
					createdAtBlock
					deposit
					hash
					id
					length
					method
					proposedCall {
						args
						description
						method
						section
					}
					proposer
					section
					status
					updatedAt
					updatedAtBlock
				}
			}
		}
	`;

	protected static GET_PREIMAGES_LISTING = `
		query GetPreimagesListing($limit: Int!, $offset: Int!) {
			preimagesConnection(orderBy: createdAtBlock_DESC) {
				totalCount
			}
			preimages(limit: $limit, offset: $offset, orderBy: createdAtBlock_DESC) {
				hash
				id
				length
				method
				section
				deposit
				proposedCall {
					args
					description
					method
					section
				}
				proposer
				status
				updatedAt
				updatedAtBlock
				createdAtBlock
				createdAt
			}
		}
	`;

	protected static GET_PREIMAGE_BY_HASH = `
		query GetPreimageByHash($hash_eq: String!) {
			preimages(where: {hash_eq: $hash_eq}) {
				hash
				id
				length
				method
				section
				deposit
				proposedCall {
					args
					description
					method
					section
				}
				proposer
				status
				updatedAt
				updatedAtBlock
				createdAtBlock
				createdAt
			}
		}
	`;

	protected static GET_ACTIVE_VOTED_PROPOSALS_COUNT = `
		query GetActiveVotedProposalsCount($status_in: [ProposalStatus!]!, $voter_in: [String!]!) {
			votedProposalsCount: convictionVotesConnection(orderBy: id_ASC, where: {proposal: {status_in: $status_in}, voter_in: $voter_in}) {
				totalCount
			}

			activeProposalsCount: proposalsConnection(orderBy: id_ASC, where: {status_in: $status_in}) {
				totalCount
			}
		}
	`;

	protected static GET_CHILD_BOUNTIES_BY_PARENT_BOUNTY_INDEX = `
	query GetChildBountiesByParentBountyIndex($parentBountyIndex_eq: Int!, $curator_eq: String, $status_eq: ProposalStatus ) {
	totalChildBounties: proposalsConnection(orderBy: createdAtBlock_DESC, where: {parentBountyIndex_eq: $parentBountyIndex_eq, type_eq: ChildBounty, curator_eq: $curator_eq, status_eq: $status_eq}) {
    totalCount
  }  
	childBounties:proposals(orderBy: createdAtBlock_DESC, where: {parentBountyIndex_eq: $parentBountyIndex_eq, type_eq: ChildBounty, curator_eq: $curator_eq, status_eq: $status_eq}) {
    description
    index
    status
    reward
    createdAt
    curator
    payee
    proposer
    origin   
  }
}`;

	protected static GET_CHILD_BOUNTIES_COUNT_BY_PARENT_BOUNTY_INDEXES = `
query GetChildBountiesCountByParentBountyIndexes($parentBountyIndex_eq: Int!, $curator_eq: String, $status_eq: ProposalStatus ) {
 totalChildBounties: proposalsConnection(orderBy: createdAtBlock_DESC, where: {parentBountyIndex_eq: $parentBountyIndex_eq, type_eq: ChildBounty, curator_eq: $curator_eq, status_eq: $status_eq}) {
    totalCount
}  
}`;
}
