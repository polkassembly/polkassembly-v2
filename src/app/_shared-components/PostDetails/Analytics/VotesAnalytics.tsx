// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { EAnalyticsType, EProposalType, IAnalytics } from '@/_shared/types';
import TotalVotesCard from './TotalVotesCard';
import DelegatedVsSoloCard from './DelegatedVsSoloCard';
import TurnoutOrSupportCard from './TurnoutOrSupportCard';
import TimeSplitCard from './TimeSplitCard';
import VotesByConvictions from './VotesByConviction';
import DelegationVotesByConvictions from './DelegationVotesByConviction';
import { Separator } from '../../Separator';
import VotesDistributionTiles from '../VotesDistributionTiles/VotesDistributionTiles';

function VotesAnalytics({ votesAnalytics, index, proposalType }: { votesAnalytics: IAnalytics; index: string; proposalType: EProposalType }) {
	return (
		<div className='flex flex-col gap-4'>
			<div className='flex gap-4'>
				<TotalVotesCard analytics={votesAnalytics} />
				<DelegatedVsSoloCard
					delegatedValue={votesAnalytics.delegated}
					soloValue={votesAnalytics.solo}
				/>
				<TurnoutOrSupportCard support={votesAnalytics.support} />
			</div>
			<div className='flex w-full flex-col gap-4'>
				<TimeSplitCard timeSplitVotes={votesAnalytics?.timeSplitVotes || []} />
				<VotesDistributionTiles
					proposalType={proposalType}
					analyticsType={EAnalyticsType.VOTES}
					usedInPostAnalytics
					index={index}
				/>
			</div>
			<Separator className='dashed my-4' />
			<div className='flex gap-4'>
				<VotesByConvictions votesByConviction={votesAnalytics?.votesByConviction || []} />
				<DelegationVotesByConvictions delegationVotesByConviction={votesAnalytics?.delegationVotesByConviction || []} />
			</div>
		</div>
	);
}

export default VotesAnalytics;
