// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import { useProxyData } from '@/hooks/useProxyData';
import { SortDirection } from '@tanstack/react-table';
import ProxyListingTable from '../ListingTable/ProxyListingTable';
import SearchBar from '../SearchBar/SearchBar';

export default function AllProxiesTab() {
	const searchParams = useSearchParams();
	const page = Number(searchParams.get('page')) || 1;
	const search = searchParams.get('allSearch') || '';
	const sortBy = searchParams.get('sortBy') || undefined;
	const sortDirection = (searchParams.get('sortDirection') as SortDirection) || null;
	const typesParam = searchParams.get('types');
	const filterTypes = typesParam ? typesParam.split(',') : [];

	const { items, totalCount, isLoading, error } = useProxyData({ page, search, sortBy, sortDirection, filterTypes });

	return (
		<div className='flex flex-col gap-y-4'>
			<SearchBar searchKey='allSearch' />
			<ProxyListingTable
				data={error ? [] : items}
				totalCount={error ? 0 : totalCount}
				isLoading={isLoading}
			/>
		</div>
	);
}
