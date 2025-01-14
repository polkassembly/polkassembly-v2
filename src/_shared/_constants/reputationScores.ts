// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { EActivityName } from '../types';

// Refers to https://docs.google.com/spreadsheets/d/1Yqqjsg9d1VYl4Da8Hz8hYX24cKgAlqfa_dPnT7C6AcU

export const REPUTATION_SCORES = {
	[EActivityName.REACTED_TO_POST]: {
		value: 0.25
	},
	[EActivityName.REACTED_TO_COMMENT]: {
		value: 0.25
	},
	[EActivityName.COMMENTED_ON_POST]: {
		value: 1
	},
	[EActivityName.REPLIED_TO_COMMENT]: {
		value: 0.5
	},
	[EActivityName.VOTE_PASSED]: {
		value: 1
	},
	[EActivityName.VOTE_FAILED]: {
		value: -2
	},
	[EActivityName.CREATED_OFFCHAIN_POST]: {
		value: 1
	},
	[EActivityName.CREATED_PROPOSAL]: {
		value: 5
	},
	[EActivityName.ADDED_CONTEXT_TO_PROPOSAL]: {
		value: 0.5
	},
	[EActivityName.TOOK_QUIZ]: {
		value: 1
	},
	[EActivityName.QUIZ_ANSWERED_CORRECTLY]: {
		value: 1
	},
	[EActivityName.CREATED_TIP]: {
		value: 2
	},
	[EActivityName.VOTED_ON_PROPOSAL]: {
		value: 2
	},
	[EActivityName.CREATED_BOUNTY]: {
		value: 5
	},
	[EActivityName.APPROVED_BOUNTY]: {
		value: 1
	},
	[EActivityName.CREATED_CHILD_BOUNTY]: {
		value: 3
	},
	[EActivityName.CLAIMED_BOUNTY]: {
		value: 0.5
	},
	[EActivityName.ADDED_PROFILE_PICTURE]: {
		value: 0.5
	},
	[EActivityName.ADDED_BIO]: {
		value: 0.5
	},
	[EActivityName.LINKED_MULTIPLE_ADDRESSES]: {
		value: 0.5
	},
	[EActivityName.ADDED_PROFILE_TITLE]: {
		value: 0.5
	},
	[EActivityName.ADDED_PROFILE_TAGS]: {
		value: 0.5
	},
	[EActivityName.COMMENT_TAKEN_DOWN]: {
		first: -10,
		second: -20,
		third_or_more: -30
	},
	[EActivityName.RECEIVED_REPORT]: {
		value: -10
	},
	[EActivityName.POST_TAKEN_DOWN]: {
		first: -25,
		second: -50,
		third_or_more: -100
	},
	[EActivityName.POST_MARKED_AS_SPAM]: {
		first: -25,
		second: -50,
		third_or_more: -100
	},
	[EActivityName.SIGNED_UP_FOR_IDENTITY_VERIFICATION]: {
		value: 2
	},
	[EActivityName.COMPLETED_IDENTITY_JUDGEMENT]: {
		value: 3
	},
	[EActivityName.RECEIVED_SPAM_REPORT]: {
		first: -5,
		second: -10,
		third_or_more: -20
	},
	[EActivityName.DELEGATED_VOTE]: {
		first: 5
	},
	[EActivityName.RECEIVED_DELEGATION]: {
		value: 1
	},
	[EActivityName.LOST_DUE_TO_SLASHING_TIP_OR_PROPOSAL]: {
		first: -20,
		second: -40,
		third_or_more: -50
	},
	[EActivityName.GAVE_TIP]: {
		first: 5,
		second: 2,
		third_or_more: 1
	},
	[EActivityName.PLACED_DECISION_DEPOSIT]: {
		first: 5,
		second: 2,
		third_or_more: 1
	},
	[EActivityName.RECEIVED_LIKE_ON_DISCUSSION]: {
		first_five: 0.1,
		sixth_to_tenth: 0.5,
		more_than_ten: 1
	},
	[EActivityName.RECEIVED_LIKE_ON_COMMENT]: {
		first_five: 0.1,
		sixth_to_tenth: 0.5,
		more_than_ten: 1
	},
	[EActivityName.REMOVED_VOTE_AFTER_SIX_HOURS_OF_FIRST_VOTE]: {
		first_three: -10,
		fourth_to_tenth: -15,
		more_than_ten: -30
	},
	[EActivityName.REDUCED_CONVICTION_AFTER_SIX_HOURS_OF_FIRST_VOTE]: {
		first_three: -10,
		fourth_to_tenth: -15,
		more_than_ten: -30
	},
	[EActivityName.PROPOSAL_FAILED]: {
		first: -10,
		second: -20,
		third_or_more: -50
	},
	[EActivityName.PROPOSAL_PASSED]: {
		first: 10,
		second: 20,
		third_or_more: 50
	}
} as const;
