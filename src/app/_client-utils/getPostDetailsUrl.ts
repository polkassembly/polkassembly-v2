// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { EProposalType } from '@/_shared/types';

export const getPostDetailsUrl = (proposalType: EProposalType, proposalId: number) => {
	// eslint-disable-next-line sonarjs/no-small-switch
	switch (proposalType) {
		case EProposalType.DISCUSSION:
			return `/post/${proposalId}`;
		default:
			return `/referenda/${proposalId}`;
	}
};
