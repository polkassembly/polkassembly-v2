// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useMemo } from 'react';
import { allowedNetwork } from '@/_shared/_constants/searchConstants';
import { ESearchType } from '@/_shared/types';

export const useSearchConfig = (isSuperSearch: boolean, network: string, activeIndex: ESearchType | null) => {
	const networkFilter = useMemo(() => {
		if (activeIndex === ESearchType.USERS) return '';

		return isSuperSearch ? allowedNetwork.map((Network) => `network:${Network}`).join(' OR ') : `network:${network}`;
	}, [isSuperSearch, network, activeIndex]);

	const getPostTypeFilter = useMemo(() => {
		if (activeIndex === ESearchType.USERS) return '';

		const baseFilter = networkFilter ? ' AND ' : '';

		switch (activeIndex) {
			case ESearchType.POSTS:
				return `${baseFilter}(NOT post_type:discussions AND NOT post_type:grants)`;
			case ESearchType.DISCUSSIONS:
				return `${baseFilter}(post_type:discussions OR post_type:grants)`;
			default:
				return '';
		}
	}, [activeIndex, networkFilter]);

	return {
		networkFilter,
		getPostTypeFilter,
		indexName: activeIndex === ESearchType.USERS ? 'polkassembly_users' : 'polkassembly_posts'
	};
};
