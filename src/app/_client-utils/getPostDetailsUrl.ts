// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { EProposalType } from '@/_shared/types';

interface PostDetailsParams {
	proposalType: EProposalType;
	proposalId: number;
	network: string;
}

export const getPostDetailsUrl = ({ proposalType, proposalId, network }: PostDetailsParams) => {
	// eslint-disable-next-line sonarjs/no-small-switch
	switch (proposalType) {
		case EProposalType.DEMOCRACY_PROPOSAL:
			return `https://${network}-old.polkassembly.io/proposal/${proposalId}`;
		case EProposalType.REFERENDUM:
			return `https://${network}-old.polkassembly.io/referendum/${proposalId}`;
		case EProposalType.TREASURY_PROPOSAL:
			return `https://${network}-old.polkassembly.io/treasury/${proposalId}`;
		case EProposalType.TIP:
			return `https://${network}-old.polkassembly.io/tip/${proposalId}`;
		case EProposalType.COUNCIL_MOTION:
			return `https://${network}-old.polkassembly.io/motion/${proposalId}`;
		case EProposalType.TECH_COMMITTEE_PROPOSAL:
			return `https://${network}-old.polkassembly.io/tech/${proposalId}`;
		case EProposalType.DISCUSSION:
			return `/post/${proposalId}`;
		case EProposalType.BOUNTY:
			return `/bounty/${proposalId}`;
		case EProposalType.CHILD_BOUNTY:
			return `/child-bounty/${proposalId}`;
		default:
			return `/referenda/${proposalId}`;
	}
};
