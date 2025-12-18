// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { MdArrowDropDown } from '@react-icons/all-files/md/MdArrowDropDown';
import { BiBarChart } from '@react-icons/all-files/bi/BiBarChart';
import { Activity } from 'lucide-react';
import { IDVDelegateVotingMatrix, IDVCohort, EDVDelegateType } from '@/_shared/types';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/app/_shared-components/Collapsible';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { Popover, PopoverContent, PopoverTrigger } from '@/app/_shared-components/Popover/Popover';
import { MdSort } from '@react-icons/all-files/md/MdSort';
import VotingStatsCard from './VotingStatsCard';
import VoteCompactView from './VoteCompactView';
import VoteHeatmapTable from './VoteHeatmapTable';
import VoteLegend from './VoteLegend';

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
	const [viewMode, setViewMode] = useState<'compact' | 'heatmap'>('compact');
	const [activeTab, setActiveTab] = useState<EDVDelegateType>(EDVDelegateType.DAO);
	const [sortBy, setSortBy] = useState<SortOption>('activity');
	const network = getCurrentNetwork();

	const minRef = referendumIndices.length > 0 ? Math.min(...referendumIndices) : 0;
	const maxRef = referendumIndices.length > 0 ? Math.max(...referendumIndices) : 0;

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

	return (
		<Collapsible
			open={isOpen}
			onOpenChange={setIsOpen}
		>
			<div className='my-4 w-full max-w-full overflow-hidden rounded-2xl border border-border_grey bg-bg_modal p-4 md:p-6'>
				<div className='mb-2 flex w-full flex-wrap gap-y-4 lg:mb-6 lg:flex-nowrap lg:items-center lg:justify-between lg:gap-4'>
					<div className='order-1 flex items-center gap-2 lg:order-1'>
						<div>
							<h2 className='text-lg font-semibold text-navbar_title md:text-2xl'>{t('Votes')}</h2>
						</div>
					</div>

					{cohort && cohort.guardiansCount > 0 && (
						<div className='order-3 flex w-full rounded-lg bg-sidebar_footer p-1 lg:order-2 lg:w-auto'>
							<button
								type='button'
								onClick={() => setActiveTab(EDVDelegateType.DAO)}
								className={`flex-1 rounded px-2 py-0.5 text-xs font-medium text-navbar_title transition-colors md:flex-none md:px-3 md:text-sm ${activeTab === EDVDelegateType.DAO && 'bg-section_dark_overlay font-semibold'}`}
							>
								{t('DAO')} ({daos.length})
							</button>
							<button
								type='button'
								onClick={() => setActiveTab(EDVDelegateType.GUARDIAN)}
								className={`flex-1 rounded px-2 py-0.5 text-xs font-medium text-navbar_title transition-colors md:flex-none md:px-3 md:text-sm ${activeTab === EDVDelegateType.GUARDIAN && 'bg-section_dark_overlay font-semibold'}`}
							>
								{t('Guardian').toUpperCase()} ({guardians.length})
							</button>
						</div>
					)}

					<div className='order-2 ml-auto flex items-center gap-2 lg:order-3'>
						<Popover>
							<PopoverTrigger asChild>
								<button
									type='button'
									className='flex items-center gap-1 rounded-md border border-border_grey p-1.5'
								>
									<MdSort className='text-xl text-wallet_btn_text' />
								</button>
							</PopoverTrigger>
							<PopoverContent className='w-48 border-border_grey p-3'>
								<div className='mb-2 text-xs font-semibold text-text_primary'>{t('SortBy')}</div>
								<div className='space-y-1'>
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
												className={`flex w-full items-center justify-between rounded px-2 py-1.5 text-xs ${sortBy === option ? 'bg-text_pink/10 text-text_pink' : 'text-text_primary hover:bg-sidebar_footer'}`}
											>
												{labels[option]}
											</button>
										);
									})}
								</div>
							</PopoverContent>
						</Popover>
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

				<VotingStatsCard
					votingMatrix={votingMatrix}
					referendumCount={referendumIndices.length}
					network={network}
					loading={loading}
				/>

				<CollapsibleContent>
					<div className='flex items-center justify-between'>
						<p className='text-sm text-text_primary'>
							{activeTab === EDVDelegateType.DAO ? daos.length : guardians.length} {activeTab === EDVDelegateType.DAO ? t('DAOs') : t('Guardians')} {t('Across')}{' '}
							{referendumIndices.length} {t('Referendums')}
							{referendumIndices.length > 0 && (
								<>
									{' '}
									(#{minRef} - #{maxRef})
								</>
							)}
						</p>
						<div className='flex items-center gap-4'>
							<div className='flex items-center rounded-lg bg-sidebar_footer p-1'>
								<button
									type='button'
									onClick={() => setViewMode('compact')}
									className={`flex items-center gap-2 rounded px-3 py-1.5 text-sm font-medium transition-colors ${viewMode === 'compact' ? 'bg-section_dark_overlay text-wallet_btn_text' : 'text-text_primary'}`}
								>
									<BiBarChart size={16} />
								</button>
								<button
									type='button'
									onClick={() => setViewMode('heatmap')}
									className={`flex items-center gap-2 rounded px-3 py-1.5 text-sm font-medium transition-colors ${viewMode === 'heatmap' ? 'bg-section_dark_overlay text-wallet_btn_text' : 'text-text_primary'}`}
								>
									<Activity size={16} />
								</button>
							</div>
						</div>
					</div>

					{viewMode === 'compact' ? (
						<VoteCompactView
							votingMatrix={sortedVoicesData}
							referendumIndices={referendumIndices}
							loading={loading}
						/>
					) : (
						<div className='flex flex-col gap-4'>
							<VoteHeatmapTable
								votingMatrix={sortedVoicesData}
								referendumIndices={referendumIndices}
							/>
							<VoteLegend />
						</div>
					)}
				</CollapsibleContent>
			</div>
		</Collapsible>
	);
}

export default DecentralizedVoicesVotingCard;
