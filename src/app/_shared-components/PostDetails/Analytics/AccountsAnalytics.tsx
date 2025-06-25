// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { IAccountAnalytics } from '@/_shared/types';
import TotalVotesCard from './TotalVotesCard';
import DelegatedVsSoloCard from './DelegatedVsSoloCard';
import TurnoutOrSupportCard from './TurnoutOrSupportCard';
import TimeSplitCard from './TimeSplitCard';
import VotesByConvictions from './VotesByConviction';
import DelegationVotesByConvictions from './DelegationVotesByConviction';
import { Separator } from '../../Separator';

function AccountsAnalytics({ accountsAnalytics }: { accountsAnalytics: IAccountAnalytics }) {
	return (
		<div className='flex flex-col gap-4'>
			<div className='flex gap-4'>
				<TotalVotesCard
					analytics={accountsAnalytics}
					isAccountsAnalytics
				/>
				<DelegatedVsSoloCard
					delegatedValue={accountsAnalytics.delegated}
					soloValue={accountsAnalytics.solo}
					isAccountsAnalytics
				/>
				<TurnoutOrSupportCard support={accountsAnalytics.support} />
			</div>
			<div className='w-full'>
				<TimeSplitCard
					timeSplitVotes={accountsAnalytics?.timeSplitVotes || []}
					isAccountsAnalytics
				/>
			</div>
			<Separator className='dashed my-4' />
			<div className='flex gap-4'>
				<VotesByConvictions
					votesByConviction={accountsAnalytics?.votesByConviction || []}
					isAccountsAnalytics
				/>
				<DelegationVotesByConvictions
					delegationVotesByConviction={accountsAnalytics?.delegationVotesByConviction || []}
					isAccountsAnalytics
				/>
			</div>
		</div>
	);
}

export default AccountsAnalytics;
