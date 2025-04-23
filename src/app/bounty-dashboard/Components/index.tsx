// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { IBountyStats, IBountyUserActivity, IGenericListingResponse, IPostListing } from '@/_shared/types';
import BountiesUserActivity from './BountiesUserActivity';
import BountyHeader from './BountyHeader';
import HotBounties from './HotBounties';

function BountyDashboard({
	tokenPrice,
	bountiesStats,
	hotBounties,
	userActivities
}: {
	tokenPrice?: number;
	bountiesStats?: IBountyStats | null;
	hotBounties?: IGenericListingResponse<IPostListing> | null;
	userActivities?: IBountyUserActivity[] | null;
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
			{bountiesStats && (
				<BountyHeader
					tokenPrice={tokenPrice ?? 0}
					bountiesStats={bountiesStats}
				/>
			)}
			{hotBounties && (
				<HotBounties
					hotBounties={hotBounties}
					tokenPrice={tokenPrice ?? 0}
				/>
			)}
			{userActivities && Array.isArray(userActivities) && userActivities.length > 0 && (
				<BountiesUserActivity
					userActivities={userActivities}
					tokenPrice={tokenPrice ?? 0}
				/>
			)}
		</div>
	);
}

export default BountyDashboard;
