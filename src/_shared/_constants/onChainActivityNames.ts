// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { EActivityName } from '../types';

export const ON_CHAIN_ACTIVITY_NAMES = [
	EActivityName.VOTED_ON_PROPOSAL,
	EActivityName.CREATED_PROPOSAL,
	EActivityName.CREATED_TIP,
	EActivityName.GAVE_TIP,
	EActivityName.CREATED_BOUNTY,
	EActivityName.CREATED_CHILD_BOUNTY,
	EActivityName.CLAIMED_BOUNTY,
	EActivityName.VERIFIED_IDENTITY,
	EActivityName.COMPLETED_IDENTITY_JUDGEMENT,
	EActivityName.DELEGATED_VOTE,
	EActivityName.RECEIVED_DELEGATION,
	EActivityName.PLACED_DECISION_DEPOSIT,
	EActivityName.REMOVED_VOTE
];
