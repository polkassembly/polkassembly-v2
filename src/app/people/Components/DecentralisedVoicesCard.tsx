// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useState } from 'react';
import { Activity, HelpCircle, Filter, Ban } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuCheckboxItem, DropdownMenuSeparator } from '@/app/_shared-components/DropdownMenu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/app/_shared-components/Tooltip';
import { AiFillLike } from '@react-icons/all-files/ai/AiFillLike';
import { AiFillDislike } from '@react-icons/all-files/ai/AiFillDislike';
import Address from '@/app/_shared-components/Profile/Address/Address';

const voicesData = [
	{ id: 1, name: 'Noob', address: '1z...ho', votes: 1, aye: 11, nay: 23, abstain: 78, participation: 87.5, winRate: 85.3, voted: 22, total: 55, won: 22, participated: 55 },
	{ id: 2, name: 'Pro', address: '3a...jklYq', votes: 2, aye: 12, nay: 24, abstain: 79, participation: 90.0, winRate: 90.0, voted: 22, total: 55, won: 22, participated: 55 },
	{ id: 3, name: 'Expert', address: '5b...Zr', votes: 3, aye: 13, nay: 25, abstain: 80, participation: 85.3, winRate: 85.3, voted: 22, total: 55, won: 22, participated: 55 },
	{ id: 4, name: 'Master', address: '2c...ts', votes: 4, aye: 14, nay: 26, abstain: 81, participation: 92.7, winRate: 92.7, voted: 22, total: 55, won: 22, participated: 55 },
	{ id: 5, name: 'Veteran', address: '9...vu', votes: 5, aye: 15, nay: 27, abstain: 82, participation: 88.1, winRate: 88.1, voted: 22, total: 55, won: 22, participated: 55 },
	{ id: 6, name: 'Champion', address: '1...x', votes: 6, aye: 16, nay: 28, abstain: 83, participation: 91.5, winRate: 91.5, voted: 22, total: 55, won: 22, participated: 55 }
];

function DecentralisedVoicesCard() {
	const [activeTab, setActiveTab] = useState<'DAO' | 'GUARDIAN'>('DAO');
	const [sortOptions, setSortOptions] = useState({
		newestToOldest: false,
		participationHighToLow: false,
		votesCastedHighToLow: true
	});

	return (
		<div className='rounded-xxl my-4 w-full rounded-3xl border border-border_grey bg-bg_modal p-6 shadow-md'>
			<div className='mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center'>
				<div className='flex flex-col gap-4 md:flex-row md:items-center'>
					<div className='flex items-center gap-2'>
						<Activity className='text-decision_bar_indicator' />
						<h2 className='text-2xl font-semibold text-navbar_title'>Decentralised Voices</h2>
					</div>
					<div className='flex rounded-lg bg-sidebar_footer p-1'>
						<button
							type='button'
							onClick={() => setActiveTab('DAO')}
							className={`rounded px-3 py-0.5 text-sm text-navbar_title transition-colors ${activeTab === 'DAO' && 'bg-section_dark_overlay font-semibold'}`}
						>
							DAO (7)
						</button>
						<button
							type='button'
							onClick={() => setActiveTab('GUARDIAN')}
							className={`py-0.6 rounded px-3 text-sm font-medium text-navbar_title transition-colors ${activeTab === 'GUARDIAN' && 'bg-section_dark_overlay font-semibold'}`}
						>
							GUARDIAN (5)
						</button>
					</div>
				</div>
				<div className='flex gap-2'>
					<DropdownMenu>
						<DropdownMenuTrigger className='flex items-center gap-2 rounded-md border border-border_grey p-2'>
							<Filter className='h-4 w-4 text-wallet_btn_text' />
						</DropdownMenuTrigger>
						<DropdownMenuContent
							align='end'
							className='w-64'
						>
							<div className='flex items-center justify-between px-2 py-2'>
								<span className='text-sm font-semibold text-wallet_btn_text'>Sort By</span>
								<button
									type='button'
									className='text-xs font-medium text-text_pink'
								>
									Reset
								</button>
							</div>
							<DropdownMenuSeparator />
							<DropdownMenuCheckboxItem
								checked={sortOptions.newestToOldest}
								onCheckedChange={(checked) => setSortOptions((prev) => ({ ...prev, newestToOldest: !!checked }))}
							>
								Newest to Oldest
							</DropdownMenuCheckboxItem>
							<DropdownMenuCheckboxItem
								checked={sortOptions.participationHighToLow}
								onCheckedChange={(checked) => setSortOptions((prev) => ({ ...prev, participationHighToLow: !!checked }))}
							>
								Participation % (High to Low)
							</DropdownMenuCheckboxItem>
							<DropdownMenuCheckboxItem
								checked={sortOptions.votesCastedHighToLow}
								onCheckedChange={(checked) => setSortOptions((prev) => ({ ...prev, votesCastedHighToLow: !!checked }))}
							>
								Votes Casted (High to Low)
							</DropdownMenuCheckboxItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>

			<div className='overflow-x-auto'>
				<table className='w-full min-w-[800px] table-auto'>
					<thead>
						<tr className='border-b border-t border-border_grey bg-bounty_table_bg pt-3 text-left text-xs font-semibold uppercase text-text_primary'>
							<th className='py-4 pl-4'>NAME</th>
							<th className='py-4'>VOTES CASTED</th>
							<th className='py-4'>VOTE COUNT</th>
							<th className='py-4'>
								<div className='flex items-center gap-1'>
									PARTICIPATION
									<TooltipProvider>
										<Tooltip>
											<TooltipTrigger>
												<HelpCircle
													size={14}
													className='ml-1 text-text_primary'
												/>
											</TooltipTrigger>
											<TooltipContent className='bg-tooltip_background p-2 text-btn_primary_text'>
												<p>Duration of the cohort</p>
											</TooltipContent>
										</Tooltip>
									</TooltipProvider>
								</div>
							</th>
							<th className='py-4'>WIN RATE</th>
						</tr>
					</thead>
					<tbody>
						{voicesData.map((item) => (
							<tr
								key={item.id}
								className='cursor-pointer border-b border-border_grey text-sm font-semibold hover:border-border_grey/90'
							>
								<td className='py-4 pl-4'>
									<div className='flex items-center gap-2'>
										<Address address={item.address} />
									</div>
								</td>
								<td className='text-bodyBlue dark:text-blue-dark-high py-4 font-medium'>{item.votes}</td>
								<td className='py-4'>
									<div className='flex items-center gap-4'>
										<div className='flex items-center gap-1 text-success'>
											<AiFillLike className='fill-current text-sm' />
											<span className='font-medium'>{item.aye}</span>
										</div>
										<div className='flex items-center gap-1 text-toast_error_text'>
											<AiFillDislike className='fill-current text-sm' />
											<span className='font-medium'>{item.nay}</span>
										</div>
										<div className='flex items-center gap-1 text-bg_blue'>
											<Ban size={14} />
											<span className='font-medium'>{item.abstain}</span>
										</div>
									</div>
								</td>
								<td className='py-4'>
									<TooltipProvider>
										<Tooltip>
											<TooltipTrigger className='text-bodyBlue dark:text-blue-dark-high cursor-help font-medium'>{item.participation} %</TooltipTrigger>
											<TooltipContent className='bg-gray-800 text-white'>
												<p>
													Voted/Total: {item.voted}/{item.total}
												</p>
											</TooltipContent>
										</Tooltip>
									</TooltipProvider>
								</td>
								<td className='py-4'>
									<TooltipProvider>
										<Tooltip>
											<TooltipTrigger className='cursor-help font-medium text-green-500'>{item.winRate} %</TooltipTrigger>
											<TooltipContent className='bg-gray-800 text-white'>
												<p>
													Won/Participated: {item.won}/{item.participated}
												</p>
											</TooltipContent>
										</Tooltip>
									</TooltipProvider>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}

export default DecentralisedVoicesCard;
