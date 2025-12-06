// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Check, X, Minus, Activity, ChevronDown, ChevronUp, Filter } from 'lucide-react';
import { MdArrowDropDown } from '@react-icons/all-files/md/MdArrowDropDown';
import { BiBarChart } from '@react-icons/all-files/bi/BiBarChart';
import { IDVDelegateVotingMatrix, IDVCohort, EDVDelegateType, EVoteDecision } from '@/_shared/types';
import Address from '@/app/_shared-components/Profile/Address/Address';
import { Skeleton } from '@/app/_shared-components/Skeleton';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/app/_shared-components/Collapsible';

interface DecentralizedVoicesVotingCardProps {
	votingMatrix: IDVDelegateVotingMatrix[];
	referendumIndices: number[];
	cohort: IDVCohort | null;
	loading?: boolean;
}

type SortOption = 'name' | 'participation' | 'supportRate' | 'activity';

function DecentralizedVoicesVotingCard({ votingMatrix, referendumIndices, cohort, loading }: DecentralizedVoicesVotingCardProps) {
	const t = useTranslations('DecentralizedVoices');
	const [isOpen, setIsOpen] = useState(true);
	const referendums = referendumIndices;
	const [viewMode, setViewMode] = useState<'compact' | 'heatmap'>('compact');
	const [activeTab, setActiveTab] = useState<EDVDelegateType>(EDVDelegateType.DAO);
	const [expandedRows, setExpandedRows] = useState<string[]>(votingMatrix.length > 0 ? [votingMatrix[0].address] : []);
	const [sortBy, setSortBy] = useState<SortOption>('activity');

	const minRef = referendums.length > 0 ? Math.min(...referendums) : 0;
	const maxRef = referendums.length > 0 ? Math.max(...referendums) : 0;

	const daos = votingMatrix.filter((d) => d.type === EDVDelegateType.DAO);
	const guardians = votingMatrix.filter((d) => d.type === EDVDelegateType.GUARDIAN);
	const filteredVotingMatrix = activeTab === EDVDelegateType.DAO ? daos : guardians;

	const sortedVoicesData = [...filteredVotingMatrix].sort((a, b) => {
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

	const getVoteBarColor = (vote: string) => {
		switch (vote) {
			case 'aye':
				return 'bg-success';
			case 'nay':
				return 'bg-failure';
			case 'abstain':
				return 'bg-activity_selected_tab';
			default:
				return 'bg-activity_selected_tab';
		}
	};

	return (
		<Collapsible
			open={isOpen}
			onOpenChange={setIsOpen}
		>
			<div className='my-4 w-full max-w-full overflow-hidden rounded-3xl border border-border_grey bg-bg_modal p-6'>
				<div className='flex flex-col justify-between gap-4 md:flex-row md:items-center'>
					<div className='flex flex-col gap-4 md:flex-row md:items-center'>
						<div>
							<h2 className='text-2xl font-semibold text-navbar_title'>{t('DecentralizedVoicesVoting')}</h2>
							<p className='text-sm text-text_primary'>
								{activeTab === EDVDelegateType.DAO ? daos.length : guardians.length} {activeTab === EDVDelegateType.DAO ? t('DAOs') : t('Guardians')} {t('Across')}{' '}
								{referendums.length} {t('Referendums')}
								{referendums.length > 0 && (
									<>
										{' '}
										(#{minRef} - #{maxRef})
									</>
								)}
							</p>
						</div>
						{cohort && cohort.guardiansCount > 0 && (
							<div className='flex rounded-lg bg-sidebar_footer p-1'>
								<button
									type='button'
									onClick={() => setActiveTab(EDVDelegateType.DAO)}
									className={`rounded px-3 py-0.5 text-sm text-navbar_title transition-colors ${activeTab === EDVDelegateType.DAO && 'bg-section_dark_overlay font-semibold'}`}
								>
									{t('DAO')} ({daos.length})
								</button>
								<button
									type='button'
									onClick={() => setActiveTab(EDVDelegateType.GUARDIAN)}
									className={`rounded px-3 py-0.5 text-sm font-medium text-navbar_title transition-colors ${activeTab === EDVDelegateType.GUARDIAN && 'bg-section_dark_overlay font-semibold'}`}
								>
									{t('Guardian').toUpperCase()} ({guardians.length})
								</button>
							</div>
						)}
					</div>
					<div className='flex items-center gap-4'>
						<div className='flex items-center rounded-lg border border-border_grey bg-bg_modal p-1'>
							<button
								type='button'
								onClick={() => setViewMode('compact')}
								className={`flex items-center gap-2 rounded px-3 py-1.5 text-sm font-medium transition-colors ${viewMode === 'compact' ? 'bg-info text-btn_primary_text' : 'text-text_primary'}`}
							>
								<BiBarChart size={16} />
							</button>
							<button
								type='button'
								onClick={() => setViewMode('heatmap')}
								className={`flex items-center gap-2 rounded px-3 py-1.5 text-sm font-medium transition-colors ${viewMode === 'heatmap' ? 'bg-info text-btn_primary_text' : 'text-text_primary'}`}
							>
								<Activity size={16} />
							</button>
						</div>
						<CollapsibleTrigger asChild>
							<button
								type='button'
								className='transition-transform duration-200'
								style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
							>
								<MdArrowDropDown className='text-3xl text-wallet_btn_text' />
							</button>
						</CollapsibleTrigger>
					</div>
				</div>

				<CollapsibleContent>
					<div className='my-5 flex flex-wrap items-center gap-4 rounded-lg border border-border_grey p-3'>
						<div className='flex items-center gap-2 text-sm text-text_primary'>
							<Filter size={14} />
							<span>{t('SortBy')}</span>
						</div>
						{(['name', 'participation', 'supportRate', 'activity'] as SortOption[]).map((option) => {
							const labels: Record<SortOption, string> = {
								name: t('Name'),
								participation: t('Participation'),
								supportRate: t('SupportRate'),
								activity: t('Activity')
							};
							return (
								<button
									type='button'
									key={option}
									onClick={() => setSortBy(option)}
									className={`rounded px-3 py-1 text-sm font-medium transition-colors ${sortBy === option ? 'bg-grey_bg text-info' : 'bg-grey_bg/10 text-text_primary'}`}
								>
									{labels[option]}
								</button>
							);
						})}
					</div>

					<div className='grid grid-cols-1 gap-4'>
						{loading ? (
							[1, 2, 3, 4].map((i) => (
								<div
									key={i}
									className='rounded-xl border border-border_grey bg-bg_modal p-4'
								>
									<div className='flex items-center justify-between'>
										<div className='flex items-center gap-3'>
											<Skeleton className='h-8 w-8 rounded-full' />
											<div className='space-y-2'>
												<Skeleton className='h-4 w-32' />
												<Skeleton className='h-3 w-24' />
											</div>
										</div>
										<Skeleton className='h-5 w-5' />
									</div>
									<div className='mt-4 grid grid-cols-3 gap-4 rounded-lg bg-bg_modal/70 p-4'>
										<div className='space-y-2'>
											<Skeleton className='h-3 w-16' />
											<Skeleton className='h-6 w-12' />
										</div>
										<div className='space-y-2'>
											<Skeleton className='h-3 w-16' />
											<Skeleton className='h-6 w-12' />
										</div>
										<div className='space-y-2'>
											<Skeleton className='h-3 w-16' />
											<Skeleton className='h-6 w-12' />
										</div>
									</div>
									<Skeleton className='mt-4 h-2 w-full rounded-full' />
								</div>
							))
						) : viewMode === 'compact' ? (
							sortedVoicesData.map((item) => (
								<div
									key={item.address}
									className='rounded-xl border border-border_grey bg-bg_modal p-4'
								>
									<div
										aria-hidden
										className='flex cursor-pointer items-center justify-between'
										onClick={() => toggleRow(item.address)}
									>
										<div className='flex flex-col items-center gap-3 md:flex-row'>
											<Address address={item.address} />
											<div>
												<p className='text-xs text-text_primary'>
													{item.activeCount} {t('Of')} {item.totalRefs} {t('Referendums')}
												</p>
											</div>
										</div>
										<div className='text-text_primary'>{expandedRows.includes(item.address) ? <ChevronUp size={20} /> : <ChevronDown size={20} />}</div>
									</div>

									<div className='mt-4 grid grid-cols-2 gap-4 rounded-lg bg-bg_modal/70 p-4 md:grid-cols-3'>
										<div>
											<p className='text-xs text-text_primary'>{t('Participation')}</p>
											<p className='text-lg font-bold text-text_primary'>{item.participation.toFixed(1)}%</p>
										</div>
										<div>
											<p className='text-xs text-text_primary'>{t('AyeRate')}</p>
											<p className='text-lg font-bold text-aye_color'>{item.ayeRate.toFixed(1)}%</p>
										</div>
										<div>
											<p className='text-xs text-text_primary'>{t('Total')}</p>
											<p className='text-lg font-bold text-abstain_color'>{item.activeCount}</p>
										</div>
									</div>

									{expandedRows.includes(item.address) ? (
										<div className='mt-4'>
											<div className='grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-7 lg:grid-cols-8'>
												{referendums.map((ref) => {
													const vote = item.votes[ref] || '';
													return (
														<div
															key={ref}
															className={`flex flex-col items-center justify-center rounded p-2 ${getVoteColor(vote)}`}
														>
															<div className='mb-1'>{getVoteIcon(vote)}</div>
															<span className='text-xs font-medium'>#{ref}</span>
															<span className='text-[10px] capitalize opacity-70'>
																{vote !== EVoteDecision.AYE && vote !== EVoteDecision.NAY && vote !== EVoteDecision.ABSTAIN ? t('NoVote') : vote}
															</span>
														</div>
													);
												})}
											</div>
											<div className='mt-2 flex h-2 w-full overflow-hidden rounded-full'>
												{referendums.map((ref) => (
													<div
														key={ref}
														className={`flex-1 ${getVoteBarColor(item.votes[ref] || '')} border-r border-border_grey last:border-0`}
													/>
												))}
											</div>
										</div>
									) : (
										<div className='mt-4 flex h-2 w-full overflow-hidden rounded-full'>
											{referendums.map((ref) => (
												<div
													key={ref}
													className={`flex-1 ${getVoteBarColor(item.votes[ref] || '')} border-r border-border_grey last:border-0`}
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
												<th className='sticky left-0 z-10 w-64 bg-bg_modal py-4 pl-4 uppercase'>{activeTab === EDVDelegateType.DAO ? t('DAO') : t('Guardian').toUpperCase()}</th>{' '}
												{referendums.map((ref) => (
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
											{sortedVoicesData.map((item) => (
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
													{referendums.map((ref) => {
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
								<div className='flex flex-wrap items-center gap-6 rounded-lg border border-border_grey bg-bg_modal p-4'>
									<span className='font-semibold text-text_primary'>{t('Legend')}</span>
									<div className='flex items-center gap-2'>
										<div className='flex h-6 w-6 items-center justify-center rounded bg-success_vote_bg text-aye_color'>
											<Check size={14} />
										</div>
										<span className='text-sm text-text_primary'>{t('Aye')}</span>
									</div>
									<div className='flex items-center gap-2'>
										<div className='flex h-6 w-6 items-center justify-center rounded bg-failure_vote_bg text-nay_color'>
											<X size={14} />
										</div>
										<span className='text-sm text-text_primary'>{t('Nay')}</span>
									</div>
									<div className='flex items-center gap-2'>
										<div className='flex h-6 w-6 items-center justify-center rounded bg-activity_selected_tab text-abstain_color'>
											<Minus size={14} />
										</div>
										<span className='text-sm text-text_primary'>{t('Abstain')}</span>
									</div>
									<div className='flex items-center gap-2'>
										<div className='flex h-6 w-6 items-center justify-center rounded bg-activity_selected_tab text-text_primary'>
											<div className='h-1 w-1 rounded-full bg-current' />
										</div>
										<span className='text-sm text-text_primary'>{t('NoVote')}</span>
									</div>
								</div>
							</div>
						)}
					</div>
				</CollapsibleContent>
			</div>
		</Collapsible>
	);
}

export default DecentralizedVoicesVotingCard;
