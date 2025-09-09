// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';
import Header from '@/app/proxies/Components/Header/Header';
import { Metadata } from 'next';
import { OPENGRAPH_METADATA } from '@/_shared/_constants/opengraphMetadata';
import { getNetworkFromHeaders } from '@/app/api/_api-utils/getNetworkFromHeaders';
import { getGeneratedContentMetadata } from '@/_shared/_utils/generateContentMetadata';
import { Tabs, TabsContent } from '@ui/Tabs';
import { EProxyDashboardTabs } from '@/_shared/types';
import { PolkadotApiService } from '../_client-services/polkadot_api_service';
import ProxyListingTable from './Components/ListingTable/ProxyListingTable';
import SearchBar from './Components/SearchBar/SearchBar';
import MyProxiesTab from './Components/MyProxiesTab/MyProxiesTab';

export async function generateMetadata(): Promise<Metadata> {
	const network = await getNetworkFromHeaders();
	const { title } = OPENGRAPH_METADATA;

	return getGeneratedContentMetadata({
		title: `${title} - Proxy Explorer`,
		description: 'Explore Polkassembly Proxies',
		network,
		url: `https://${network}.polkassembly.io/proxies`,
		imageAlt: 'Polkassembly Proxy Explorer'
	});
}

async function Proxies({ searchParams }: { readonly searchParams: Promise<{ page?: string; allSearch?: string; myProxiesSearch?: string }> }) {
	const searchParamsValue = await searchParams;
	const page = parseInt(searchParamsValue.page || '1', 10);
	const allSearch = searchParamsValue.allSearch || '';
	// Fetch all proxies directly from Polkadot API (no Next API route)
	const network = await getNetworkFromHeaders();
	const apiService = await PolkadotApiService.Init(network);
	const allProxiesResponse = await apiService.getProxyRequests({ page: Number(page), limit: 10, search: allSearch });

	return (
		<div className='w-full'>
			<Tabs defaultValue={EProxyDashboardTabs.ALL}>
				<Header data={{ allProxiesCount: allProxiesResponse.totalCount }} />
				<div className='mx-auto grid w-full max-w-7xl grid-cols-1 gap-5 px-4 py-5 lg:px-16'>
					<TabsContent value={EProxyDashboardTabs.ALL}>
						<div className='flex flex-col gap-y-4'>
							<SearchBar searchKey='allSearch' />
							<ProxyListingTable
								data={allProxiesResponse.items}
								totalCount={allProxiesResponse.totalCount}
							/>
						</div>
					</TabsContent>
					<TabsContent value={EProxyDashboardTabs.MY_PROXIES}>
						<MyProxiesTab />
					</TabsContent>
				</div>
			</Tabs>
		</div>
	);
}

export default Proxies;
