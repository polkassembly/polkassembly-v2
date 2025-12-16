// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Check } from 'lucide-react';
import { MdArrowDropDown } from '@react-icons/all-files/md/MdArrowDropDown';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem, DropdownMenuSeparator } from '@/app/_shared-components/DropdownMenu';
import { IDVDelegateWithStats, IDVCohort, EDVDelegateType } from '@/_shared/types';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/app/_shared-components/Collapsible';
import TimeLineIcon from '@assets/icons/timeline.svg';
import Image from 'next/image';
import { MdSort } from '@react-icons/all-files/md/MdSort';
import DelegatesTable from './DelegatesTable';

interface DecentralisedVoicesCardProps {
	delegatesWithStats: IDVDelegateWithStats[];
	cohort: IDVCohort | null;
	loading?: boolean;
}

function DecentralisedVoicesCard({ delegatesWithStats, cohort, loading }: DecentralisedVoicesCardProps) {
	const t = useTranslations('DecentralizedVoices');
	const [isOpen, setIsOpen] = useState(true);
	const [activeTab, setActiveTab] = useState<EDVDelegateType>(EDVDelegateType.DAO);
	const [sortOptions, setSortOptions] = useState({
		newestToOldest: false,
		participationHighToLow: false,
		votesCastedHighToLow: true
	});

	const daos = delegatesWithStats.filter((d) => d.role === EDVDelegateType.DAO);
	const guardians = delegatesWithStats.filter((d) => d.role === EDVDelegateType.GUARDIAN);
	const filteredDelegates = activeTab === EDVDelegateType.DAO ? daos : guardians;

	const sortedDelegates = [...filteredDelegates].sort((a, b) => {
		if (sortOptions.newestToOldest) {
			return b.startBlock - a.startBlock;
		}
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
		{ key: 'newestToOldest', label: t('NewestToOldest') },
		{ key: 'participationHighToLow', label: t('ParticipationHighToLow') },
		{ key: 'votesCastedHighToLow', label: t('VotesCastedHighToLow') }
	];
	const showSkeleton = loading || !cohort;

	return (
		<Collapsible
			open={isOpen}
			onOpenChange={setIsOpen}
		>
			<div className='my-3 w-full rounded-2xl border border-border_grey bg-bg_modal p-4 sm:my-4 sm:p-5 md:rounded-3xl md:p-6'>
				<div className='flex flex-col justify-between gap-3 sm:mb-5 sm:gap-4 md:mb-6 md:flex-row md:items-center'>
					<div className='flex flex-col gap-3 sm:gap-4 md:flex-row md:items-center'>
						<div className='flex items-center gap-2'>
							<Image
								src={TimeLineIcon}
								alt='Delegation Green Icon'
								width={24}
								height={24}
								className='h-6 w-6'
							/>{' '}
							<h2 className='text-xl font-semibold text-navbar_title sm:text-2xl'>{t('DecentralisedVoices')}</h2>
						</div>
						{cohort && cohort.guardiansCount > 0 && (
							<div className='flex w-full rounded-lg bg-sidebar_footer p-1 md:w-auto'>
								<button
									type='button'
									onClick={() => setActiveTab(EDVDelegateType.DAO)}
									className={`flex-1 rounded px-2 py-1 text-xs text-navbar_title transition-colors sm:px-3 sm:py-1.5 sm:text-sm md:flex-none ${activeTab === EDVDelegateType.DAO && 'bg-section_dark_overlay font-semibold'}`}
								>
									{t('DAO')} ({cohort.delegatesCount})
								</button>
								<button
									type='button'
									onClick={() => setActiveTab(EDVDelegateType.GUARDIAN)}
									className={`flex-1 rounded px-2 py-1 text-xs font-medium text-navbar_title transition-colors sm:px-3 sm:py-1.5 sm:text-sm md:flex-none ${activeTab === EDVDelegateType.GUARDIAN && 'bg-section_dark_overlay font-semibold'}`}
								>
									{t('Guardian').toUpperCase()} ({cohort.guardiansCount})
								</button>
							</div>
						)}
					</div>
					<div className='flex w-full items-center gap-2 md:w-auto'>
						<div>
							<DropdownMenu>
								<DropdownMenuTrigger
									noArrow
									className='flex flex-1 items-center justify-center gap-2 rounded-md border border-border_grey p-1.5 md:flex-none'
								>
									<MdSort className='text-xl text-wallet_btn_text' />
								</DropdownMenuTrigger>

								<DropdownMenuContent
									align='end'
									className='w-64'
								>
									<div className='flex items-center justify-between px-2 py-2'>
										<span className='text-sm font-semibold text-wallet_btn_text'>{t('SortBy')}</span>

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
											{t('Reset')}
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
					<DelegatesTable
						delegates={sortedDelegates}
						loading={showSkeleton}
					/>
				</CollapsibleContent>
			</div>
		</Collapsible>
	);
}

export default DecentralisedVoicesCard;
