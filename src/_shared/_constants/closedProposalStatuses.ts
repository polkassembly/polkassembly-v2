// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { EProposalStatus } from '@shared/types';

export const CLOSED_PROPOSAL_STATUSES = [
	EProposalStatus.Cancelled,
	EProposalStatus.TimedOut,
	EProposalStatus.Confirmed,
	EProposalStatus.Approved,
	EProposalStatus.Rejected,
	EProposalStatus.Executed,
	EProposalStatus.Killed,
	EProposalStatus.ExecutionFailed
];
