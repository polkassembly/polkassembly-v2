// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { IBountyStats, IBountyUserActivity, IGenericListingResponse, IPostListing } from '@/_shared/types';
import BountiesUserActivity from './BountiesUserActivity';
import BountyHeader from './BountyHeader';
import BountyProposal from './BountyProposal';
import HotBounties from './HotBounties';

function BountyDashboard({
	tokenPrice,
	bountiesStats,
	hotBounties,
	bountyProposals,
	userActivities
}: {
	tokenPrice: number;
	bountiesStats: IBountyStats;
	hotBounties: IGenericListingResponse<IPostListing>;
	bountyProposals: IGenericListingResponse<IPostListing>;
	userActivities: IBountyUserActivity[];
}) {
	return (
		<div>
			<div className='flex items-center justify-between'>
				<span className='font-pixelify text-3xl font-bold text-btn_secondary_text'>Dashboard</span>
				<div className='flex gap-2'>
					{/* <BountyProposalActionButton className='hidden md:block' />
					<CuratorDashboardButton /> */}
				</div>
			</div>
			<BountyHeader
				tokenPrice={tokenPrice}
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
				tokenPrice={tokenPrice}
			/>
			<BountyProposal
				bountyProposals={bountyProposals || { items: [], totalCount: 0 }}
				tokenPrice={tokenPrice}
			/>
			<BountiesUserActivity
				userActivities={userActivities || []}
				tokenPrice={tokenPrice}
			/>
		</div>
	);
}

export default BountyDashboard;
