// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { ENetwork, EPostOrigin, IPostListing } from '@/_shared/types';
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { FaAngleDown } from 'react-icons/fa';
import { Popover, PopoverContent, PopoverTrigger } from '../../Popover/Popover';
import styles from './ActivityFeedNavbar.module.scss';
import { Icon, IconName } from '../../Icon';

function ActivityFeedNavbar({
	gov2LatestPosts,
	currentTab,
	setCurrentTab
}: {
	gov2LatestPosts: IPostListing[];
	currentTab: EPostOrigin | 'All';
	setCurrentTab: (tab: EPostOrigin | 'All') => void;
}) {
	const network = getCurrentNetwork();
	const t = useTranslations();
	const trackInfo = NETWORKS_DETAILS[network as ENetwork].tracks;
	const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
	const containerRef = useRef<HTMLDivElement>(null);

	const ADMIN_CATEGORY = t('ActivityFeed.Navbar.Admin');
	const ALL_CATEGORY = t('ActivityFeed.Navbar.All');
	const ROOT_CATEGORY = t('ActivityFeed.Navbar.Root');
	const WISH_FOR_CHANGE_CATEGORY = t('ActivityFeed.Navbar.Wish For Change');
	const GOVERNANCE_CATEGORY = t('ActivityFeed.Navbar.Governance');
	const TREASURY_CATEGORY = t('ActivityFeed.Navbar.Treasury');
	const WHITELIST_CATEGORY = t('ActivityFeed.Navbar.Whitelist');

	const categoryIconPaths: Record<string, IconName> = useMemo(
		() => ({
			[ALL_CATEGORY]: 'activityfeed/All' as IconName,
			[ROOT_CATEGORY]: 'sidebar/root-icon' as IconName,
			[WISH_FOR_CHANGE_CATEGORY]: 'sidebar/wish-for-change-icon' as IconName,
			[ADMIN_CATEGORY]: 'activityfeed/admin' as IconName,
			[GOVERNANCE_CATEGORY]: 'sidebar/admin-icon' as IconName,
			[TREASURY_CATEGORY]: 'sidebar/treasury-icon' as IconName,
			[WHITELIST_CATEGORY]: 'sidebar/whitelisted-caller-icon' as IconName
		}),
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

		// Remove empty categories
		return Object.fromEntries(Object.entries(structure).filter(([_, tracks]) => tracks.length > 0 || _ === t('ActivityFeed.Navbar.All')));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [trackInfo, t]);

	const formatTrackName = (name: string) => {
		return name.replace(/([A-Z])/g, ' $1').trim();
	};

	const handleCategoryClick = (category: string) => {
		if (category === ALL_CATEGORY) {
			setCurrentTab('All');
		} else if ([ROOT_CATEGORY, WISH_FOR_CHANGE_CATEGORY].includes(category)) {
			setCurrentTab(category as EPostOrigin);
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
					<Popover key={category}>
						<PopoverTrigger asChild>
							<div className='flex-shrink-0'>
								<button
									type='button'
									className={`${styles.popoverTrigger} ${isActiveCategory(category, tracks) ? 'bg-activity_selected_tab' : ''}`}
									onClick={() => handleCategoryClick(category)}
								>
									<span className='flex items-center whitespace-nowrap'>
										<Icon
											name={categoryIconPaths[category as IconName]}
											className='h-5 w-5 dark:brightness-0 dark:invert'
										/>
										<span className='ml-2'>{category}</span>
										{tracks?.length > 1 && (
											<span className='ml-1'>
												<FaAngleDown />
											</span>
										)}
									</span>
								</button>
							</div>
						</PopoverTrigger>
						{expandedCategory === category && tracks && tracks.length > 0 && (
							<PopoverContent
								sideOffset={5}
								className={styles.popoverContent}
							>
								<div className='w-full'>
									{tracks.map((track) => (
										<div key={track}>
											<button
												type='button'
												className={`${styles.trackName} ${currentTab === track ? 'bg-activity_selected_tab' : ''}`}
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
		</div>
	);
}

export default ActivityFeedNavbar;
