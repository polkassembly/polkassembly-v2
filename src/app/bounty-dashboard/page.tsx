// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { EProposalStatus, EProposalType } from '@/_shared/types';
import BountyDashboard from './Components';

async function BountyDashboardPage() {
	const { data: bountiesStats } = await NextApiClientService.fetchBountiesStats();
	const to = new Date();
	const from = new Date();
	from.setHours(to.getHours() - 2);
	const { data: treasuryStats } = await NextApiClientService.getTreasuryStats({ from, to });
	const tokenPrice = treasuryStats?.[0]?.nativeTokenUsdPrice;

	const { data: hotBounties } = await NextApiClientService.fetchListingData({
		proposalType: EProposalType.BOUNTY,
		page: 1,
		statuses: [EProposalStatus.Active, EProposalStatus.Extended]
	});

	const { data: userActivities } = await NextApiClientService.fetchBountiesUserActivity();

	return (
		<div className='grid grid-cols-1 gap-2 p-5 sm:p-10'>
			<BountyDashboard
				tokenPrice={Number(tokenPrice)}
				bountiesStats={bountiesStats}
				hotBounties={hotBounties}
				userActivities={userActivities}
			/>
		</div>
	);
}

export default BountyDashboardPage;
