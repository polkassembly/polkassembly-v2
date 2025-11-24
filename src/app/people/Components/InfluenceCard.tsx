// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Activity, Filter, Menu, Check, X, Minus } from 'lucide-react';
import { PaginationWithLinks } from '@/app/_shared-components/PaginationWithLinks';
import VotingBar from '@/app/_shared-components/ListingComponent/VotingBar/VotingBar';
import { getSpanStyle } from '@/app/_shared-components/TopicTag/TopicTag';
import { convertCamelCaseToTitleCase } from '@/_shared/_utils/convertCamelCaseToTitleCase';
import StatusTag from '@/app/_shared-components/StatusTag/StatusTag';
import { EProposalStatus } from '@/_shared/types';

const referendaData = [
	{
		id: 45,
		title: 'Standard Guidelines Standard Guidelines ....',
		track: 'Medium Spender',
		status: EProposalStatus.Rejected,
		influence: 'rejected'
	},
	{
		id: 46,
		title: 'Accessibility Standards Ensuring all users ...',
		track: 'Small Spenders',
		status: EProposalStatus.Active,
		influence: 'approved'
	},
	{
		id: 47,
		title: 'Responsive Design Adapting layouts for var..',
		track: 'Big Spender',
		status: EProposalStatus.Approved,
		influence: 'abstain'
	},
	{
		id: 48,
		title: 'Color Contrast Guidelines Improving read..',
		track: 'Medium Spender',
		status: EProposalStatus.Deciding,
		influence: 'approved'
	},
	{
		id: 49,
		title: 'Typography Standards Establishing font ..',
		track: 'Small Spenders',
		status: EProposalStatus.Executed,
		influence: 'abstain'
	},
	{
		id: 50,
		title: 'Component Library Creating reusable design..',
		track: 'Big Spender',
		status: EProposalStatus.DecisionDepositPlaced,
		influence: 'rejected'
	},
	{
		id: 51,
		title: 'User Feedback Integration Incorporating us..',
		track: 'Small Spender',
		status: EProposalStatus.ConfirmStarted,
		influence: 'rejected'
	},
	{
		id: 52,
		title: 'Prototyping Best Practices Streamlining the..',
		track: 'Big Spenders',
		status: EProposalStatus.Closed,
		influence: 'approved'
	}
];

function InfluenceCard() {
	return (
		<div className='rounded-xxl my-4 w-full rounded-3xl border border-border_grey bg-bg_modal p-6 shadow-md'>
			<div className='mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center'>
				<div className='flex items-center gap-2'>
					<Activity className='text-decision_bar_indicator' />
					<h2 className='text-2xl font-semibold text-navbar_title'>Influence by Referenda</h2>
					<span className='ml-2 rounded-lg bg-bounty_dash_bg p-2 text-xs font-medium text-wallet_btn_text'>Outcome changed 1 (1.54%) | Total 65</span>
				</div>
				<div className='flex gap-2'>
					<button
						type='button'
						className='rounded-md border border-border_grey p-2'
					>
						<Filter className='h-4 w-4 text-wallet_btn_text' />
					</button>
					<button
						type='button'
						className='rounded-md border border-border_grey p-2'
					>
						<Menu className='h-4 w-4 text-wallet_btn_text' />
					</button>
				</div>
			</div>

			<div className='overflow-x-auto'>
				<table className='w-full min-w-[800px] table-auto'>
					<thead>
						<tr className='border-b border-t border-border_grey bg-bounty_table_bg pt-3 text-left text-xs font-semibold uppercase text-text_primary'>
							<th className='py-4 pl-4'>REFERENDUM</th>
							<th className='py-4'>TRACK</th>
							<th className='py-4'>STATUS</th>
							<th className='py-4'>VOTING BAR</th>
							<th className='py-4'>INFLUENCE</th>
							<th className='py-4' />
						</tr>
					</thead>
					<tbody>
						{referendaData.map((item) => (
							<tr
								key={item.id}
								className='cursor-pointer border-b border-border_grey text-sm font-semibold hover:border-border_grey/90'
							>
								<td className='py-4 pl-4 font-medium text-text_primary'>
									#{item.id} {item.title}
								</td>
								<td className='py-4'>
									<span className={`${getSpanStyle(item.track || '', 1)} rounded-md px-1.5 py-1 text-xs`}>{convertCamelCaseToTitleCase(item.track || '')}</span>
								</td>
								<td className='py-4'>
									<div className='flex'>
										<StatusTag status={item.status} />{' '}
									</div>
								</td>
								<td className='py-4'>
									<VotingBar
										ayePercent={10}
										nayPercent={90}
									/>
								</td>
								<td className='py-4'>
									<div className='flex items-center gap-2'>
										<div
											className={`flex h-5 w-5 items-center justify-center rounded-sm ${
												item.influence === 'rejected'
													? 'bg-toast_error_bg text-toast_error_text'
													: item.influence === 'approved'
														? 'bg-success_vote_bg text-success'
														: 'bg-toast_info_bg text-toast_info_text'
											}`}
										>
											{item.influence === 'rejected' ? <X size={12} /> : item.influence === 'approved' ? <Check size={12} /> : <Minus size={12} />}
										</div>
									</div>
								</td>
								<td className='py-4 pr-4 text-right'>
									<Menu className='h-4 w-4 text-wallet_btn_text' />
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			<div className='mt-6 flex justify-center gap-2'>
				<PaginationWithLinks
					totalCount={30}
					pageSize={4}
					page={1}
				/>
			</div>
		</div>
	);
}

export default InfluenceCard;
