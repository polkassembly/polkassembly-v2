// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { ENetwork, EPostOrigin, IPostListing } from '@/_shared/types';
import React, { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import Home from '@assets/activityfeed/All.svg';
import RootIcon from '@assets/sidebar/root-icon.svg';
import TreasuryIcon from '@assets/sidebar/treasury-icon.svg';
import WishForChangeIcon from '@assets/sidebar/wish-for-change-icon.svg';
import GovernanceIcon from '@assets/sidebar/admin-icon.svg';
import AdminIcon from '@assets/activityfeed/admin.svg';
import WhitelistedCallerIcon from '@assets/sidebar/whitelisted-caller-icon.svg';
import Image from 'next/image';
import { FaAngleDown } from 'react-icons/fa';
import { Popover, PopoverContent, PopoverTrigger } from '../../Popover/Popover';
import styles from './ActivityFeedNavbar.module.scss';
import { useSidebar } from '../../Sidebar/Sidebar';

function ActivityFeedNavbar({ gov2LatestPosts, currentTab, setCurrentTab }: { gov2LatestPosts: IPostListing[]; currentTab: string; setCurrentTab: (tab: string) => void }) {
	const Network = getCurrentNetwork();
	const { isMobile } = useSidebar();
	const t = useTranslations();
	const trackInfo = NETWORKS_DETAILS[Network as ENetwork].tracks;
	const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

	const ADMIN_CATEGORY = t('ActivityFeed.Navbar.Admin');
	const ALL_CATEGORY = t('ActivityFeed.Navbar.All');
	const ROOT_CATEGORY = t('ActivityFeed.Navbar.Root');
	const WISH_FOR_CHANGE_CATEGORY = t('ActivityFeed.Navbar.Wish For Change');
	const GOVERNANCE_CATEGORY = t('ActivityFeed.Navbar.Governance');
	const TREASURY_CATEGORY = t('ActivityFeed.Navbar.Treasury');
	const WHITELIST_CATEGORY = t('ActivityFeed.Navbar.Whitelist');

	const categoryIconPaths = {
		[ALL_CATEGORY]: Home,
		[ROOT_CATEGORY]: RootIcon,
		[WISH_FOR_CHANGE_CATEGORY]: WishForChangeIcon,
		[ADMIN_CATEGORY]: AdminIcon,
		[GOVERNANCE_CATEGORY]: GovernanceIcon,
		[TREASURY_CATEGORY]: TreasuryIcon,
		[WHITELIST_CATEGORY]: WhitelistedCallerIcon
	};

	// Dynamically create category structure from trackInfo
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

			// Root category
			if (origin === EPostOrigin.ROOT) {
				structure[ROOT_CATEGORY].push(origin);
			}
			// Wish For Change category
			else if (origin === EPostOrigin.WISH_FOR_CHANGE) {
				structure[WISH_FOR_CHANGE_CATEGORY].push(origin);
			}
			// Admin category
			else if (origin.includes('ADMIN') || origin.includes(EPostOrigin.STAKING_ADMIN) || origin.includes(EPostOrigin.AUCTION_ADMIN)) {
				structure[ADMIN_CATEGORY].push(origin);
			}
			// Governance category
			else if (
				origin.includes(EPostOrigin.LEASE_ADMIN) ||
				origin.includes(EPostOrigin.GENERAL_ADMIN) ||
				origin.includes(EPostOrigin.REFERENDUM_CANCELLER) ||
				origin.includes(EPostOrigin.REFERENDUM_KILLER)
			) {
				structure[GOVERNANCE_CATEGORY].push(origin);
			}
			// Treasury category
			else if (
				origin.includes(EPostOrigin.BIG_SPENDER) ||
				origin.includes(EPostOrigin.MEDIUM_SPENDER) ||
				origin.includes(EPostOrigin.SMALL_SPENDER) ||
				origin.includes(EPostOrigin.BIG_TIPPER) ||
				origin.includes(EPostOrigin.SMALL_TIPPER) ||
				origin.includes(EPostOrigin.TREASURER)
			) {
				structure[TREASURY_CATEGORY].push(origin);
			}
			// Whitelist category
			else if (origin.includes(EPostOrigin.WHITELISTED_CALLER) || origin.includes(EPostOrigin.FELLOWSHIP_ADMIN)) {
				structure[WHITELIST_CATEGORY].push(origin);
			}
		});

		// Remove empty categories
		return Object.fromEntries(Object.entries(structure).filter(([_, tracks]) => tracks.length > 0 || _ === 'All'));
	}, [trackInfo]);

	const formatTrackName = (name: string) => {
		return name.replace(/([A-Z])/g, ' $1').trim();
	};

	const handleCategoryClick = (category: string) => {
		if (category === ALL_CATEGORY) {
			setCurrentTab(ALL_CATEGORY);
		} else if ([ROOT_CATEGORY, WISH_FOR_CHANGE_CATEGORY].includes(category)) {
			setCurrentTab(category);
		} else {
			setExpandedCategory(expandedCategory === category ? null : category);
		}
	};

	const getPostCount = (origin: EPostOrigin) => {
		const count = gov2LatestPosts?.filter((post: IPostListing) => post?.onChainInfo?.origin === origin).length || 0;
		return count > 0 ? `(${count})` : '';
	};

	const isActiveCategory = (category: string, tracks: EPostOrigin[]) => {
		if (currentTab === category) return true;
		return tracks.some((track) => currentTab === track);
	};

	return (
		<div className={`${styles.container} ${isMobile ? styles.mobileContainer : ''}`}>
			{Object.entries(categoryStructure).map(([category, tracks]) => (
				<Popover key={category}>
					<PopoverTrigger asChild>
						<div>
							<button
								type='button'
								className={`${styles.popoverTrigger} ${isActiveCategory(category, tracks) ? 'bg-activity_selected_tab dark:text-white' : ''}`}
								onClick={() => handleCategoryClick(category)}
							>
								<span className='flex items-center gap-1.5 whitespace-nowrap'>
									<Image
										src={categoryIconPaths[category]}
										alt={category}
										width={20}
										height={20}
										className='dark:brightness-0 dark:invert'
									/>

									{category}
								</span>
								{tracks?.length > 1 && <FaAngleDown />}
							</button>
						</div>
					</PopoverTrigger>
					{expandedCategory === category && tracks.length > 0 && (
						<PopoverContent
							sideOffset={5}
							className={styles.popoverContent}
						>
							<div className='w-full'>
								{tracks.map((track) => (
									<div key={track}>
										<button
											type='button'
											className={styles.trackName}
											onClick={() => setCurrentTab(track)}
										>
											{formatTrackName(track)} {getPostCount(track)}
										</button>
									</div>
								))}
							</div>
						</PopoverContent>
					)}
				</Popover>
			))}
		</div>
	);
}

export default ActivityFeedNavbar;
