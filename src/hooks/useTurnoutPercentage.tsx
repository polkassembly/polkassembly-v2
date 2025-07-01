// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useQuery } from '@tanstack/react-query';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { getTrackNameFromId } from '@/_shared/_utils/getTrackNameFromId';
import { BN, BN_ZERO } from '@polkadot/util';
import { ITurnoutPercentageData } from '@/_shared/types';
import { usePolkadotApiService } from './usePolkadotApiService';

interface VoteBalance {
	value?: string;
	aye?: string;
	nay?: string;
	abstain?: string;
}

interface ConvictionVote {
	balance: VoteBalance;
	decision: 'yes' | 'no' | 'abstain' | 'split' | 'splitAbstain';
}

interface Proposal {
	index: number;
	trackNumber?: number;
	convictionVoting: ConvictionVote[];
}

interface TrackData {
	totalSupport: BN;
	count: number;
}

export const useTurnoutPercentage = () => {
	const { apiService } = usePolkadotApiService();
	const network = getCurrentNetwork();

	return useQuery({
		queryKey: ['turnout-percentage', network],
		queryFn: async (): Promise<ITurnoutPercentageData> => {
			// Fetch turnout data from backend
			const { data: turnoutData, error } = await NextApiClientService.getTurnoutData();

			if (error || !turnoutData) {
				throw new Error('Failed to fetch turnout data');
			}

			// Get active issuance from Polkadot API
			if (!apiService) {
				throw new Error('Polkadot API service not available');
			}

			const activeIssuance = await apiService.getTotalActiveIssuance();
			if (!activeIssuance) {
				throw new Error('Failed to get active issuance');
			}

			// Calculate turnout percentages
			const trackSupportPercentages = turnoutData.proposals.reduce((acc: Record<string, TrackData>, proposal: Proposal) => {
				// Handle trackNumber being 0 (ROOT track) - check for null/undefined but allow 0
				if (proposal.trackNumber === null || proposal.trackNumber === undefined || !proposal.convictionVoting?.length) return acc;

				const trackNumber = proposal.trackNumber.toString();

				// Calculate total support for this proposal by summing up all vote balances
				// Support includes 'aye' votes and abstain votes (following V1 logic)
				const proposalSupport = proposal.convictionVoting.reduce((support: BN, vote: ConvictionVote) => {
					let voteBalance = BN_ZERO;

					if (vote.decision === 'yes' || vote.decision === 'abstain') {
						if (vote.balance.value) {
							voteBalance = new BN(vote.balance.value);
						} else if (vote.balance.aye) {
							voteBalance = new BN(vote.balance.aye);
						} else if (vote.balance.abstain) {
							voteBalance = new BN(vote.balance.abstain);
						}
					}

					return support.add(voteBalance);
				}, BN_ZERO);

				if (!acc[trackNumber]) {
					acc[trackNumber] = { totalSupport: BN_ZERO, count: 0 };
				}

				acc[trackNumber].totalSupport = acc[trackNumber].totalSupport.add(proposalSupport);
				acc[trackNumber].count += 1;

				return acc;
			}, {});

			// Calculate average support percentages and convert track numbers to track names
			const averageSupportPercentages = Object.entries(trackSupportPercentages as Record<string, TrackData>).reduce<Record<string, number>>((acc, [trackNumber, data]) => {
				if (data.count > 0) {
					const trackName = getTrackNameFromId({ trackId: parseInt(trackNumber, 10), network });
					if (trackName) {
						// Calculate average support per proposal for this track
						const averageSupport = data.totalSupport.divn(data.count);

						// Calculate turnout percentage with higher precision
						// Multiply by 10000 to get 2 decimal places precision, then divide by 100 at the end
						const turnoutPercentageBN = averageSupport.muln(10000).div(activeIssuance);
						const turnoutPercentage = Number(turnoutPercentageBN.toString()) / 100;

						// Round to exactly 2 decimal places
						acc[trackName] = Math.round(turnoutPercentage * 100) / 100;
					}
				}
				return acc;
			}, {});

			return { averageSupportPercentages };
		},
		enabled: !!apiService,
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 10 * 60 * 1000, // 10 minutes
		retry: 2
	});
};
