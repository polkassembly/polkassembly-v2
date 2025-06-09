// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { EProposalStatus } from '@shared/types';

export const ACTIVE_BOUNTY_STATUSES = [
	EProposalStatus.DecisionDepositPlaced,
	EProposalStatus.Submitted,
	EProposalStatus.Deciding,
	EProposalStatus.ConfirmStarted,
	EProposalStatus.ConfirmAborted,
	EProposalStatus.Active,
	EProposalStatus.Added,
	EProposalStatus.Approved,
	EProposalStatus.Active,
	EProposalStatus.CuratorUnassigned,
	EProposalStatus.CuratorAssigned,
	EProposalStatus.CuratorProposed,
	EProposalStatus.Proposed,
	EProposalStatus.Extended,
	EProposalStatus.Awarded
];
