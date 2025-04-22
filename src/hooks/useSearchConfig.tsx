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
				return `${baseFilter}(NOT post_type:discussions AND NOT post_type:grants)`;
			case ESearchType.DISCUSSIONS:
				return `${baseFilter}(post_type:discussions OR post_type:grants)`;
			default:
				return '';
		}
	}, [activeIndex, networkFilterQuery]);

	const indexName = useMemo(() => {
		if (activeIndex === ESearchType.USERS) return 'polkassembly_users';

		return 'polkassembly_posts';
	}, [activeIndex]);

	return {
		networkFilterQuery,
		postFilterQuery,
		indexName
	};
};
