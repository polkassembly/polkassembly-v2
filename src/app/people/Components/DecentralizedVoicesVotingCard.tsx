// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useState } from 'react';
import { Check, X, Minus, LayoutList, LayoutGrid, ChevronDown, ChevronUp, Filter } from 'lucide-react';
import { IDVDelegateVotingMatrix, IDVCohort } from '@/_shared/types';
import Address from '@/app/_shared-components/Profile/Address/Address';

interface DecentralizedVoicesVotingCardProps {
	votingMatrix: IDVDelegateVotingMatrix[];
	referendumIndices: number[];
	cohort: IDVCohort;
}

type SortOption = 'name' | 'participation' | 'supportRate' | 'activity';

function DecentralizedVoicesVotingCard({ votingMatrix, referendumIndices, cohort }: DecentralizedVoicesVotingCardProps) {
	const referendums = referendumIndices.length > 0 ? referendumIndices : [0];
	const [viewMode, setViewMode] = useState<'compact' | 'heatmap'>('compact');
	const [expandedRows, setExpandedRows] = useState<string[]>(votingMatrix.length > 0 ? [votingMatrix[0].address] : []); // Default first one expanded
	const [sortBy, setSortBy] = useState<SortOption>('activity');

	const minRef = referendums.length > 0 ? Math.min(...referendums) : 0;
	const maxRef = referendums.length > 0 ? Math.max(...referendums) : 0;
	const daoCount = cohort.delegatesCount;

	const sortedVoicesData = [...votingMatrix].sort((a, b) => {
		switch (sortBy) {
			case 'name':
				return a.address.localeCompare(b.address);
			case 'participation':
				return b.participation - a.participation;
			case 'supportRate':
				return b.ayeRate - a.ayeRate;
			case 'activity':
			default:
				return b.activeCount - a.activeCount;
		}
	});

	const toggleRow = (address: string) => {
		setExpandedRows((prev) => (prev.includes(address) ? prev.filter((rowAddr) => rowAddr !== address) : [...prev, address]));
	};

	const getVoteColor = (vote: string) => {
		switch (vote) {
			case 'aye':
				return 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400';
			case 'nay':
				return 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400';
			case 'abstain':
				return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
			default:
				return 'bg-gray-50 text-gray-300 dark:bg-gray-900 dark:text-gray-600';
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
				return <div className='h-1 w-1 rounded-full bg-current' />;
		}
	};

	const getVoteBarColor = (vote: string) => {
		switch (vote) {
			case 'aye':
				return 'bg-green-500';
			case 'nay':
				return 'bg-red-500';
			case 'abstain':
				return 'bg-gray-400';
			default:
				return 'bg-gray-200';
		}
	};

	return (
		<div className='my-4 w-full max-w-full overflow-hidden rounded-3xl border border-border_grey bg-bg_modal p-6'>
			<div className='mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center'>
				<div>
					<h2 className='text-2xl font-semibold text-navbar_title'>Decentralized Voices Voting</h2>
					<p className='text-text_secondary text-sm'>
						{daoCount} DAOs across {referendums.length} referendums (#{minRef} - #{maxRef})
					</p>
				</div>
				<div className='flex items-center gap-4'>
					<div className='flex items-center rounded-lg border border-border_grey bg-white p-1 dark:bg-black'>
						<button
							type='button'
							onClick={() => setViewMode('compact')}
							className={`flex items-center gap-2 rounded px-3 py-1.5 text-sm font-medium transition-colors ${
								viewMode === 'compact' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
							}`}
						>
							<LayoutList size={16} />
							Compact
						</button>
						<button
							type='button'
							onClick={() => setViewMode('heatmap')}
							className={`flex items-center gap-2 rounded px-3 py-1.5 text-sm font-medium transition-colors ${
								viewMode === 'heatmap' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
							}`}
						>
							<LayoutGrid size={16} />
							Heatmap
						</button>
					</div>
				</div>
			</div>

			<div className='mb-4 flex flex-wrap items-center gap-4 rounded-lg border border-border_grey p-3'>
				<div className='text-text_secondary flex items-center gap-2 text-sm'>
					<Filter size={14} />
					<span>Sort by:</span>
				</div>
				{(['name', 'participation', 'supportRate', 'activity'] as SortOption[]).map((option) => {
					const labels: Record<SortOption, string> = {
						name: 'Name',
						participation: 'Participation',
						supportRate: 'Support Rate',
						activity: 'Activity'
					};
					return (
						<button
							type='button'
							key={option}
							onClick={() => setSortBy(option)}
							className={`rounded px-3 py-1 text-sm font-medium transition-colors ${
								sortBy === option ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'text-text_secondary hover:bg-gray-100 dark:hover:bg-gray-800'
							}`}
						>
							{labels[option]}
						</button>
					);
				})}
			</div>

			<div className='grid grid-cols-1 gap-4'>
				{viewMode === 'compact' ? (
					sortedVoicesData.map((item) => (
						<div
							key={item.address}
							className='rounded-xl border border-border_grey bg-white p-4 dark:bg-black'
						>
							<div
								aria-hidden
								className='flex cursor-pointer items-center justify-between'
								onClick={() => toggleRow(item.address)}
							>
								<div className='flex items-center gap-3'>
									<Address address={item.address} />
									<div>
										<p className='text-text_secondary text-xs'>
											{item.activeCount} of {item.totalRefs} referendums
										</p>
									</div>
								</div>
								<div className='text-text_secondary'>{expandedRows.includes(item.address) ? <ChevronUp size={20} /> : <ChevronDown size={20} />}</div>
							</div>

							<div className='mt-4 grid grid-cols-3 gap-4 rounded-lg bg-gray-50 p-4 dark:bg-gray-900/50'>
								<div>
									<p className='text-text_secondary text-xs'>Participation</p>
									<p className='text-lg font-bold text-text_primary'>{item.participation.toFixed(1)}%</p>
								</div>
								<div>
									<p className='text-text_secondary text-xs'>Aye Rate</p>
									<p className='text-lg font-bold text-green-600'>{item.ayeRate.toFixed(1)}%</p>
								</div>
								<div>
									<p className='text-text_secondary text-xs'>Total</p>
									<p className='text-lg font-bold text-blue-600'>{item.activeCount}</p>
								</div>
							</div>

							{expandedRows.includes(item.address) ? (
								<div className='mt-4'>
									<div className='grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-7 lg:grid-cols-8'>
										{referendums.map((ref) => {
											const vote = item.votes[ref] || 'novote';
											return (
												<div
													key={ref}
													className={`flex flex-col items-center justify-center rounded p-2 ${getVoteColor(vote)}`}
												>
													<div className='mb-1'>{getVoteIcon(vote)}</div>
													<span className='text-xs font-medium'>#{ref}</span>
													<span className='text-[10px] capitalize opacity-70'>{vote === 'novote' ? 'No Vote' : vote}</span>
												</div>
											);
										})}
									</div>
									<div className='mt-2 flex h-2 w-full overflow-hidden rounded-full'>
										{referendums.map((ref) => (
											<div
												key={ref}
												className={`flex-1 ${getVoteBarColor(item.votes[ref] || 'novote')} border-r border-white last:border-0 dark:border-black`}
											/>
										))}
									</div>
								</div>
							) : (
								<div className='mt-4 flex h-2 w-full overflow-hidden rounded-full'>
									{referendums.map((ref) => (
										<div
											key={ref}
											className={`flex-1 ${getVoteBarColor(item.votes[ref] || 'novote')} border-r border-white last:border-0 dark:border-black`}
										/>
									))}
								</div>
							)}
						</div>
					))
				) : (
					<div className='flex flex-col gap-4'>
						<div className='hide_scrollbar block w-full overflow-x-auto'>
							<table className='w-full table-auto border-collapse'>
								<thead>
									<tr className='border-b border-border_grey text-left text-xs font-semibold text-text_primary'>
										<th className='sticky left-0 z-10 w-64 bg-white py-4 pl-4 uppercase dark:bg-black'>DAO</th>
										{referendums.map((ref) => (
											<th
												key={ref}
												className='text-text_secondary px-2 py-4 text-center'
											>
												#{ref}
											</th>
										))}
									</tr>
								</thead>
								<tbody>
									{sortedVoicesData.map((item) => (
										<tr
											key={item.address}
											className='border-b border-border_grey hover:bg-gray-50 dark:hover:bg-gray-900'
										>
											<td className='sticky left-0 z-10 bg-white px-4 py-4 dark:bg-black'>
												<div className='flex flex-col'>
													<Address address={item.address} />
													<span className='text-text_secondary text-xs'>{item.participation.toFixed(1)}% active</span>
												</div>
											</td>
											{referendums.map((ref) => {
												const vote = item.votes[ref] || 'novote';
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
						<div className='flex items-center gap-6 rounded-lg border border-border_grey bg-gray-50 p-4 dark:bg-gray-900/50'>
							<span className='font-semibold text-text_primary'>Legend</span>
							<div className='flex items-center gap-2'>
								<div className='flex h-6 w-6 items-center justify-center rounded bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'>
									<Check size={14} />
								</div>
								<span className='text-text_secondary text-sm'>Aye</span>
							</div>
							<div className='flex items-center gap-2'>
								<div className='flex h-6 w-6 items-center justify-center rounded bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'>
									<X size={14} />
								</div>
								<span className='text-text_secondary text-sm'>Nay</span>
							</div>
							<div className='flex items-center gap-2'>
								<div className='flex h-6 w-6 items-center justify-center rounded bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'>
									<Minus size={14} />
								</div>
								<span className='text-text_secondary text-sm'>Abstain</span>
							</div>
							<div className='flex items-center gap-2'>
								<div className='flex h-6 w-6 items-center justify-center rounded bg-transparent text-gray-300 dark:text-gray-600'>
									<div className='h-1 w-1 rounded-full bg-current' />
								</div>
								<span className='text-text_secondary text-sm'>No Vote</span>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}

export default DecentralizedVoicesVotingCard;
