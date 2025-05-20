// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { Suspense } from 'react';
import { Metadata } from 'next';
import { OPENGRAPH_METADATA } from '@/_shared/_constants/opengraphMetadata';
import { getGeneratedContentMetadata } from '@/_shared/_utils/generateContentMetadata';
import { LoadingSpinner } from '../_shared-components/LoadingSpinner';
import BountyDashboard from './Components';
import { getNetworkFromHeaders } from '../api/_api-utils/getNetworkFromHeaders';

export async function generateMetadata(): Promise<Metadata> {
	const network = await getNetworkFromHeaders();
	const { title } = OPENGRAPH_METADATA;

	return getGeneratedContentMetadata({
		title: `${title} - Bounty Dashboard`,
		description: 'Explore all Bounty Proposals on Polkassembly',
		network,
		url: `https://${network}.polkassembly.io/bounty-dashboard`,
		imageAlt: 'Polkassembly Bounty Dashboard'
	});
}

async function BountyDashboardPage() {
	const { data: bountiesStats } = await NextApiClientService.fetchBountiesStats();
	const to = new Date();
	const from = new Date();
	from.setHours(to.getHours() - 2);
	const { data: treasuryStats } = await NextApiClientService.getTreasuryStats({ from, to });
	const tokenPrice = treasuryStats?.[0]?.nativeTokenUsdPrice;

	return (
		<div className='mx-auto grid max-w-7xl grid-cols-1 gap-2 px-4 py-5 lg:px-16'>
			<Suspense fallback={<LoadingSpinner />}>
				<BountyDashboard
					tokenPrice={Number(tokenPrice)}
					bountiesStats={bountiesStats}
					totalBountyPool={treasuryStats?.[0]?.bounties?.dot}
				/>
			</Suspense>
		</div>
	);
}

export default BountyDashboardPage;
