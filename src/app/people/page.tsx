// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import Header from '@/app/people/Components/Header/Header';
import { Metadata } from 'next';
import { OPENGRAPH_METADATA } from '@/_shared/_constants/opengraphMetadata';
import { getNetworkFromHeaders } from '@/app/api/_api-utils/getNetworkFromHeaders';
import { getGeneratedContentMetadata } from '@/_shared/_utils/generateContentMetadata';
import { Tabs, TabsContent } from '@ui/Tabs';
import { ECommunityRole } from '@/_shared/types';
import CommunityDelegates from './Components/Delegates/Delegates';

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
	const searchParamsValue = await searchParams;
	const activeTab = searchParamsValue?.tab || ECommunityRole.DELEGATES;
	const page = parseInt(searchParamsValue?.page || '1', 10);

	return (
		<div className='w-full'>
			<Tabs defaultValue={activeTab}>
				<Header activeTab={activeTab} />
				<div className='mx-auto grid w-full max-w-7xl grid-cols-1 gap-5 px-4 py-5 lg:px-16'>
					<TabsContent value={activeTab}>
						<CommunityDelegates page={page} />
					</TabsContent>
				</div>
			</Tabs>
		</div>
	);
}

export default Community;
