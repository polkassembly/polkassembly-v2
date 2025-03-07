// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { SORT_OPTIONS } from '@/_shared/_constants/delegateConstant';
import { getSubstrateAddress } from '@/_shared/_utils/getSubstrateAddress';
import { EDelegateSource, IDelegate } from '@/_shared/types';
import { useCallback, useMemo, useState } from 'react';

const useDelegateFiltering = (delegates: IDelegate[]) => {
	const [searchQuery, setSearchQuery] = useState('');
	const [selectedSources, setSelectedSources] = useState<EDelegateSource[]>([]);
	const [sortBy, setSortBy] = useState<keyof typeof SORT_OPTIONS>('votingPower');

	const PRIORITY_ADDRESS = '13mZThJSNdKUyVUjQE9ZCypwJrwdvY8G5cUCpS9Uw4bodh4t';

	const searchDelegate = useCallback((delegate: IDelegate, query: string) => {
		const searchTerms = query.toLowerCase().split(' ').filter(Boolean);
		if (searchTerms.length === 0) return true;

		const searchableText = [delegate.username?.toLowerCase() || '', delegate.address.toLowerCase(), delegate.bio.toLowerCase()].join(' ');

		return searchTerms.every((term) => searchableText.includes(term));
	}, []);

	const filterBySource = useCallback(
		(delegate: IDelegate) => {
			if (selectedSources.length === 0) return true;
			return delegate.dataSource.some((source) => selectedSources.includes(source));
		},
		[selectedSources]
	);

	const sortDelegates = useCallback(
		(a: IDelegate, b: IDelegate) => {
			const aIsPriority = getSubstrateAddress(a.address) === getSubstrateAddress(PRIORITY_ADDRESS);
			const bIsPriority = getSubstrateAddress(b.address) === getSubstrateAddress(PRIORITY_ADDRESS);

			if (aIsPriority) return -1;
			if (bIsPriority) return 1;

			switch (sortBy) {
				case 'votingPower':
					return parseFloat(b.delegatedBalance) - parseFloat(a.delegatedBalance);
				case 'votedProposals':
					return (b.votedProposalCount?.convictionVotesConnection?.totalCount || 0) - (a.votedProposalCount?.convictionVotesConnection?.totalCount || 0);
				case 'receivedDelegations':
					return (b.receivedDelegationsCount || 0) - (a.receivedDelegationsCount || 0);
				default:
					return 0;
			}
		},
		[sortBy]
	);

	const filteredAndSortedDelegates = useMemo(() => {
		const priorityDelegate = delegates.find((d) => getSubstrateAddress(d.address) === getSubstrateAddress(PRIORITY_ADDRESS));

		const filtered = delegates
			.filter((delegate) => searchDelegate(delegate, searchQuery))
			.filter(filterBySource)
			.sort(sortDelegates);

		if (priorityDelegate && searchDelegate(priorityDelegate, searchQuery) && filterBySource(priorityDelegate)) {
			const withoutPriority = filtered.filter((d) => getSubstrateAddress(d.address) !== getSubstrateAddress(PRIORITY_ADDRESS));
			return [priorityDelegate, ...withoutPriority];
		}

		return filtered;
	}, [delegates, searchQuery, filterBySource, sortDelegates, searchDelegate]);

	return {
		filteredAndSortedDelegates,
		searchQuery,
		handleSearchChange: useCallback((value: string) => setSearchQuery(value), []),
		selectedSources,
		setSelectedSources,
		sortBy,
		setSortBy
	};
};

export default useDelegateFiltering;
