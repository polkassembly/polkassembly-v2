// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useMemo } from 'react';
import { ESearchProposalType, ESearchType } from '@/_shared/types';

export const useSearchConfig = ({
	network,
	activeIndex,
	proposalTypeFilter = ESearchProposalType.REFERENDA
}: {
	network: string;
	activeIndex: ESearchType | null;
	proposalTypeFilter?: ESearchProposalType;
}) => {
	const networkFilterQuery = useMemo(() => {
		if (!activeIndex || activeIndex === ESearchType.USERS) return '';

		return `network:${network}`;
	}, [network, activeIndex]);

	const postFilterQuery = useMemo(() => {
		if (!activeIndex || activeIndex === ESearchType.USERS) return '';

		const filters: string[] = [];

		if (networkFilterQuery) {
			filters.push(networkFilterQuery);
		}

		switch (activeIndex) {
			case ESearchType.POSTS:
				if (proposalTypeFilter === ESearchProposalType.REFERENDA) {
					filters.push('proposalType:ReferendumV2');
				} else if (proposalTypeFilter === ESearchProposalType.BOUNTIES) {
					filters.push('(proposalType:Bounty OR proposalType:ChildBounty)');
				} else if (proposalTypeFilter === ESearchProposalType.OTHER) {
					filters.push('(NOT proposalType:DISCUSSION AND NOT proposalType:GRANTS AND NOT proposalType:ReferendumV2 AND NOT proposalType:Bounty AND NOT proposalType:ChildBounty)');
				}
				break;
			case ESearchType.DISCUSSIONS:
				filters.push('(proposalType:DISCUSSION OR proposalType:GRANTS)');
				break;
			default:
				break;
		}

		return filters.join(' AND ');
	}, [activeIndex, networkFilterQuery, proposalTypeFilter]);

	const indexName = useMemo(() => {
		if (activeIndex === ESearchType.USERS) return 'polkassembly_v2_users';

		return 'polkassembly_v2_posts';
	}, [activeIndex]);

	return {
		networkFilterQuery,
		postFilterQuery,
		indexName
	};
};
