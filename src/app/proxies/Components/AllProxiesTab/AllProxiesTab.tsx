// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { usePolkadotApiService } from '@/hooks/usePolkadotApiService';
import ProxyListingTable from '../ListingTable/ProxyListingTable';
import SearchBar from '../SearchBar/SearchBar';

export default function AllProxiesTab() {
	const { apiService } = usePolkadotApiService();
	const searchParams = useSearchParams();

	const page = Number(searchParams.get('page')) || 1;
	const search = searchParams.get('allSearch') || '';

	const { data, isLoading } = useQuery({
		queryKey: ['proxyRequests', page, search],
		queryFn: async () => {
			if (!apiService) throw new Error('API service not available');
			return apiService.getProxyRequests({
				page,
				limit: 10,
				search
			});
		},
		enabled: !!apiService,
		staleTime: 30000, // 30 seconds
		gcTime: 300000 // 5 minutes
	});

	return (
		<div className='flex flex-col gap-y-4'>
			<SearchBar searchKey='allSearch' />
			<ProxyListingTable
				data={data?.items ?? []}
				totalCount={data?.totalCount ?? 0}
				isLoading={isLoading}
			/>
		</div>
	);
}
