// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { Suspense } from 'react';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { Metadata } from 'next';
import { OPENGRAPH_METADATA } from '@/_shared/_constants/opengraphMetadata';
import BountyDashboard from './Components';
import { LoadingSpinner } from '../_shared-components/LoadingSpinner';
import { getNetworkFromHeaders } from '../api/_api-utils/getNetworkFromHeaders';

export async function generateMetadata(): Promise<Metadata> {
	const network = await getNetworkFromHeaders();
	const { title, description } = OPENGRAPH_METADATA;
	const image = NETWORKS_DETAILS[`${network}`].openGraphImage?.large;
	const smallImage = NETWORKS_DETAILS[`${network}`].openGraphImage?.small;

	return {
		title: `${title} - Bounty Dashboard`,
		description,
		metadataBase: new URL(`https://${network}.polkassembly.io`),
		icons: [{ url: '/favicon.ico' }],
		openGraph: {
			title: `${title} - Bounty Dashboard`,
			description,
			images: [
				{
					url: image || '',
					width: 600,
					height: 600,
					alt: 'Polkassembly Bounty Dashboard'
				},
				{
					url: smallImage || '',
					width: 1200,
					height: 600,
					alt: 'Polkassembly Bounty Dashboard'
				}
			],
			siteName: 'Polkassembly',
			type: 'website',
			url: `https://${network}.polkassembly.io/bounty-dashboard`
		},
		twitter: {
			card: 'summary_large_image',
			title: `${title} - Bounty Dashboard`,
			description,
			images: image ? [image] : [smallImage || ''],
			site: '@polkassembly'
		}
	};
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
