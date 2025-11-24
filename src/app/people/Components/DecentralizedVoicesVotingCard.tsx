// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useState } from 'react';
import { Check, X, Minus, LayoutList, LayoutGrid, ChevronDown, ChevronUp, Filter } from 'lucide-react';

const referendums = [1695, 1697, 1698, 1699, 1701, 1702, 1703, 1705, 1706, 1708, 1709, 1710, 1712, 1714];

const voicesData = [
	{
		id: 1,
		name: 'Le Nexus',
		active: 14,
		totalRefs: 14,
		participation: 100,
		ayeRate: 58,
		votes: {
			1695: 'aye',
			1697: 'nay',
			1698: 'nay',
			1699: 'abstain',
			1701: 'aye',
			1702: 'aye',
			1703: 'nay',
			1705: 'abstain',
			1706: 'aye',
			1708: 'aye',
			1709: 'nay',
			1710: 'aye',
			1712: 'aye',
			1714: 'nay'
		}
	},
	{
		id: 2,
		name: 'PERMANENCE DAO/DV',
		active: 14,
		totalRefs: 14,
		participation: 100,
		ayeRate: 70,
		votes: {
			1695: 'aye',
			1697: 'aye',
			1698: 'aye',
			1699: 'abstain',
			1701: 'nay',
			1702: 'nay',
			1703: 'aye',
			1705: 'abstain',
			1706: 'aye',
			1708: 'aye',
			1709: 'abstain',
			1710: 'abstain',
			1712: 'aye',
			1714: 'nay'
		}
	},
	{
		id: 3,
		name: 'SAXEMBERG/Governance',
		active: 14,
		totalRefs: 14,
		participation: 100,
		ayeRate: 33,
		votes: {
			1695: 'aye',
			1697: 'nay',
			1698: 'nay',
			1699: 'nay',
			1701: 'aye',
			1702: 'aye',
			1703: 'aye',
			1705: 'nay',
			1706: 'novote',
			1708: 'novote',
			1709: 'nay',
			1710: 'nay',
			1712: 'nay',
			1714: 'nay'
		}
	},
	{
		id: 4,
		name: 'PBA_TIM/ALUMNI VOTING',
		active: 14,
		totalRefs: 14,
		participation: 100,
		ayeRate: 45,
		votes: {
			1695: 'abstain',
			1697: 'abstain',
			1698: 'abstain',
			1699: 'aye',
			1701: 'abstain',
			1702: 'abstain',
			1703: 'abstain',
			1705: 'nay',
			1706: 'aye',
			1708: 'abstain',
			1709: 'nay',
			1710: 'aye',
			1712: 'aye',
			1714: 'aye'
		}
	}
];

function DecentralizedVoicesVotingCard() {
	const [viewMode, setViewMode] = useState<'compact' | 'heatmap'>('compact');
	const [expandedRows, setExpandedRows] = useState<number[]>([1]); // Default first one expanded
	// const [sortOptions, setSortOptions] = useState({
	// name: false,
	// participation: false,
	// supportRate: false,
	// activity: true
	// });

	const toggleRow = (id: number) => {
		setExpandedRows((prev) => (prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]));
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
		<div className='rounded-xxl my-4 w-full rounded-3xl border border-border_grey bg-bg_modal p-6'>
			<div className='mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center'>
				<div>
					<h2 className='text-2xl font-semibold text-navbar_title'>Decentralized Voices Voting</h2>
					<p className='text-text_secondary text-sm'>7 DAOs across 14 referendums (#1695 - #1714)</p>
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
				{['Name', 'Participation', 'Support Rate', 'Activity'].map((option) => (
					<button
						type='button'
						key={option}
						className={`rounded px-3 py-1 text-sm font-medium transition-colors ${
							option === 'Activity' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'text-text_secondary hover:bg-gray-100 dark:hover:bg-gray-800'
						}`}
					>
						{option}
					</button>
				))}
			</div>

			<div className='flex flex-col gap-4'>
				{viewMode === 'compact' ? (
					voicesData.map((item) => (
						<div
							key={item.id}
							className='rounded-xl border border-border_grey bg-white p-4 dark:bg-black'
						>
							<div
								aria-hidden
								className='flex cursor-pointer items-center justify-between'
								onClick={() => toggleRow(item.id)}
							>
								<div className='flex items-center gap-3'>
									<div className='flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-xl dark:bg-gray-800'>
										{/* Placeholder Icon */}
										{item.id === 1 ? '🌐' : item.id === 2 ? '🏛️' : item.id === 3 ? '⚡' : '🎓'}
									</div>
									<div>
										<h3 className='font-semibold text-text_primary'>{item.name}</h3>
										<p className='text-text_secondary text-xs'>
											{item.totalRefs} of {item.totalRefs} referendums
										</p>
									</div>
								</div>
								<div className='text-text_secondary'>{expandedRows.includes(item.id) ? <ChevronUp size={20} /> : <ChevronDown size={20} />}</div>
							</div>

							<div className='mt-4 grid grid-cols-3 gap-4 rounded-lg bg-gray-50 p-4 dark:bg-gray-900/50'>
								<div>
									<p className='text-text_secondary text-xs'>Participation</p>
									<p className='text-lg font-bold text-text_primary'>{item.participation}%</p>
								</div>
								<div>
									<p className='text-text_secondary text-xs'>Aye Rate</p>
									<p className='text-lg font-bold text-green-600'>{item.ayeRate}%</p>
								</div>
								<div>
									<p className='text-text_secondary text-xs'>Active</p>
									<p className='text-lg font-bold text-blue-600'>{item.active}</p>
								</div>
							</div>

							{expandedRows.includes(item.id) ? (
								<div className='mt-4'>
									<div className='grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-7 lg:grid-cols-8'>
										{referendums.map((ref) => {
											const vote = item.votes[ref as keyof typeof item.votes];
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
												className={`flex-1 ${getVoteBarColor(item.votes[ref as keyof typeof item.votes])} border-r border-white last:border-0 dark:border-black`}
											/>
										))}
									</div>
								</div>
							) : (
								<div className='mt-4 flex h-2 w-full overflow-hidden rounded-full'>
									{referendums.map((ref) => (
										<div
											key={ref}
											className={`flex-1 ${getVoteBarColor(item.votes[ref as keyof typeof item.votes])} border-r border-white last:border-0 dark:border-black`}
										/>
									))}
								</div>
							)}
						</div>
					))
				) : (
					<div className='overflow-x-auto'>
						<table className='w-full min-w-[800px] table-auto border-collapse'>
							<thead>
								<tr className='border-b border-border_grey text-left text-xs font-semibold text-text_primary'>
									<th className='w-64 py-4 pl-4 uppercase'>DAO</th>
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
								{voicesData.map((item) => (
									<tr
										key={item.id}
										className='border-b border-border_grey hover:bg-gray-50 dark:hover:bg-gray-900'
									>
										<td className='py-4 pl-4'>
											<div className='flex flex-col'>
												<span className='font-semibold text-text_primary'>{item.name}</span>
												<span className='text-text_secondary text-xs'>{item.participation}% active</span>
											</div>
										</td>
										{referendums.map((ref) => {
											const vote = item.votes[ref as keyof typeof item.votes];
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
						<div className='mt-4 flex items-center gap-6 rounded-lg border border-border_grey bg-gray-50 p-4 dark:bg-gray-900/50'>
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
