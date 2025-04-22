// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { DEFAULT_LISTING_LIMIT } from '@/_shared/_constants/listingLimit';
import { EDelegateSource, IDelegateDetails } from '@/_shared/types';
import { useCallback, useMemo, useState } from 'react';
import { useDebounce } from './useDebounce';

type SortOption = 'VOTING_POWER' | 'VOTED_PROPOSALS' | 'RECEIVED_DELEGATIONS';

const useDelegateFiltering = (delegates: IDelegateDetails[]) => {
	const { debouncedValue: searchQuery, setValue: setSearchQuery, value: searchQueryValue } = useDebounce('');
	const [selectedSources, setSelectedSources] = useState<EDelegateSource[]>(Object.values(EDelegateSource));
	const [sortBy, setSortBy] = useState<SortOption | null>(null);
	const [currentPage, setCurrentPage] = useState(1);
	const itemsPerPage = DEFAULT_LISTING_LIMIT;

	const searchDelegate = useCallback((delegate: IDelegateDetails, query: string) => {
		if (!query || query.trim() === '') return true;

		const searchTerm = query.toLowerCase().trim();
		return delegate.address.toLowerCase().includes(searchTerm) || (delegate.name && delegate.name.toLowerCase().includes(searchTerm));
	}, []);

	const filterBySource = useCallback(
		(delegate: IDelegateDetails) => {
			if (selectedSources.length === 0) return true;
			return selectedSources.some((source) => delegate.sources.includes(source));
		},
		[selectedSources]
	);

	const sortDelegates = useCallback(
		(a: IDelegateDetails, b: IDelegateDetails) => {
			if (!sortBy) return 0;
			switch (sortBy) {
				case 'VOTING_POWER':
					return Number(BigInt(b.votingPower || '0') - BigInt(a.votingPower || '0'));
				case 'VOTED_PROPOSALS':
					return b.last30DaysVotedProposalsCount - a.last30DaysVotedProposalsCount;
				case 'RECEIVED_DELEGATIONS':
					return b.receivedDelegationsCount - a.receivedDelegationsCount;
				default:
					return 0;
			}
		},
		[sortBy]
	);

	const filteredAndSortedDelegates = useMemo(() => {
		const searchFiltered = delegates.filter((delegate) => searchDelegate(delegate, searchQuery));
		const sourceFiltered = searchFiltered.filter(filterBySource);
		return sourceFiltered.sort(sortDelegates);
	}, [searchQuery, filterBySource, sortDelegates, searchDelegate, delegates]);

	const filteredDelegates = useMemo(() => {
		const start = (currentPage - 1) * itemsPerPage;
		return filteredAndSortedDelegates.slice(start, start + itemsPerPage);
	}, [filteredAndSortedDelegates, currentPage, itemsPerPage]);

	const handlePageChange = useCallback((page: number) => {
		setCurrentPage(page);
	}, []);

	const handleSearchChange = useCallback((value: string) => {
		setSearchQuery(value);
		setCurrentPage(1);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const handleSourceChange = useCallback((sources: EDelegateSource[]) => {
		setSelectedSources(sources);
		setCurrentPage(1);
	}, []);

	const handleSortChange = useCallback((value: SortOption) => {
		setSortBy(value);
		setCurrentPage(1);
	}, []);

	return {
		filteredDelegates,
		totalDelegates: filteredAndSortedDelegates.length,
		searchQuery: searchQueryValue,
		handleSearchChange,
		selectedSources,
		handleSourceChange,
		sortBy,
		handleSortChange,
		currentPage,
		handlePageChange,
		itemsPerPage
	};
};

export default useDelegateFiltering;
