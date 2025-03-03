// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { BN } from '@polkadot/util';
import { ENetwork, IBountyStats, IBountyUserActivity } from '@shared/types';
import { SubsquidService } from '../onchain_db_service/subsquid_service';

interface IProposal {
	index: string;
	reward: string;
	statusHistory?: Array<{ status: string }>;
}

interface IClaimedBountyProposal {
	payee: string;
	reward: string;
	statusHistory: Array<{ timestamp: string }>;
}

export class BountyService {
	static async getBountyStats(network: ENetwork): Promise<IBountyStats> {
		const activeBountiesResponse = await SubsquidService.getActiveBountiesWithRewards(network);
		const defaultStats: IBountyStats = {
			activeBounties: '0',
			availableBountyPool: 'N/A',
			peopleEarned: 'N/A',
			totalBountyPool: '0',
			totalRewarded: 'N/A'
		};

		if (!activeBountiesResponse?.data?.proposals?.length) {
			return defaultStats;
		}

		const activeBounties = String(activeBountiesResponse.data.proposals.length);
		let totalBountyPool = activeBountiesResponse.data.proposals.reduce((total: BN, { reward }: IProposal) => total.add(new BN(reward)), new BN(0));

		const activeBountyIndices = activeBountiesResponse.data.proposals.map(({ index }: IProposal) => parseInt(index, 10));

		const childBountiesResponse = await SubsquidService.getChildBountiesRewards(network, activeBountyIndices);

		if (!childBountiesResponse?.data?.proposals?.length) {
			return {
				...defaultStats,
				activeBounties,
				totalBountyPool: totalBountyPool.toString()
			};
		}

		totalBountyPool = childBountiesResponse.data.proposals.reduce((total: BN, { reward }: IProposal) => total.add(new BN(reward)), new BN(0));

		const awardedChildBounties = childBountiesResponse.data.proposals.filter((bounty: IProposal) => bounty.statusHistory?.some((item) => item?.status === 'Awarded'));

		const totalRewarded = awardedChildBounties.reduce((total: BN, { reward }: IProposal) => total.add(new BN(reward)), new BN(0));

		return {
			activeBounties,
			availableBountyPool: totalBountyPool.toString(),
			peopleEarned: String(childBountiesResponse.data.proposals.length),
			totalBountyPool: totalBountyPool.toString(),
			totalRewarded: totalRewarded.toString()
		};
	}

	static async getBountyUserActivity(network: ENetwork): Promise<IBountyUserActivity[]> {
		const activeBountiesResponse = await SubsquidService.getActiveBountiesWithRewards(network);

		if (!activeBountiesResponse?.data?.proposals?.length) {
			return [];
		}

		const activeBountyIndices = activeBountiesResponse.data.proposals.map(({ index }: IProposal) => parseInt(index, 10));

		const claimedChildBounties = await SubsquidService.getClaimedChildBountiesPayeesAndRewardForParentBountyIndices(network, activeBountyIndices);

		if (!claimedChildBounties?.data?.proposals?.length) {
			return [];
		}

		return claimedChildBounties.data.proposals.map((proposal) => ({
			activity: 'claimed',
			address: (proposal as unknown as IClaimedBountyProposal).payee,
			amount: (proposal as unknown as IClaimedBountyProposal).reward,
			created_at: new Date((proposal as unknown as IClaimedBountyProposal).statusHistory[0].timestamp)
		}));
	}
}
