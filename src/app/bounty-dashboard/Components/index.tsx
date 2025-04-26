// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { IBountyStats } from '@/_shared/types';
import BountiesUserActivity from './BountiesUserActivity';
import BountyStats from './BountyStats';
import HotBounties from './HotBounties';
import DashboardHeader from './DashboardHeader';

function BountyDashboard({ tokenPrice, bountiesStats, totalBountyPool }: { tokenPrice?: number; bountiesStats?: IBountyStats | null; totalBountyPool?: string }) {
	return (
		<div>
			<DashboardHeader />
			{bountiesStats && (
				<BountyStats
					tokenPrice={tokenPrice ?? 0}
					bountiesStats={bountiesStats}
					totalBountyPool={totalBountyPool}
				/>
			)}
			<HotBounties tokenPrice={tokenPrice ?? 0} />
			<BountiesUserActivity tokenPrice={tokenPrice ?? 0} />
		</div>
	);
}

export default BountyDashboard;
