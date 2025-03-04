// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { ENetwork, EProposalStatus, EProposalType } from '@/_shared/types';
import { DECIDING_PROPOSAL_STATUSES } from '@/_shared/_constants/decidingProposalStatuses';
import BountyDashboard from './Components';

async function page() {
	const network = getCurrentNetwork();
	const { data: bountiesStats } = await NextApiClientService.fetchBountiesStats();
	const { data: tokenPrice } = await NextApiClientService.getTokenPrice(NETWORKS_DETAILS[network as ENetwork].tokenSymbol);
	const { data: hotBounties } = await NextApiClientService.fetchListingData({
		proposalType: EProposalType.BOUNTY,
		page: 1,
		statuses: [EProposalStatus.Active, EProposalStatus.Extended]
	});

	const { data: bountyProposals } = await NextApiClientService.fetchListingData({
		proposalType: EProposalType.REFERENDUM_V2,
		page: 1,
		preimageSection: 'Bounties',
		statuses: DECIDING_PROPOSAL_STATUSES
	});

	const { data: userActivities } = await NextApiClientService.fetchBountiesUserActivity();

	return (
		<div className='grid grid-cols-1 gap-2 p-5 sm:p-10'>
			<BountyDashboard
				tokenPrice={tokenPrice?.price || 0}
				bountiesStats={
					bountiesStats || {
						activeBounties: '0',
						availableBountyPool: 'N/A',
						peopleEarned: 'N/A',
						totalBountyPool: '0',
						totalRewarded: 'N/A'
					}
				}
				hotBounties={hotBounties || { items: [], totalCount: 0 }}
				bountyProposals={bountyProposals || { items: [], totalCount: 0 }}
				userActivities={userActivities || []}
			/>
		</div>
	);
}

export default page;
