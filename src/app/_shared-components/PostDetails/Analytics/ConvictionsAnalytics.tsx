// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { EAnalyticsType, EProposalType, IAnalytics } from '@/_shared/types';
import TotalVotesCard from './TotalVotesCard';
import DelegatedVsSoloCard from './DelegatedVsSoloCard';
import TurnoutOrSupportCard from './TurnoutOrSupportCard';
import TimeSplitCard from './TimeSplitCard';
import VotesByConviction from './VotesByConviction';
import DelegationVotesByConviction from './DelegationVotesByConviction';
import { Separator } from '../../Separator';
import VotesBubbleChart from '../VotesBubbleChart/VotesBubbleChart';

function ConvictionsAnalytics({ convictionsAnalytics, proposalType, index }: { convictionsAnalytics: IAnalytics; proposalType: EProposalType; index: string }) {
	return (
		<div className='flex flex-col gap-4'>
			<div className='flex gap-4 max-lg:flex-col'>
				<TotalVotesCard analytics={convictionsAnalytics} />
				<DelegatedVsSoloCard
					delegatedValue={convictionsAnalytics.delegated}
					soloValue={convictionsAnalytics.solo}
				/>
				<TurnoutOrSupportCard support={convictionsAnalytics.support} />
			</div>
			<div className='flex w-full flex-col gap-4'>
				<TimeSplitCard timeSplitVotes={convictionsAnalytics?.timeSplitVotes || []} />
				<VotesBubbleChart
					proposalType={proposalType}
					analyticsType={EAnalyticsType.CONVICTIONS}
					index={index}
					enableTitle
					enableFilter
				/>
			</div>
			<Separator className='dashed my-4' />
			<div className='flex gap-4 max-lg:flex-col'>
				<VotesByConviction votesByConviction={convictionsAnalytics?.votesByConviction || []} />
				<DelegationVotesByConviction delegationVotesByConviction={convictionsAnalytics?.delegationVotesByConviction || []} />
			</div>
		</div>
	);
}

export default ConvictionsAnalytics;
