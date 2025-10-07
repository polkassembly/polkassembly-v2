// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useUser } from '@/hooks/useUser';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { IProxyRequest } from '@/_shared/types';
import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { usePolkadotApiService } from '@/hooks/usePolkadotApiService';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import SearchBar from '../SearchBar/SearchBar';
import ProxyListingTable from '../ListingTable/ProxyListingTable';

function MyProxiesTab() {
	const { user } = useUser();
	const t = useTranslations('Proxies');
	const searchParams = useSearchParams();
	const page = parseInt(searchParams?.get('page') || '1', 10);
	const myProxiesSearch = searchParams?.get('myProxiesSearch') || '';
	const { apiService } = usePolkadotApiService();

	const userAddress = useMemo(() => user?.defaultAddress || user?.addresses?.[0] || '', [user]);

	const { data, isLoading } = useQuery<{ items: IProxyRequest[]; totalCount: number }>({
		queryKey: ['proxies', 'my', userAddress, page, 10, myProxiesSearch || ''],
		enabled: !!apiService && !!userAddress,
		queryFn: async () =>
			apiService!.getMyProxies({
				page,
				limit: 10,
				userAddress,
				search: myProxiesSearch || undefined
			}),
		placeholderData: keepPreviousData,
		staleTime: 30_000
	});

	const filtered = useMemo(
		() => (myProxiesSearch && data?.items ? data.items.filter((item) => item.delegator.toLowerCase().includes(myProxiesSearch.toLowerCase())) : data?.items) || [],
		[data?.items, myProxiesSearch]
	);

	// Show loading state while API service is initializing or data is loading
	const isInitializing = !apiService || isLoading;

	// Show not authenticated message
	if (!user?.addresses?.length) {
		return (
			<div className='flex items-center justify-center py-12'>
				<div className='text-center'>
					<p className='text-text_secondary mb-4'>
						{t('please')}{' '}
						<Link
							href='/login'
							className='text-bg_pink'
						>
							{t('logIn')}
						</Link>{' '}
						{t('toViewMyProxies')}
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className='flex flex-col gap-y-4'>
			<SearchBar searchKey='myProxiesSearch' />
			<ProxyListingTable
				data={filtered}
				totalCount={myProxiesSearch ? filtered.length : data?.totalCount || 0}
				isLoading={isInitializing}
			/>
		</div>
	);
}

export default MyProxiesTab;
