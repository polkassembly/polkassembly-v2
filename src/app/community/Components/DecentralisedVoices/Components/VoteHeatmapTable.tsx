// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useTranslations } from 'next-intl';
import { Check, X, Minus } from 'lucide-react';
import { IDVDelegateVotingMatrix, EDVDelegateType } from '@/_shared/types';
import Address from '@/app/_shared-components/Profile/Address/Address';

interface VoteHeatmapTableProps {
	votingMatrix: IDVDelegateVotingMatrix[];
	referendumIndices: number[];
	activeTab: EDVDelegateType;
}

const getVoteColor = (vote: string) => {
	switch (vote) {
		case 'aye':
			return 'bg-success_vote_bg text-aye_color';
		case 'nay':
			return 'bg-failure_vote_bg text-nay_color';
		case 'abstain':
			return 'bg-activity_selected_tab text-abstain_color';
		default:
			return 'bg-activity_selected_tab text-text_primary';
	}
};

const getVoteIcon = (vote: string) => {
	switch (vote) {
		case 'aye':
			return <Check size={12} />;
		case 'nay':
			return <X size={12} />;
		case 'abstain':
			return <Minus size={12} />;
		default:
			return <div className='h-1 w-1 rounded-full bg-voting_bar_bg' />;
	}
};

function VoteHeatmapTable({ votingMatrix, referendumIndices, activeTab }: VoteHeatmapTableProps) {
	const t = useTranslations('DecentralizedVoices');

	return (
		<div className='hide_scrollbar block w-full overflow-x-auto'>
			<table className='w-full table-auto border-collapse'>
				<thead>
					<tr className='border-b border-border_grey text-left text-xs font-semibold text-text_primary'>
						<th className='sticky left-0 z-10 w-64 bg-bg_modal py-4 pl-4 uppercase'>{activeTab === EDVDelegateType.DAO ? t('DAO') : t('Guardian').toUpperCase()}</th>{' '}
						{referendumIndices.map((ref) => (
							<th
								key={ref}
								className='px-2 py-4 text-center text-text_primary'
							>
								#{ref}
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{votingMatrix.map((item) => (
						<tr
							key={item.address}
							className='border-b border-border_grey hover:bg-bg_modal/70'
						>
							<td className='sticky left-0 z-10 bg-bg_modal px-4 py-4'>
								<div className='flex max-w-28 flex-col md:max-w-full'>
									<Address address={item.address} />
									<span className='text-xs text-text_primary'>{item.participation.toFixed(1)}% active</span>
								</div>
							</td>
							{referendumIndices.map((ref) => {
								const vote = item.votes[ref] || '';
								return (
									<td
										key={ref}
										className='p-2 text-center'
									>
										<div className={`mx-auto flex h-8 w-8 items-center justify-center rounded ${getVoteColor(vote)}`}>{getVoteIcon(vote)}</div>
									</td>
								);
							})}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}

export default VoteHeatmapTable;
