// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useMemo } from 'react';
import { ESearchType } from '@/_shared/types';

export const useSearchConfig = ({ network, activeIndex }: { network: string; activeIndex: ESearchType | null }) => {
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
				filters.push('proposalType:ReferendumV2');
				break;
			case ESearchType.DISCUSSIONS:
				filters.push('(proposalType:DISCUSSION OR proposalType:GRANTS)');
				break;
			default:
				break;
		}

		return filters.join(' AND ');
	}, [activeIndex, networkFilterQuery]);

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
