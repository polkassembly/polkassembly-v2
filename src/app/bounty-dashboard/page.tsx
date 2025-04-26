// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { Suspense } from 'react';
import BountyDashboard from './Components';
import { LoadingSpinner } from '../_shared-components/LoadingSpinner';

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
