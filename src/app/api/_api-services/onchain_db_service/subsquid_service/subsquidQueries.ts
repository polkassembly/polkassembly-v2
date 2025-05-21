// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ACTIVE_PROPOSAL_STATUSES } from '@/_shared/_constants/activeProposalStatuses';

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
				reward
				fee
				deposit
				curatorDeposit
				parentBountyIndex
				payee
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

	protected static GET_VOTE_METRICS_BY_PROPOSAL_TYPE_AND_HASH = `
		query GetVoteMetricsByProposalTypeAndHash($type_eq: ProposalType!, $hash_eq: String!) {
			noCount: votesConnection(where: {decision_eq: no, proposal: {hash_eq: $hash_eq, type_eq: $type_eq}}, orderBy: id_ASC) {
				totalCount
			}
			yesCount: votesConnection(where: {decision_eq: yes, proposal: {hash_eq: $hash_eq, type_eq: $type_eq}}, orderBy: id_ASC) {
				totalCount
			}
			abstainCount: votesConnection(where: {decision_eq: abstain, proposal: {hash_eq: $hash_eq, type_eq: $type_eq}}, orderBy: id_ASC) {
				totalCount
			}
			splitCount: votesConnection(where: {decision_eq: split, proposal: {hash_eq: $hash_eq, type_eq: $type_eq}}, orderBy: id_ASC) {
				totalCount
			}
			splitAbstainCount: votesConnection(where: {decision_eq: splitAbstain, proposal: {hash_eq: $hash_eq, type_eq: $type_eq}}, orderBy: id_ASC) {
				totalCount
			}
			tally: proposals(where:{hash_eq: $hash_eq, type_eq: $type_eq}) {
				tally {
					ayes
					bareAyes
					nays
					support
				}
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

	protected static GET_VOTES_LISTING_BY_PROPOSAL_TYPE_AND_INDEX = ({ voter }: { voter?: string }) => `
		query GetVotesListingByProposalTypeAndIndex($type_eq: ProposalType!, $index_eq: Int!, $limit: Int!, $offset: Int!) {
			votes(where: {proposal: {index_eq: $index_eq, type_eq: $type_eq} ${voter ? `, voter_eq: "${voter}"` : ''}}, orderBy: id_ASC, limit: $limit, offset: $offset) {
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

			yesCount:votesConnection(where: {proposal: {index_eq: $index_eq, type_eq: $type_eq}, decision_eq: yes, ${voter ? `, voter_eq: "${voter}"` : ''}}, orderBy: id_ASC) {
				totalCount
			}
				noCount:votesConnection(where: {proposal: {index_eq: $index_eq, type_eq: $type_eq}, decision_eq: no, ${voter ? `, voter_eq: "${voter}"` : ''}}, orderBy: id_ASC) {
				totalCount
			}
		}
	`;

	protected static GET_CONVICTION_VOTES_LISTING_BY_PROPOSAL_TYPE_AND_INDEX = ({ voter }: { voter?: string }) => `
		query GetConvictionVotesListingByProposalTypeAndIndex($type_eq: ProposalType!, $index_eq: Int!, $limit: Int!, $offset: Int!, $orderBy: [ConvictionVoteOrderByInput!] = createdAtBlock_DESC) {
			votes: convictionVotes(where: {proposal: {index_eq: $index_eq, type_eq: $type_eq}, removedAtBlock_isNull: true ${voter ? `, voter_eq: "${voter}"` : ''}}, orderBy: $orderBy, limit: $limit, offset: $offset) {
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
				delegatedVotes {
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
					createdAt
					voter
					votingPower
					lockPeriod
					decision
				}
			}
			yesCount:  convictionVotesConnection(where: {decision_eq: yes,  proposal: {index_eq: $index_eq, type_eq: $type_eq}, removedAtBlock_isNull: true, ${voter ? `, voter_eq: "${voter}"` : ''}}, orderBy: id_ASC) {
				totalCount
			}
			noCount:  convictionVotesConnection(where: {decision_eq: no,  proposal: {index_eq: $index_eq, type_eq: $type_eq}, removedAtBlock_isNull: true, ${voter ? `, voter_eq: "${voter}"` : ''}}, orderBy: id_ASC) {
				totalCount
			}
			abstainCount:  convictionVotesConnection(where: {decision_eq: abstain,  proposal: {index_eq: $index_eq, type_eq: $type_eq}, removedAtBlock_isNull: true, ${voter ? `, voter_eq: "${voter}"` : ''}}, orderBy: id_ASC) {
				totalCount
			}
		}
	`;

	protected static GET_VOTES_LISTING_BY_PROPOSAL_TYPE_AND_HASH = ({ voter }: { voter?: string }) => `
		query GetVotesListingByProposalTypeAndHash($type_eq: ProposalType!, $hash_eq: String!, $limit: Int!, $offset: Int!) {
			votes(where: {proposal: {hash_eq: $hash_eq, type_eq: $type_eq} ${voter ? `, voter_eq: "${voter}"` : ''}}, orderBy: id_ASC, limit: $limit, offset: $offset) {
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

			yesCount: votesConnection(where: {proposal: {hash_eq: $hash_eq, type_eq: $type_eq}, decision_eq: yes, ${voter ? `, voter_eq: "${voter}"` : ''}}, orderBy: id_ASC) {
				totalCount
			}
			noCount: votesConnection(where: {proposal: {hash_eq: $hash_eq, type_eq: $type_eq}, decision_eq: no, ${voter ? `, voter_eq: "${voter}"` : ''}}, orderBy: id_ASC) {
				totalCount
			}
		}
	`;

	protected static GET_VOTES_LISTING_BY_PROPOSAL_TYPE_AND_INDEX_AND_DECISION = ({ voter }: { voter?: string }) => `
		query GetVotesListingByProposalTypeAndIndexAndDecision($type_eq: ProposalType!, $index_eq: Int!, $limit: Int!, $offset: Int!, $decision_eq: VoteDecision!) {
			votes(where: {proposal: {index_eq: $index_eq, type_eq: $type_eq}, decision_eq: $decision_eq ${voter ? `, voter_eq: "${voter}"` : ''}}, orderBy: id_ASC, limit: $limit, offset: $offset) {
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
			yesCount:votesConnection(where: {proposal: {index_eq: $index_eq, type_eq: $type_eq}, decision_eq: yes, ${voter ? `, voter_eq: "${voter}"` : ''}}, orderBy: id_ASC) {
				totalCount
			}
			noCount:votesConnection(where: {proposal: {index_eq: $index_eq, type_eq: $type_eq}, decision_eq: no}, orderBy: id_ASC) {
				totalCount
			}
		}
	`;

	protected static GET_CONVICTION_VOTES_LISTING_BY_PROPOSAL_TYPE_AND_INDEX_AND_DECISION = ({ voter }: { voter?: string }) => `
		query GetConvictionVotesListingByProposalTypeAndIndex($type_eq: ProposalType!, $index_eq: Int!, $limit: Int!, $offset: Int!, $decision_in: [VoteDecision!], $aye_not_eq: BigInt, $nay_not_eq: BigInt, $value_isNull: Boolean, $orderBy: [ConvictionVoteOrderByInput!] = createdAtBlock_DESC) {
			votes: convictionVotes(where: {AND:{balance:{aye_not_eq: $aye_not_eq}, OR:{balance: {nay_not_eq: $nay_not_eq}, OR:{balance:{value_isNull: $value_isNull}}}},  proposal: {index_eq: $index_eq, type_eq: $type_eq}, removedAtBlock_isNull: true, decision_in: $decision_in ${voter ? `, voter_eq: "${voter}"` : ''}}, orderBy: $orderBy, limit: $limit, offset: $offset) {
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
				delegatedVotes {
					voter
					votingPower
					createdAt
					lockPeriod
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
				}
			}    
			yesCount:  convictionVotesConnection(where: {AND:{balance:{aye_not_eq:"0"},OR:{balance:{value_isNull:false}}},proposal: {index_eq: $index_eq, type_eq: $type_eq}, removedAtBlock_isNull: true, decision_in: [yes, abstain], ${voter ? `, voter_eq: "${voter}"` : ''}}, orderBy: id_ASC) {
				totalCount
			}
			 noCount:  convictionVotesConnection(where: {AND:{balance:{nay_not_eq: "0"},OR:{balance:{value_isNull:false}}},proposal: {index_eq: $index_eq, type_eq: $type_eq}, removedAtBlock_isNull: true, decision_in: [no, abstain], ${voter ? `, voter_eq: "${voter}"` : ''}}, orderBy: id_ASC) {
				totalCount
			}
			abstainCount: convictionVotesConnection(where: {proposal: {index_eq: $index_eq, type_eq: $type_eq}, removedAtBlock_isNull: true, decision_eq: abstain, ${voter ? `, voter_eq: "${voter}"` : ''}}, orderBy: id_ASC) {
				totalCount
			}
		}
	`;

	protected static GET_VOTES_LISTING_BY_PROPOSAL_TYPE_AND_HASH_AND_DECISION = ({ voter }: { voter?: string }) => `
		query GetVotesListingByProposalTypeAndHashAndDecision($type_eq: ProposalType!, $hash_eq: String!, $limit: Int!, $offset: Int!, $decision_eq: VoteDecision!) {
			votes(where: {proposal: {hash_eq: $hash_eq, type_eq: $type_eq}, decision_eq: $decision_eq ${voter ? `, voter_eq: "${voter}"` : ''}}, orderBy: id_ASC, limit: $limit, offset: $offset) {
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
			yesCount: votesConnection(where: {proposal: {hash_eq: $hash_eq, type_eq: $type_eq}, decision_eq: yes, ${voter ? `, voter_eq: "${voter}"` : ''}}, orderBy: id_ASC) {
				totalCount
			}
			noCount: votesConnection(where: {proposal: {hash_eq: $hash_eq, type_eq: $type_eq}, decision_eq: no, ${voter ? `, voter_eq: "${voter}"` : ''}}, orderBy: id_ASC) {
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

	protected static GET_ON_CHAIN_METADATA_BY_PROPOSAL_INDEX_AND_TYPE = `
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
				proposalArguments {
					args
					description
					method
					section
				}
				proposer
				trackNumber
				updatedAtBlock
				createdAt
				createdAtBlock
				hash
			}
		}
	`;

	protected static GET_ON_CHAIN_METADATA_BY_PROPOSAL_HASH_AND_TYPE = `
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
				proposalArguments {
					args
					description
					method
					section
				}
				proposer
				trackNumber
				updatedAtBlock
				createdAt
				createdAtBlock
				hash
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

	protected static GET_CHILD_BOUNTIES_REWARDS = `
		query AwardedChildBounties($parentBountyIndex_in: [Int!], $limit: Int) {
			proposals(where: {type_eq: ChildBounty, parentBountyIndex_in: $parentBountyIndex_in}, limit: $limit) {
				reward
				payee
				index
				status
				createdAt
				parentBountyIndex
				statusHistory {
					status
					timestamp
				}
			}
			proposalsConnection(orderBy: id_ASC, where: {type_eq: ChildBounty, parentBountyIndex_in: $parentBountyIndex_in}) {
				totalCount
			}
		}
	`;

	protected static GET_CHILD_BOUNTIES_BY_PARENT_BOUNTY_INDEX = `
		query GetChildBountiesByParentBountyIndex($parentBountyIndex_eq: Int!, $limit:Int!, $offset:Int! ) {
			totalChildBounties: proposalsConnection(orderBy: createdAtBlock_DESC, where: {parentBountyIndex_eq: $parentBountyIndex_eq, type_eq: ChildBounty}) {
				totalCount
			}  
			childBounties: proposals(orderBy: createdAtBlock_DESC, where: {parentBountyIndex_eq: $parentBountyIndex_eq, type_eq: ChildBounty},limit: $limit, offset: $offset) {
				description
				index
				status
				reward
				createdAt
				statusHistory {
					status
					timestamp
					block
				}
				curator
				payee
				proposer
				hash
				origin   
				preimage {
					proposedCall {
						args
					}
				}
			}
		}
	`;

	protected static GET_ACTIVE_BOUNTIES_WITH_REWARDS_BY_INDEX = `
		query RewardsByIndex($type_eq: ProposalType!, $status_not_in: [ProposalStatus!]!, $index_eq: Int, $limit: Int) {
			proposals(where: {type_eq: $type_eq, status_not_in: $status_not_in, index_eq: $index_eq}, limit: $limit) {
				index
				reward
			}
			proposalsConnection(orderBy: id_ASC, where: {type_eq: $type_eq, status_not_in: $status_not_in, index_eq: $index_eq}) {
				totalCount
			}
		}
	`;

	protected static GET_CHILD_BOUNTIES_COUNT_BY_PARENT_BOUNTY_INDICES = `
		query GetChildBountiesCountByParentBountyIndexes($parentBountyIndex_eq: Int!) {
			totalChildBounties: proposalsConnection(orderBy: createdAtBlock_DESC, where: {parentBountyIndex_eq: $parentBountyIndex_eq, type_eq: ChildBounty}) {
				totalCount
			}  
		}
	`;

	protected static GET_CONVICTION_VOTING_DELEGATION_STATS = `
		query GetConvictionVotingDelegationStats {
			totalDelegatedVotes: convictionDelegatedVotesConnection(orderBy: id_ASC, where: {removedAtBlock_isNull: true}) {
				totalCount
			}
			votingDelegations(where: {endedAtBlock_isNull: true, type_eq: OpenGov}) {
				from
				to
				balance
				track
			}
		}
	`;

	protected static GET_LAST_30_DAYS_CONVICTION_VOTE_COUNT_BY_ADDRESS = `
		query GetLast30DaysConvictionVoteCountByAddress($address_eq: String!, $createdAt_gte: DateTime!){
			convictionVotesConnection(orderBy: id_ASC, where: {voter_eq: $address_eq, proposal: {type_eq: ReferendumV2, createdAt_gte: $createdAt_gte}}) {
				totalCount
			}
		}
	`;

	protected static GET_ALL_DELEGATES_CONVICTION_VOTING_POWER_AND_DELEGATIONS_COUNT = `
		query GetAllDelegatesConvictionVotingPowerAndDelegationsCount {
			votingDelegations(where: {endedAtBlock_isNull: true, type_eq:OpenGov}) {
				to
				balance
				lockPeriod
			}
		}
	`;

	protected static GET_DELEGATE_DETAILS = `
		query GetDelegateDetails($address_eq: String!, $createdAt_gte: DateTime!) {
			votingDelegations(where: {endedAtBlock_isNull: true, type_eq:OpenGov, to_eq: $address_eq}) {
				to
				balance
				lockPeriod
			}
			convictionVotesConnection(where: {voter_eq: $address_eq, proposal: {type_eq: ReferendumV2, createdAt_gte: $createdAt_gte}}) {
				totalCount
			}
		}
	`;

	protected static GET_CONVICTION_VOTE_DELEGATIONS_TO_AND_FROM_ADDRESS = `
		query GetConvictionVoteDelegationsToAndFromAddress($address_eq: String!) {
			votingDelegations(where: {endedAtBlock_isNull: true, type_eq: OpenGov, to_eq: $address_eq, OR: {from_eq: $address_eq, endedAtBlock_isNull: true, type_eq: OpenGov}}) {
				to
				from
				track
				balance
				createdAt
				lockPeriod
			}
		}
	`;

	protected static GET_CONVICTION_VOTE_DELEGATIONS_TO_AND_FROM_ADDRESS_AND_TRACK_NUMBER = `
		query GetConvictionVoteDelegationsToAndFromAddressAndTrackNumber($address_eq: String!, $trackNumber_eq: Int!,) {
			votingDelegations(where: {endedAtBlock_isNull: true, type_eq: OpenGov, to_eq: $address_eq, track_eq: $trackNumber_eq, OR: {from_eq: $address_eq, endedAtBlock_isNull: true, type_eq: OpenGov,track_eq: $trackNumber_eq}}) {
				to
				from
				track
				balance
				createdAt
				lockPeriod
			}
		}
	`;

	protected static GET_ACTIVE_PROPOSALS_COUNT_BY_TRACK_IDS = (trackIds: number[]) => {
		const trackQueries = trackIds
			.map(
				(trackId) => `
				track_${trackId}: proposalsConnection(orderBy: id_ASC, where: {status_in: [${ACTIVE_PROPOSAL_STATUSES.join(',')}], trackNumber_eq: ${trackId}}) {
					totalCount
				}
			`
			)
			.join('\n');

		return `
			query GetActiveProposalsCountByTrackIds {
				${trackQueries}
			}
		`;
	};

	protected static GET_ACTIVE_PROPOSAL_LISTINGS_WITH_VOTE_FOR_ADDRESS_BY_TRACK_ID = `
		query GetActiveProposalListingsWithVoteForAddressByTrackId($trackNumber_eq: Int!, $voter_eq: String = "") {
			proposalsConnection(orderBy: id_ASC, where: {trackNumber_eq: $trackNumber_eq, status_in: [${ACTIVE_PROPOSAL_STATUSES.join(',')}], type_eq: ReferendumV2}) {
				edges {
					node {
						createdAt
						description
						index
						origin
						proposer
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
						convictionVoting(where: {voter_eq: $voter_eq, removedAtBlock_isNull: true}) {
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
							createdAt
							decision
							lockPeriod
							totalVotingPower
							selfVotingPower
						}
					}
				}
			}
		}
	`;

	protected static GET_TRACK_ANALYTICS_STATS = `
		query getTrackLevelAnalyticsStats($track_num: Int, $before: DateTime = "2025-02-01T13:21:30.000000Z") {
  diffActiveProposals: proposalsConnection(where: {trackNumber_eq: $track_num, status_not_in: [Cancelled, TimedOut, Confirmed, Approved, Rejected, Executed, Killed, ExecutionFailed], createdAt_gt: $before, type_eq: ReferendumV2}, orderBy: id_ASC) {
    totalCount
  }
  diffProposalCount: proposalsConnection(where: {trackNumber_eq: $track_num, createdAt_gt: $before, type_eq: ReferendumV2}, orderBy: id_ASC) {
    totalCount
  }
  totalActiveProposals: proposalsConnection(where: {trackNumber_eq: $track_num, status_not_in: [Cancelled, TimedOut, Confirmed, Approved, Rejected, Executed, Killed, ExecutionFailed], type_eq: ReferendumV2}, orderBy: id_ASC) {
    totalCount
  }
  totalProposalCount: proposalsConnection(where: {trackNumber_eq: $track_num, type_eq: ReferendumV2}, orderBy: id_ASC) {
    totalCount
  }
}

	`;

	protected static GET_TRACK_ANALYTICS_DELEGATIONS = `
		query DelegationStats($track_num: Int) {
  votingDelegations(where: {endedAtBlock_isNull: true, type_eq: OpenGov, track_eq: $track_num}) {
    from
    to
    balance
    lockPeriod
  }
}

	`;

	protected static GET_POSTS_BY_PROPOSER = `
		 query GetPostsByProposer($proposer_eq: String!, $limit: Int!, $offset: Int!, $type_eq: ProposalType!) {
			proposals(where: {type_eq: $type_eq, proposer_eq: $proposer_eq}, limit: $limit, offset: $offset, orderBy: id_DESC){
				index
			}
			proposalsConnection(where:{proposer_eq:$proposer_eq, type_eq: $type_eq}, orderBy: id_DESC) {
				totalCount
			}
		}
	`;
}
