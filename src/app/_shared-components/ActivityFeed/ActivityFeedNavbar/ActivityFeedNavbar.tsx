// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { ENetwork, EPostOrigin, IPostListing } from '@/_shared/types';
import React, { useState, useMemo } from 'react';
import { FaAngleDown } from 'react-icons/fa';
import { Popover, PopoverContent, PopoverTrigger } from '../../Popover/Popover';
import styles from './ActivityFeedNavbar.module.scss';

function ActivityFeedNavbar({ gov2LatestPosts, currentTab, setCurrentTab }: { gov2LatestPosts: IPostListing[]; currentTab: string; setCurrentTab: (tab: string) => void }) {
	const Network = getCurrentNetwork();
	const trackInfo = NETWORKS_DETAILS[Network as ENetwork].tracks;
	const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

	// Dynamically create category structure from trackInfo
	const categoryStructure = useMemo(() => {
		const structure: Record<string, EPostOrigin[]> = {
			All: [],
			Root: [],
			'Wish For Change': [],
			Admin: [],
			Governance: [],
			Treasury: [],
			Whitelist: []
		};

		Object.entries(trackInfo).forEach(([key]) => {
			const origin = key as EPostOrigin;

			// Root category
			if (origin === EPostOrigin.ROOT) {
				structure.Root.push(origin);
			}
			// Wish For Change category
			else if (origin === EPostOrigin.WISH_FOR_CHANGE) {
				structure['Wish For Change'].push(origin);
			}
			// Admin category
			else if (origin.includes('ADMIN') || origin.includes(EPostOrigin.STAKING_ADMIN) || origin.includes(EPostOrigin.AUCTION_ADMIN)) {
				structure.Admin.push(origin);
			}
			// Governance category
			else if (
				origin.includes(EPostOrigin.LEASE_ADMIN) ||
				origin.includes(EPostOrigin.GENERAL_ADMIN) ||
				origin.includes(EPostOrigin.REFERENDUM_CANCELLER) ||
				origin.includes(EPostOrigin.REFERENDUM_KILLER)
			) {
				structure.Governance.push(origin);
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
				structure.Treasury.push(origin);
			}
			// Whitelist category
			else if (origin.includes(EPostOrigin.WHITELISTED_CALLER) || origin.includes(EPostOrigin.FELLOWSHIP_ADMIN)) {
				structure.Whitelist.push(origin);
			}
		});

		// Remove empty categories
		return Object.fromEntries(Object.entries(structure).filter(([_, tracks]) => tracks.length > 0 || _ === 'All'));
	}, [trackInfo]);

	const formatTrackName = (name: string) => {
		return name.replace(/([A-Z])/g, ' $1').trim();
	};

	const handleCategoryClick = (category: string) => {
		if (category === 'All') {
			setCurrentTab('All');
		} else if (['Root', 'Wish For Change'].includes(category)) {
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
		<div className={styles.container}>
			{Object.entries(categoryStructure).map(([category, tracks]) => (
				<Popover key={category}>
					<PopoverTrigger asChild>
						<div>
							<button
								type='button'
								className={`${styles.popoverTrigger} ${isActiveCategory(category, tracks) ? 'bg-sidebar_menu_bg text-btn_primary_background' : ''}`}
								onClick={() => handleCategoryClick(category)}
							>
								{category}
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
