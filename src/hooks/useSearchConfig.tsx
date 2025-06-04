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

		const baseFilter = networkFilterQuery ? ' AND ' : '';

		switch (activeIndex) {
			case ESearchType.POSTS:
				return `${baseFilter}(NOT proposalType:DISCUSSION AND NOT proposalType:GRANTS)`;
			case ESearchType.DISCUSSIONS:
				return `${baseFilter}(proposalType:DISCUSSION OR proposalType:GRANTS)`;
			default:
				return '';
		}
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
