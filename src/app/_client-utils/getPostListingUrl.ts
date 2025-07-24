// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { EPostOrigin, EProposalType } from '@/_shared/types';

interface PostDetailsParams {
	proposalType: EProposalType;
	origin?: EPostOrigin;
}

export const getPostListingUrl = ({ proposalType, origin }: PostDetailsParams) => {
	if (origin) {
		return `/${origin?.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()}`;
	}
	// eslint-disable-next-line sonarjs/no-small-switch
	switch (proposalType) {
		case EProposalType.DISCUSSION:
			return '/discussions';
		case EProposalType.BOUNTY:
			return '/bounties';
		case EProposalType.CHILD_BOUNTY:
			return '/child-bounties';
		default:
			return `/${proposalType?.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()}s`;
	}
};
