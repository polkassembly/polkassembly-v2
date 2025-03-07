// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { EDelegateSource } from '@/_shared/types';

export const SOURCE_OPTIONS = [
	{ label: 'Polkassembly', value: EDelegateSource.POLKASSEMBLY },
	{ label: 'Parity', value: EDelegateSource.PARITY },
	{ label: 'Nova', value: EDelegateSource.NOVA },
	{ label: 'W3F', value: EDelegateSource.W3F },
	{ label: 'Individual', value: EDelegateSource.NA }
] as const;

export const SORT_OPTIONS = {
	votingPower: 'Voting Power',
	votedProposals: 'Voted Proposals',
	receivedDelegations: 'Received Delegations'
} as const;
