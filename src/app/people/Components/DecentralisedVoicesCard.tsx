// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useState } from 'react';
import { Activity, HelpCircle, Filter, Ban, Check } from 'lucide-react';
import { AiFillLike } from '@react-icons/all-files/ai/AiFillLike';
import { AiFillDislike } from '@react-icons/all-files/ai/AiFillDislike';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem, DropdownMenuSeparator } from '@/app/_shared-components/DropdownMenu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/app/_shared-components/Tooltip';
import Address from '@/app/_shared-components/Profile/Address/Address';
import { IDVDelegateWithStats, IDVCohort, EDVDelegateType } from '@/_shared/types';
import { Skeleton } from '@/app/_shared-components/Skeleton';

interface DecentralisedVoicesCardProps {
	delegatesWithStats: IDVDelegateWithStats[];
	cohort: IDVCohort | null;
	loading?: boolean;
}

function DecentralisedVoicesCard({ delegatesWithStats, cohort, loading }: DecentralisedVoicesCardProps) {
	const [activeTab, setActiveTab] = useState<'DAO' | 'GUARDIAN'>('DAO');
	const [sortOptions, setSortOptions] = useState({
		newestToOldest: false,
		participationHighToLow: false,
		votesCastedHighToLow: true
	});

	const daos = delegatesWithStats.filter((d) => d.type === EDVDelegateType.DAO);
	const guardians = delegatesWithStats.filter((d) => d.type === EDVDelegateType.GUARDIAN);
	const filteredDelegates = activeTab === 'DAO' ? daos : guardians;

	const sortedDelegates = [...filteredDelegates].sort((a, b) => {
		if (sortOptions.participationHighToLow) {
			return b.voteStats.participation - a.voteStats.participation;
		}
		if (sortOptions.votesCastedHighToLow) {
			const aTotal = a.voteStats.ayeCount + a.voteStats.nayCount + a.voteStats.abstainCount;
			const bTotal = b.voteStats.ayeCount + b.voteStats.nayCount + b.voteStats.abstainCount;
			return bTotal - aTotal;
		}
		return 0;
	});
	const sortItems = [
		{ key: 'newestToOldest', label: 'Newest to Oldest' },
		{ key: 'participationHighToLow', label: 'Participation % (High to Low)' },
		{ key: 'votesCastedHighToLow', label: 'Votes Casted (High to Low)' }
	];
	const showSkeleton = loading || !cohort;

	return (
		<div className='rounded-xxl my-4 w-full rounded-3xl border border-border_grey bg-bg_modal p-6'>
			<div className='mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center'>
				<div className='flex flex-col gap-4 md:flex-row md:items-center'>
					<div className='flex items-center gap-2'>
						<Activity className='text-decision_bar_indicator' />
						<h2 className='text-2xl font-semibold text-navbar_title'>Decentralised Voices</h2>
					</div>
					{cohort && cohort.guardiansCount > 0 && (
						<div className='flex rounded-lg bg-sidebar_footer p-1'>
							<button
								type='button'
								onClick={() => setActiveTab('DAO')}
								className={`rounded px-3 py-0.5 text-sm text-navbar_title transition-colors ${activeTab === 'DAO' && 'bg-section_dark_overlay font-semibold'}`}
							>
								DAO ({cohort.delegatesCount})
							</button>
							<button
								type='button'
								onClick={() => setActiveTab('GUARDIAN')}
								className={`py-0.6 rounded px-3 text-sm font-medium text-navbar_title transition-colors ${activeTab === 'GUARDIAN' && 'bg-section_dark_overlay font-semibold'}`}
							>
								GUARDIAN ({cohort.guardiansCount})
							</button>
						</div>
					)}
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
									onClick={() =>
										setSortOptions({
											newestToOldest: false,
											participationHighToLow: false,
											votesCastedHighToLow: true
										})
									}
									className='text-xs font-medium text-text_pink'
								>
									Reset
								</button>
							</div>

							<DropdownMenuSeparator />

							{sortItems.map(({ key, label }) => {
								const active = sortOptions[key as keyof typeof sortOptions];

								return (
									<DropdownMenuItem
										key={key}
										className='flex cursor-pointer items-center justify-between'
										onClick={() => setSortOptions((prev) => ({ ...prev, [key]: !prev[key as keyof typeof sortOptions] }))}
									>
										<span className={active ? 'font-medium text-text_pink' : 'text-basic_text'}>{label}</span>

										<span className={`flex items-center justify-center rounded-md border p-0.5 ${active ? 'border-text_pink' : 'border-basic_text'}`}>
											<Check
												size={10}
												strokeWidth={3}
												className={active ? 'text-text_pink' : 'text-basic_text'}
											/>
										</span>
									</DropdownMenuItem>
								);
							})}
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
						{showSkeleton
							? [1, 2, 3, 4, 5].map((i) => (
									<tr
										key={i}
										className='border-b border-border_grey'
									>
										<td className='py-4 pl-4'>
											<Skeleton className='h-6 w-40' />
										</td>
										<td className='py-4'>
											<Skeleton className='h-5 w-12' />
										</td>
										<td className='py-4'>
											<div className='flex gap-4'>
												<Skeleton className='h-5 w-10' />
												<Skeleton className='h-5 w-10' />
												<Skeleton className='h-5 w-10' />
											</div>
										</td>
										<td className='py-4'>
											<Skeleton className='h-5 w-16' />
										</td>
										<td className='py-4'>
											<Skeleton className='h-5 w-16' />
										</td>
									</tr>
								))
							: sortedDelegates.map((delegate) => {
									const totalVotes = delegate.voteStats.ayeCount + delegate.voteStats.nayCount + delegate.voteStats.abstainCount;
									return (
										<tr
											key={delegate.address}
											className='cursor-pointer border-b border-border_grey text-sm font-semibold hover:border-border_grey/90'
										>
											<td className='py-4 pl-4'>
												<div className='flex items-center gap-2'>
													<Address address={delegate.address} />
												</div>
											</td>
											<td className='text-bodyBlue dark:text-blue-dark-high py-4 font-medium'>{totalVotes}</td>
											<td className='py-4'>
												<div className='flex items-center gap-4'>
													<div className='flex items-center gap-1 text-success'>
														<AiFillLike className='fill-current text-sm' />
														<span className='font-medium'>{delegate.voteStats.ayeCount}</span>
													</div>
													<div className='flex items-center gap-1 text-toast_error_text'>
														<AiFillDislike className='fill-current text-sm' />
														<span className='font-medium'>{delegate.voteStats.nayCount}</span>
													</div>
													<div className='flex items-center gap-1 text-bg_blue'>
														<Ban size={14} />
														<span className='font-medium'>{delegate.voteStats.abstainCount}</span>
													</div>
												</div>
											</td>
											<td className='py-4'>
												<TooltipProvider>
													<Tooltip>
														<TooltipTrigger className='text-bodyBlue dark:text-blue-dark-high cursor-help font-medium'>
															{delegate.voteStats.participation.toFixed(2)} %
														</TooltipTrigger>
														<TooltipContent className='bg-gray-800 text-white'>
															<p>Votes Cast / Total Eligible Referenda</p>
														</TooltipContent>
													</Tooltip>
												</TooltipProvider>
											</td>
											<td className='py-4'>
												<TooltipProvider>
													<Tooltip>
														<TooltipTrigger className='cursor-help font-medium text-green-500'>{delegate.voteStats.winRate.toFixed(2)} %</TooltipTrigger>
														<TooltipContent className='bg-gray-800 text-white'>
															<p>Winning Votes / Total Non-Abstain Votes</p>
														</TooltipContent>
													</Tooltip>
												</TooltipProvider>
											</td>
										</tr>
									);
								})}
					</tbody>
				</table>
			</div>
		</div>
	);
}

export default DecentralisedVoicesCard;
