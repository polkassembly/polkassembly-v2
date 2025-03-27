// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { DEFAULT_LISTING_LIMIT } from '@/_shared/_constants/listingLimit';
import { EDelegateSource, IDelegateDetails } from '@/_shared/types';
import { useCallback, useMemo, useState } from 'react';

type SortOption = 'VOTING_POWER' | 'VOTED_PROPOSALS' | 'RECEIVED_DELEGATIONS';

const useDelegateFiltering = (delegates: IDelegateDetails[]) => {
	const [searchQuery, setSearchQuery] = useState('');
	const [selectedSources, setSelectedSources] = useState<EDelegateSource[]>([]);
	const [sortBy, setSortBy] = useState<SortOption>('VOTING_POWER');
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
			switch (sortBy) {
				case 'VOTING_POWER':
					return Number(BigInt(b.votingPower || '0') - BigInt(a.votingPower || '0'));
				case 'VOTED_PROPOSALS':
					return (b.last30DaysVotedProposalsCount || 0) - (a.last30DaysVotedProposalsCount || 0);
				case 'RECEIVED_DELEGATIONS':
					return (b.receivedDelegationsCount || 0) - (a.receivedDelegationsCount || 0);
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
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [searchQuery, filterBySource, sortDelegates, searchDelegate]);

	const paginatedDelegates = useMemo(() => {
		const start = (currentPage - 1) * itemsPerPage;
		return filteredAndSortedDelegates.slice(start, start + itemsPerPage);
	}, [filteredAndSortedDelegates, currentPage, itemsPerPage]);

	const handlePageChange = useCallback((page: number) => {
		setCurrentPage(page);
	}, []);

	const handleSearchChange = useCallback((value: string) => {
		setSearchQuery(value);
		setCurrentPage(1);
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
		paginatedDelegates,
		totalDelegates: filteredAndSortedDelegates.length,
		searchQuery,
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
