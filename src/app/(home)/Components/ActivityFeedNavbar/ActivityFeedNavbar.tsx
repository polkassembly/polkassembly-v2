// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { ENetwork, EPostOrigin } from '@/_shared/types';
import { useMemo, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import Home from '@assets/activityfeed/All.svg';
import RootIcon from '@assets/sidebar/root-icon.svg';
import TreasuryIcon from '@assets/sidebar/treasury-icon.svg';
import WishForChangeIcon from '@assets/sidebar/wish-for-change-icon.svg';
import GovernanceIcon from '@assets/sidebar/admin-icon.svg';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@ui/DropdownMenu';
import { cn } from '@/lib/utils';
import AdminIcon from '@assets/activityfeed/admin.svg';
import WhitelistedCallerIcon from '@assets/sidebar/whitelisted-caller-icon.svg';
import Image from 'next/image';
import styles from './ActivityFeedNavbar.module.scss';

function ActivityFeedNavbar({ currentTab, setCurrentTab }: { currentTab: EPostOrigin | 'All'; setCurrentTab: (tab: EPostOrigin | 'All') => void }) {
	const network = getCurrentNetwork();
	const t = useTranslations();
	const trackInfo = NETWORKS_DETAILS[network as ENetwork].trackDetails;
	const containerRef = useRef<HTMLDivElement>(null);

	const ADMIN_CATEGORY = t('ActivityFeed.Navbar.Admin');
	const ALL_CATEGORY = t('ActivityFeed.Navbar.All');
	const ROOT_CATEGORY = t('ActivityFeed.Navbar.Root');
	const WISH_FOR_CHANGE_CATEGORY = t('ActivityFeed.Navbar.Wish For Change');
	const GOVERNANCE_CATEGORY = t('ActivityFeed.Navbar.Governance');
	const TREASURY_CATEGORY = t('ActivityFeed.Navbar.Treasury');
	const WHITELIST_CATEGORY = t('ActivityFeed.Navbar.Whitelist');

	const categoryIconPaths = useMemo(
		() => ({
			[ALL_CATEGORY]: Home,
			[ROOT_CATEGORY]: RootIcon,
			[WISH_FOR_CHANGE_CATEGORY]: WishForChangeIcon,
			[ADMIN_CATEGORY]: AdminIcon,
			[GOVERNANCE_CATEGORY]: GovernanceIcon,
			[TREASURY_CATEGORY]: TreasuryIcon,
			[WHITELIST_CATEGORY]: WhitelistedCallerIcon
		}),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[t]
	);

	const categoryStructure = useMemo(() => {
		const structure: Record<string, EPostOrigin[]> = {
			[ALL_CATEGORY]: [],
			[ROOT_CATEGORY]: [],
			[WISH_FOR_CHANGE_CATEGORY]: [],
			[ADMIN_CATEGORY]: [],
			[GOVERNANCE_CATEGORY]: [],
			[TREASURY_CATEGORY]: [],
			[WHITELIST_CATEGORY]: []
		};

		Object.entries(trackInfo).forEach(([key]) => {
			const origin = key as EPostOrigin;

			if (origin === EPostOrigin.ROOT) {
				structure[ROOT_CATEGORY as string].push(origin);
			} else if (origin === EPostOrigin.WISH_FOR_CHANGE) {
				structure[WISH_FOR_CHANGE_CATEGORY as string].push(origin);
			} else if (origin.includes('ADMIN') || origin.includes(EPostOrigin.STAKING_ADMIN) || origin.includes(EPostOrigin.AUCTION_ADMIN)) {
				structure[ADMIN_CATEGORY as string].push(origin);
			} else if (
				origin.includes(EPostOrigin.LEASE_ADMIN) ||
				origin.includes(EPostOrigin.GENERAL_ADMIN) ||
				origin.includes(EPostOrigin.REFERENDUM_CANCELLER) ||
				origin.includes(EPostOrigin.REFERENDUM_KILLER)
			) {
				structure[GOVERNANCE_CATEGORY as string].push(origin);
			} else if (
				origin.includes(EPostOrigin.BIG_SPENDER) ||
				origin.includes(EPostOrigin.MEDIUM_SPENDER) ||
				origin.includes(EPostOrigin.SMALL_SPENDER) ||
				origin.includes(EPostOrigin.BIG_TIPPER) ||
				origin.includes(EPostOrigin.SMALL_TIPPER) ||
				origin.includes(EPostOrigin.TREASURER)
			) {
				structure[TREASURY_CATEGORY as string].push(origin);
			} else if (origin.includes(EPostOrigin.WHITELISTED_CALLER) || origin.includes(EPostOrigin.FELLOWSHIP_ADMIN)) {
				structure[WHITELIST_CATEGORY as string].push(origin);
			}
		});

		return Object.fromEntries(Object.entries(structure).filter(([_, tracks]) => tracks.length > 0 || _ === ALL_CATEGORY));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [trackInfo, t, ALL_CATEGORY]);

	const formatTrackName = (name: string) => {
		return name.replace(/([A-Z])/g, ' $1').trim();
	};

	const handleCategoryClick = (category: string) => {
		if (category === ALL_CATEGORY) {
			setCurrentTab('All');
		} else if ([ROOT_CATEGORY, WISH_FOR_CHANGE_CATEGORY].includes(category)) {
			setCurrentTab(category as EPostOrigin);
		}
	};

	const isActiveCategory = (category: string, tracks: EPostOrigin[]) => {
		if (currentTab === category) return true;
		return tracks.some((track) => currentTab === track);
	};

	useEffect(() => {
		if (containerRef.current) {
			containerRef.current.scrollLeft = containerRef.current.scrollWidth;
		}
	}, [currentTab]);

	return (
		<div className='mb-5 w-full'>
			<div
				className={`${styles.container} hide_scrollbar`}
				ref={containerRef}
			>
				{Object.entries(categoryStructure).map(([category, tracks]) => (
					<div key={category}>
						{tracks && tracks.length > 0 && category !== ROOT_CATEGORY && category !== WISH_FOR_CHANGE_CATEGORY ? (
							<DropdownMenu>
								<DropdownMenuTrigger className={cn(styles.popoverTrigger, isActiveCategory(category, tracks) && 'bg-activity_selected_tab px-2', 'border-none px-2 font-normal')}>
									<span className='flex items-center whitespace-nowrap'>
										<Image
											src={categoryIconPaths[category as keyof typeof categoryIconPaths]}
											alt={category}
											width={20}
											height={20}
											className={cn('h-5 w-5', styles.darkIcon)}
										/>
										<span className='ml-1 text-sm text-basic_text'>{category}</span>
									</span>
								</DropdownMenuTrigger>
								<DropdownMenuContent
									align='start'
									className={styles.popoverContent}
								>
									{tracks.map((track) => (
										<DropdownMenuItem
											key={track}
											className={cn(styles.trackName, currentTab === track && 'bg-activity_selected_tab')}
											onSelect={() => setCurrentTab(track)}
										>
											{formatTrackName(track)}
										</DropdownMenuItem>
									))}
								</DropdownMenuContent>
							</DropdownMenu>
						) : (
							<button
								type='button'
								className={cn(styles.popoverTrigger, isActiveCategory(category, tracks) && 'bg-activity_selected_tab font-medium')}
								onClick={() => handleCategoryClick(category)}
							>
								<span className='flex items-center whitespace-nowrap'>
									<Image
										src={categoryIconPaths[category as keyof typeof categoryIconPaths]}
										alt={category}
										width={20}
										height={20}
										className={cn('h-5 w-5', styles.darkIcon)}
									/>
									<span className='ml-1 text-sm'>{category}</span>
								</span>
							</button>
						)}
					</div>
				))}
			</div>
		</div>
	);
}

export default ActivityFeedNavbar;
