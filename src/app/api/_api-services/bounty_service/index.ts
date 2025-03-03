// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { BN } from '@polkadot/util';
import { ENetwork, IBountyStats } from '@shared/types';
import { SubsquidService } from '../onchain_db_service/subsquid_service';

export class BountyService {
	static async getBountyStats(network: ENetwork): Promise<IBountyStats> {
		const activeBountiesResponse = await SubsquidService.getActiveBountiesWithRewards(network);

		if (!activeBountiesResponse?.data?.proposals?.length) {
			return {
				activeBounties: '0',
				availableBountyPool: 'N/A',
				peopleEarned: 'N/A',
				totalBountyPool: '0',
				totalRewarded: 'N/A'
			};
		}

		const activeBounties = String(activeBountiesResponse.data.proposals.length);
		let totalBountyPool = activeBountiesResponse.data.proposals.reduce((total: BN, { reward }: { reward: string }) => total.add(new BN(reward)), new BN(0));

		const activeBountyIndices = activeBountiesResponse.data.proposals.map(({ index }: { index: string }) => parseInt(index, 10));

		const childBountiesResponse = await SubsquidService.getChildBountiesRewards(network, activeBountyIndices);

		if (!childBountiesResponse?.data?.proposals?.length) {
			return {
				activeBounties,
				availableBountyPool: 'N/A',
				peopleEarned: 'N/A',
				totalBountyPool: totalBountyPool.toString(),
				totalRewarded: 'N/A'
			};
		}

		totalBountyPool = childBountiesResponse.data.proposals.reduce((total: BN, { reward }: { reward: string }) => total.add(new BN(reward)), new BN(0));

		const awardedChildBounties = childBountiesResponse.data.proposals.filter((bounty) => bounty.statusHistory?.some((item) => item?.status === 'Awarded'));

		const totalRewarded = awardedChildBounties.reduce((total: BN, { reward }: { reward: string }) => total.add(new BN(reward)), new BN(0));

		return {
			activeBounties,
			availableBountyPool: totalBountyPool.toString(),
			peopleEarned: String(childBountiesResponse.data.proposals.length),
			totalBountyPool: totalBountyPool.toString(),
			totalRewarded: totalRewarded.toString()
		};
	}
}
