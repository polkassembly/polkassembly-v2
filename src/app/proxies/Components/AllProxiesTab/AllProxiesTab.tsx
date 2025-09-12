// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { usePolkadotApiService } from '@/hooks/usePolkadotApiService';
import { IProxyRequest } from '@/_shared/types';
import ProxyListingTable from '../ListingTable/ProxyListingTable';
import SearchBar from '../SearchBar/SearchBar';

export default function AllProxiesTab() {
	const { apiService } = usePolkadotApiService();
	const searchParams = useSearchParams();

	const page = Number(searchParams.get('page')) || 1;
	const search = searchParams.get('allSearch') || '';
	const [proxyData, setProxyData] = useState<IProxyRequest[]>([]);
	const [totalCount, setTotalCount] = useState(0);
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		const fetchProxyData = async () => {
			if (!apiService) return;
			setIsLoading(true);
			try {
				await apiService.apiReady();

				const data = await apiService.getProxyRequests({
					page,
					limit: 10,
					search
				});
				if (data) {
					setProxyData(data.items);
					setTotalCount(data.totalCount);
				}
			} catch (err) {
				console.error('Error fetching proxy data:', err);
			} finally {
				setIsLoading(false);
			}
		};

		fetchProxyData();
	}, [apiService]);

	return (
		<div className='flex flex-col gap-y-4'>
			<SearchBar searchKey='allSearch' />
			<ProxyListingTable
				data={proxyData}
				totalCount={totalCount}
				isLoading={!apiService || isLoading}
			/>
		</div>
	);
}
