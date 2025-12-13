// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Proposal from '@assets/icons/proposals.svg';
import Votes from '@assets/icons/votes.svg';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger } from '@ui/DropdownMenu';
import { cn } from '@/lib/utils';
import { EPostOrigin, ESortOption } from '@/_shared/types';
import { useMemo } from 'react';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { convertCamelCaseToTitleCase } from '@/_shared/_utils/convertCamelCaseToTitleCase';
import { Separator } from '@/app/_shared-components/Separator';
import { FaFilter } from '@react-icons/all-files/fa/FaFilter';
import { MdSort } from '@react-icons/all-files/md/MdSort';

const CURSOR_POINTER_CLASS = 'cursor-pointer';
const ACTIVE_BG_CLASS = 'bg-page_background';

enum ECategory {
	ALL = 'ALL',
	ROOT = 'ROOT',
	WISH_FOR_CHANGE = 'WISH_FOR_CHANGE',
	ADMIN = 'ADMIN',
	GOVERNANCE = 'GOVERNANCE',
	TREASURY = 'TREASURY',
	WHITELIST = 'WHITELIST'
}

interface ActivityFeedStatsProps {
	activeProposalsCount?: number;
	activeVotesCount?: number;
	onSortChange?: (sort: ESortOption) => void;
	currentTab: EPostOrigin | 'All';
	setCurrentTab: (tab: EPostOrigin | 'All') => void;
	currentSort?: ESortOption;
}

function ActivityFeedStats({ activeProposalsCount = 0, activeVotesCount = 0, onSortChange, currentTab, setCurrentTab, currentSort = ESortOption.NEWEST }: ActivityFeedStatsProps) {
	const t = useTranslations();
	const network = getCurrentNetwork();
	const trackInfo = NETWORKS_DETAILS[network].trackDetails;

	const categoryStructure = useMemo(() => {
		const structure: Record<ECategory, EPostOrigin[]> = {
			[ECategory.ALL]: [],
			[ECategory.ROOT]: [],
			[ECategory.WISH_FOR_CHANGE]: [],
			[ECategory.ADMIN]: [],
			[ECategory.GOVERNANCE]: [],
			[ECategory.TREASURY]: [],
			[ECategory.WHITELIST]: []
		};

		Object.entries(trackInfo).forEach(([key]) => {
			const origin = key as EPostOrigin;

			if (origin === EPostOrigin.ROOT) {
				structure[ECategory.ROOT].push(origin);
			} else if (origin === EPostOrigin.WISH_FOR_CHANGE) {
				structure[ECategory.WISH_FOR_CHANGE].push(origin);
			} else if (origin.includes('ADMIN') || origin.includes(EPostOrigin.STAKING_ADMIN) || origin.includes(EPostOrigin.AUCTION_ADMIN)) {
				structure[ECategory.ADMIN].push(origin);
			} else if (
				origin.includes(EPostOrigin.LEASE_ADMIN) ||
				origin.includes(EPostOrigin.GENERAL_ADMIN) ||
				origin.includes(EPostOrigin.REFERENDUM_CANCELLER) ||
				origin.includes(EPostOrigin.REFERENDUM_KILLER)
			) {
				structure[ECategory.GOVERNANCE].push(origin);
			} else if (
				origin.includes(EPostOrigin.BIG_SPENDER) ||
				origin.includes(EPostOrigin.MEDIUM_SPENDER) ||
				origin.includes(EPostOrigin.SMALL_SPENDER) ||
				origin.includes(EPostOrigin.BIG_TIPPER) ||
				origin.includes(EPostOrigin.SMALL_TIPPER) ||
				origin.includes(EPostOrigin.TREASURER)
			) {
				structure[ECategory.TREASURY].push(origin);
			} else if (origin.includes(EPostOrigin.WHITELISTED_CALLER) || origin.includes(EPostOrigin.FELLOWSHIP_ADMIN)) {
				structure[ECategory.WHITELIST].push(origin);
			}
		});

		return Object.fromEntries(Object.entries(structure).filter(([categoryKey, tracks]) => tracks.length > 0 || categoryKey === ECategory.ALL));
	}, [trackInfo]);

	const getCategoryLabel = (categoryKey: ECategory): string => {
		const labelMap: Record<ECategory, string> = {
			[ECategory.ALL]: t('ActivityFeed.Navbar.All'),
			[ECategory.ROOT]: t('ActivityFeed.Navbar.Root'),
			[ECategory.WISH_FOR_CHANGE]: t('ActivityFeed.Navbar.Wish For Change'),
			[ECategory.ADMIN]: t('ActivityFeed.Navbar.Admin'),
			[ECategory.GOVERNANCE]: t('ActivityFeed.Navbar.Governance'),
			[ECategory.TREASURY]: t('ActivityFeed.Navbar.Treasury'),
			[ECategory.WHITELIST]: t('ActivityFeed.Navbar.Whitelist')
		};
		return labelMap[categoryKey];
	};

	const handleCategoryClick = (categoryKey: ECategory) => {
		if (categoryKey === ECategory.ALL) {
			setCurrentTab('All');
		} else if (categoryKey === ECategory.ROOT) {
			setCurrentTab(EPostOrigin.ROOT);
		} else if (categoryKey === ECategory.WISH_FOR_CHANGE) {
			setCurrentTab(EPostOrigin.WISH_FOR_CHANGE);
		}
	};

	const isActiveCategory = (categoryKey: ECategory, tracks: EPostOrigin[]) => {
		if (currentTab === 'All' && categoryKey === ECategory.ALL) return true;

		if (categoryKey === ECategory.ROOT && currentTab === EPostOrigin.ROOT) return true;
		if (categoryKey === ECategory.WISH_FOR_CHANGE && currentTab === EPostOrigin.WISH_FOR_CHANGE) return true;

		return tracks.some((track) => currentTab === track);
	};

	return (
		<div className='mb-5 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border_grey bg-bg_modal p-3 shadow-sm'>
			<div className='flex items-center gap-4'>
				<div className='flex items-center gap-3 rounded-lg'>
					<div className='flex items-center justify-center rounded-full'>
						<Image
							src={Proposal}
							alt='proposals'
							width={20}
							height={20}
							className='h-10 w-10 dark:invert'
						/>
					</div>
					<div className='flex flex-col'>
						<span className='text-xs text-wallet_btn_text'>{t('ActivityFeed.Stats.activeProposals')}</span>
						<span className='text-2xl font-bold text-text_primary'>{activeProposalsCount}</span>
					</div>
				</div>
				<Separator
					orientation='vertical'
					className='h-12'
				/>
				<div className='flex items-center gap-3 rounded-lg'>
					<div className='flex items-center justify-center rounded-full'>
						<Image
							src={Votes}
							alt='votes'
							width={20}
							height={20}
							className='h-10 w-10 dark:invert'
						/>
					</div>
					<div className='flex flex-col'>
						<span className='text-xs text-wallet_btn_text'>{t('ActivityFeed.Stats.activeVotes')}</span>
						<span className='text-2xl font-bold text-text_primary'>{activeVotesCount}</span>
					</div>
				</div>
			</div>

			<div className='flex items-center gap-2'>
				<DropdownMenu modal={false}>
					<DropdownMenuTrigger
						noArrow
						className='flex items-center gap-2 rounded-lg border border-border_grey bg-bg_modal px-2 py-1.5 text-sm text-text_primary transition-colors hover:bg-page_background'
						aria-label={t('ActivityFeed.Stats.filterLabel')}
					>
						<FaFilter className='text-lg text-basic_text' />
					</DropdownMenuTrigger>
					<DropdownMenuContent
						align='end'
						className='max-h-[400px] min-w-[200px] overflow-y-auto'
					>
						{Object.entries(categoryStructure).map(([categoryKey, tracks]) => {
							const category = categoryKey as ECategory;
							const categoryLabel = getCategoryLabel(category);
							const isSimpleCategory = tracks.length === 0 || category === ECategory.ROOT || category === ECategory.WISH_FOR_CHANGE;
							const isActive = isActiveCategory(category, tracks);

							if (isSimpleCategory) {
								return (
									<DropdownMenuItem
										key={category}
										className={cn(CURSOR_POINTER_CLASS, isActive && ACTIVE_BG_CLASS)}
										onSelect={() => handleCategoryClick(category)}
									>
										{categoryLabel}
									</DropdownMenuItem>
								);
							}

							return (
								<DropdownMenuSub key={category}>
									<DropdownMenuSubTrigger className={cn(CURSOR_POINTER_CLASS, isActive && ACTIVE_BG_CLASS)}>{categoryLabel}</DropdownMenuSubTrigger>
									<DropdownMenuSubContent className='max-h-[300px] overflow-y-auto border-border_grey bg-bg_modal'>
										{tracks.map((track) => (
											<DropdownMenuItem
												key={track}
												className={cn(CURSOR_POINTER_CLASS, currentTab === track && ACTIVE_BG_CLASS)}
												onSelect={() => setCurrentTab(track)}
											>
												{convertCamelCaseToTitleCase(track)}
											</DropdownMenuItem>
										))}
									</DropdownMenuSubContent>
								</DropdownMenuSub>
							);
						})}
					</DropdownMenuContent>
				</DropdownMenu>

				<DropdownMenu modal={false}>
					<DropdownMenuTrigger
						noArrow
						className='flex items-center gap-2 rounded-lg border border-border_grey bg-bg_modal px-2 py-1.5 text-sm text-text_primary transition-colors hover:bg-page_background'
						aria-label={t('ActivityFeed.Stats.sortLabel')}
					>
						<MdSort className='text-lg text-basic_text' />
					</DropdownMenuTrigger>
					<DropdownMenuContent
						align='end'
						className='min-w-[180px]'
					>
						<DropdownMenuItem
							className={cn(CURSOR_POINTER_CLASS, currentSort === ESortOption.NEWEST && ACTIVE_BG_CLASS)}
							onSelect={() => onSortChange?.(ESortOption.NEWEST)}
						>
							{t('ActivityFeed.Stats.sortNewest')}
						</DropdownMenuItem>
						<DropdownMenuItem
							className={cn(CURSOR_POINTER_CLASS, currentSort === ESortOption.OLDEST && ACTIVE_BG_CLASS)}
							onSelect={() => onSortChange?.(ESortOption.OLDEST)}
						>
							{t('ActivityFeed.Stats.sortOldest')}
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</div>
	);
}

export default ActivityFeedStats;
