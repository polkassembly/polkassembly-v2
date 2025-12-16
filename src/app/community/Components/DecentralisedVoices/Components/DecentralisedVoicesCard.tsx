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
			<div className='my-3 w-full rounded-2xl border border-border_grey bg-bg_modal p-4 sm:my-4 sm:p-5 lg:rounded-3xl lg:p-6'>
				<div className='mb-2 grid grid-cols-[1fr_auto] gap-y-4 lg:mb-6 lg:flex lg:flex-nowrap lg:items-center lg:justify-between lg:gap-4'>
					<div className='order-1 flex min-w-0 items-center gap-2 lg:order-1'>
						<Image
							src={TimeLineIcon}
							alt='Delegation Green Icon'
							width={24}
							height={24}
							className='h-6 w-6'
						/>{' '}
						<h2 className='truncate text-lg font-semibold text-navbar_title md:text-2xl'>{t('DecentralisedVoices')}</h2>
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

					<div className='order-2 ml-auto flex w-auto items-center justify-end gap-2 lg:order-3'>
						<div>
							<DropdownMenu>
								<DropdownMenuTrigger
									noArrow
									className='flex w-full items-center justify-center gap-2 rounded-md border border-border_grey p-1.5 lg:w-auto'
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
