// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { DEFAULT_LISTING_LIMIT } from '@/_shared/_constants/listingLimit';
import { EDelegateSource, IDelegateDetails } from '@/_shared/types';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDebounce } from './useDebounce';
import { useIdentityService } from './useIdentityService';

type SortOption = 'MAX_DELEGATED' | 'VOTED_PROPOSALS' | 'DELEGATORS';

const useDelegateFiltering = (delegates: IDelegateDetails[]) => {
	const { debouncedValue: searchQuery, setValue: setSearchQuery, value: searchQueryValue } = useDebounce('');
	const [selectedSources, setSelectedSources] = useState<EDelegateSource[]>(Object.values(EDelegateSource));
	const [sortBy, setSortBy] = useState<SortOption | null>(null);
	const [currentPage, setCurrentPage] = useState(1);
	const itemsPerPage = DEFAULT_LISTING_LIMIT;
	const [delegatesWithIdentity, setDelegatesWithIdentity] = useState<Map<string, string | undefined>>(new Map());
	const { identityService } = useIdentityService();

	useEffect(() => {
		if (!delegates?.length || !identityService) return () => {};
		let isActive = true;

		(async () => {
			try {
				const results = await Promise.all(
					delegates.map(async (delegate) => {
						try {
							const identity = await identityService.getOnChainIdentity(delegate.address);
							return identity?.display ? ([delegate.address, identity.display] as const) : null;
						} catch (e) {
							console.error('Error fetching identity for delegate:', delegate.address, e);
							return null;
						}
					})
				);
				if (!isActive) return;
				const identityMap = new Map<string, string>();
				results.forEach((entry) => {
					if (entry) identityMap.set(entry[0], entry[1]);
				});
				setDelegatesWithIdentity(identityMap);
			} catch (e) {
				console.error('Error fetching identities batch:', e);
			}
		})();

		return () => {
			isActive = false;
		};
	}, [delegates, identityService]);

	const searchDelegate = useCallback(
		(delegate: IDelegateDetails, query: string) => {
			if (!query || query.trim() === '') return true;

			const searchTerm = query.toLowerCase().trim();
			const identityName = delegatesWithIdentity.get(delegate.address);

			return (
				delegate.address.toLowerCase().includes(searchTerm) ||
				(delegate.name && delegate.name.toLowerCase().includes(searchTerm)) ||
				(delegate.publicUser?.username && delegate.publicUser.username.toLowerCase().includes(searchTerm)) ||
				(identityName && identityName.toLowerCase().includes(searchTerm))
			);
		},
		[delegatesWithIdentity]
	);
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
				case 'MAX_DELEGATED':
					return Number(BigInt(b.maxDelegated || '0') - BigInt(a.maxDelegated || '0'));
				case 'VOTED_PROPOSALS':
					return b.last30DaysVotedProposalsCount - a.last30DaysVotedProposalsCount;
				case 'DELEGATORS':
					return b.delegators.length - a.delegators.length;
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
