// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ACTIVE_PROPOSAL_STATUSES } from '../_constants/activeProposalStatuses';
import { EProposalStatus } from '../types';

export const canVote = (status?: EProposalStatus) => {
	return !!(status && ACTIVE_PROPOSAL_STATUSES.includes(status));
};
