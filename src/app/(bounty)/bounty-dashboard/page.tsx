// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { ENetwork, EProposalStatus, EProposalType } from '@/_shared/types';
import BountyHeader from './Components/BountyHeader';
import HotBounties from './Components/HotBounties';

async function page() {
	const network = getCurrentNetwork();
	const { data: bountiesStats } = await NextApiClientService.fetchBountiesStats();
	const { data: tokenPrice } = await NextApiClientService.getTokenPrice(NETWORKS_DETAILS[network as ENetwork].tokenSymbol);
	const { data: hotBounties } = await NextApiClientService.fetchListingData({
		proposalType: EProposalType.BOUNTY,
		page: 1,
		statuses: [EProposalStatus.Active, EProposalStatus.Extended]
	});

	const { data: userActivities } = await NextApiClientService.fetchBountiesUserActivity();

	return (
		<div className='grid grid-cols-1 gap-2 p-5 sm:p-10'>
			<div className='flex items-center justify-between'>
				<span className='font-pixelify text-3xl font-bold text-btn_secondary_text'>Dashboard</span>
				<div className='flex gap-2'>
					{/* <BountyProposalActionButton className='hidden md:block' />
					<CuratorDashboardButton /> */}
				</div>
			</div>
			<BountyHeader
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
			/>
			<HotBounties
				hotBounties={hotBounties || { items: [], totalCount: 0 }}
				userActivities={userActivities || []}
				tokenPrice={tokenPrice?.price || '0'}
			/>
		</div>
	);
}

export default page;
