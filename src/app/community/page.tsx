// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';
import Header from '@/app/community/Components/Header/Header';
import { Metadata } from 'next';
import { OPENGRAPH_METADATA } from '@/_shared/_constants/opengraphMetadata';
import { getNetworkFromHeaders } from '@/app/api/_api-utils/getNetworkFromHeaders';
import { getGeneratedContentMetadata } from '@/_shared/_utils/generateContentMetadata';
import { DEFAULT_LISTING_LIMIT } from '@/_shared/_constants/listingLimit';
import { Tabs, TabsContent } from '@ui/Tabs';
import { ECommunityRole } from '@/_shared/types';
import CommunityMembers from './Components/Members/Members';

export async function generateMetadata(): Promise<Metadata> {
	const network = await getNetworkFromHeaders();
	const { title } = OPENGRAPH_METADATA;

	return getGeneratedContentMetadata({
		title: `${title} - Community`,
		description: 'Explore all members contributing to the Polkadot ecosystem.',
		network,
		url: `https://${network}.polkassembly.io/community`,
		imageAlt: 'Polkassembly Community'
	});
}

async function Community({ searchParams }: { searchParams: Promise<{ tab?: ECommunityRole; page?: string }> }) {
	// Default to members tab
	const searchParamsValue = await searchParams;
	const activeTab = searchParamsValue?.tab || ECommunityRole.MEMBERS;
	const page = parseInt(searchParamsValue?.page || '1', DEFAULT_LISTING_LIMIT);

	// Todo: fetch allTab counts in single server call and pass to header
	const allTabCounts: Record<ECommunityRole, number> = { members: 0, delegates: 0, curators: 0, experts: 0 };

	return (
		<div className='w-full'>
			<Tabs defaultValue={activeTab}>
				<Header
					activeTab={activeTab}
					tabCounts={allTabCounts}
				/>
				<div className='mx-auto grid w-full max-w-7xl grid-cols-1 gap-5 px-4 py-5 lg:px-16'>
					<TabsContent value={ECommunityRole.MEMBERS}>
						<CommunityMembers page={page} />
					</TabsContent>
					<TabsContent value={ECommunityRole.DELEGATES}>Delegates Page</TabsContent>
					<TabsContent value={ECommunityRole.CURATORS}>Curators Page</TabsContent>
					<TabsContent value={ECommunityRole.EXPERTS}>Experts Page</TabsContent>
				</div>
			</Tabs>
		</div>
	);
}

export default Community;
