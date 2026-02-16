// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Metadata } from 'next';
import { OPENGRAPH_METADATA } from '@/_shared/_constants/opengraphMetadata';
import { getNetworkFromHeaders } from '@/app/api/_api-utils/getNetworkFromHeaders';
import { getGeneratedContentMetadata } from '@/_shared/_utils/generateContentMetadata';
import { ECommunityRole } from '@/_shared/types';
import Community from './Components/Community';

export async function generateMetadata(): Promise<Metadata> {
	const network = await getNetworkFromHeaders();
	const { title } = OPENGRAPH_METADATA;

	return getGeneratedContentMetadata({
		title: `${title} - People`,
		description: 'Explore all members contributing to the Polkadot ecosystem.',
		network,
		url: `https://${network}.polkassembly.io/people`,
		imageAlt: 'Polkassembly People'
	});
}

async function CommunityPage({ searchParams }: { searchParams: Promise<{ tab?: ECommunityRole; page?: string }> }) {
	const searchParamsValue = await searchParams;
	const activeTab = searchParamsValue?.tab || ECommunityRole.DVS;

	return <Community activeTab={activeTab} />;
}

export default CommunityPage;
