// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { ENetwork, EPostOrigin } from '@/_shared/types';
import { useMemo, useEffect, useRef, useState, useCallback } from 'react';
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
import { useSidebar } from '@/app/_shared-components/Sidebar/Sidebar';
import { BsThreeDots } from '@react-icons/all-files/bs/BsThreeDots';
import { FaChevronLeft } from '@react-icons/all-files/fa/FaChevronLeft';
import { FaChevronRight } from '@react-icons/all-files/fa/FaChevronRight';
import { convertCamelCaseToTitleCase } from '@/_shared/_utils/convertCamelCaseToTitleCase';
import styles from './ActivityFeedNavbar.module.scss';

function ActivityFeedNavbar({ currentTab, setCurrentTab }: { currentTab: EPostOrigin | 'All'; setCurrentTab: (tab: EPostOrigin | 'All') => void }) {
	const network = getCurrentNetwork();
	const t = useTranslations();
	const trackInfo = NETWORKS_DETAILS[network as ENetwork].trackDetails;
	const containerRef = useRef<HTMLDivElement>(null);
	const { state: sidebarState } = useSidebar();
	const [showLeftArrow, setShowLeftArrow] = useState(false);
	const [showRightArrow, setShowRightArrow] = useState(false);

	const CATEGORIES = useMemo(
		() => ({
			ALL: t('ActivityFeed.Navbar.All'),
			ROOT: t('ActivityFeed.Navbar.Root'),
			WISH_FOR_CHANGE: t('ActivityFeed.Navbar.Wish For Change'),
			ADMIN: t('ActivityFeed.Navbar.Admin'),
			GOVERNANCE: t('ActivityFeed.Navbar.Governance'),
			TREASURY: t('ActivityFeed.Navbar.Treasury'),
			WHITELIST: t('ActivityFeed.Navbar.Whitelist')
		}),
		[t]
	);

	const categoryIconMap = useMemo(
		() => ({
			[CATEGORIES.ALL]: Home,
			[CATEGORIES.ROOT]: RootIcon,
			[CATEGORIES.WISH_FOR_CHANGE]: WishForChangeIcon,
			[CATEGORIES.ADMIN]: AdminIcon,
			[CATEGORIES.GOVERNANCE]: GovernanceIcon,
			[CATEGORIES.TREASURY]: TreasuryIcon,
			[CATEGORIES.WHITELIST]: WhitelistedCallerIcon
		}),
		[CATEGORIES]
	);

	const categoryStructure = useMemo(() => {
		const structure: Record<string, EPostOrigin[]> = Object.values(CATEGORIES).reduce(
			(acc, category) => ({
				...acc,
				[category]: []
			}),
			{}
		);

		Object.entries(trackInfo).forEach(([key]) => {
			const origin = key as EPostOrigin;

			if (origin === EPostOrigin.ROOT) {
				structure[CATEGORIES.ROOT].push(origin);
			} else if (origin === EPostOrigin.WISH_FOR_CHANGE) {
				structure[CATEGORIES.WISH_FOR_CHANGE].push(origin);
			} else if (origin.includes('ADMIN') || origin.includes(EPostOrigin.STAKING_ADMIN) || origin.includes(EPostOrigin.AUCTION_ADMIN)) {
				structure[CATEGORIES.ADMIN].push(origin);
			} else if (
				origin.includes(EPostOrigin.LEASE_ADMIN) ||
				origin.includes(EPostOrigin.GENERAL_ADMIN) ||
				origin.includes(EPostOrigin.REFERENDUM_CANCELLER) ||
				origin.includes(EPostOrigin.REFERENDUM_KILLER)
			) {
				structure[CATEGORIES.GOVERNANCE].push(origin);
			} else if (
				origin.includes(EPostOrigin.BIG_SPENDER) ||
				origin.includes(EPostOrigin.MEDIUM_SPENDER) ||
				origin.includes(EPostOrigin.SMALL_SPENDER) ||
				origin.includes(EPostOrigin.BIG_TIPPER) ||
				origin.includes(EPostOrigin.SMALL_TIPPER) ||
				origin.includes(EPostOrigin.TREASURER)
			) {
				structure[CATEGORIES.TREASURY].push(origin);
			} else if (origin.includes(EPostOrigin.WHITELISTED_CALLER) || origin.includes(EPostOrigin.FELLOWSHIP_ADMIN)) {
				structure[CATEGORIES.WHITELIST].push(origin);
			}
		});

		return Object.fromEntries(Object.entries(structure).filter(([category, tracks]) => tracks.length > 0 || category === CATEGORIES.ALL));
	}, [trackInfo, CATEGORIES]);

	const { visibleTabs, overflowTabs } = useMemo(() => {
		const categoryEntries = Object.entries(categoryStructure);
		const totalCategories = categoryEntries.length;
		const maxVisibleTabs = sidebarState === 'expanded' ? 6 : 7;
		if (totalCategories <= maxVisibleTabs) {
			return {
				visibleTabs: categoryEntries,
				overflowTabs: []
			};
		}

		const activeTabIndex = categoryEntries.findIndex(([category, tracks]) => currentTab === category || tracks.includes(currentTab as EPostOrigin));
		const visibleEntries = categoryEntries.slice(0, maxVisibleTabs);
		let overflowEntries = categoryEntries.slice(maxVisibleTabs);

		if (activeTabIndex >= maxVisibleTabs) {
			const activeEntry = categoryEntries[activeTabIndex];
			const lastVisible = visibleEntries.pop();
			if (lastVisible) overflowEntries.unshift(lastVisible);
			visibleEntries.push(activeEntry);
			overflowEntries = overflowEntries.filter(([category]) => category !== activeEntry[0]);
		}

		return {
			visibleTabs: visibleEntries,
			overflowTabs: overflowEntries
		};
	}, [categoryStructure, currentTab, sidebarState]);

	const handleCategoryClick = (category: string) => {
		if (category === CATEGORIES.ALL) {
			setCurrentTab('All');
		} else if ([CATEGORIES.ROOT, CATEGORIES.WISH_FOR_CHANGE].includes(category)) {
			setCurrentTab(CATEGORIES.ROOT === category ? EPostOrigin.ROOT : EPostOrigin.WISH_FOR_CHANGE);
		}
	};

	const isActiveCategory = (category: string, tracks: EPostOrigin[]) => {
		if (currentTab === category) return true;
		return tracks.some((track) => currentTab === track);
	};

	const scrollToActiveTab = () => {
		if (containerRef.current) {
			const container = containerRef.current;
			const activeElement = container.querySelector('.bg-activity_selected_tab');

			if (activeElement) {
				const containerRect = container.getBoundingClientRect();
				const activeRect = activeElement.getBoundingClientRect();
				const scrollLeft = activeRect.left - containerRect.left - (containerRect.width - activeRect.width) / 2;
				container.scrollTo({
					left: container.scrollLeft + scrollLeft,
					behavior: 'smooth'
				});
			}
		}
	};

	const checkScroll = useCallback(() => {
		if (containerRef.current) {
			const container = containerRef.current;
			const { scrollLeft, scrollWidth, clientWidth } = container;

			setShowLeftArrow(scrollLeft > 10);
			setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
		}
	}, []);

	const handleScroll = (direction: 'left' | 'right') => {
		if (containerRef.current) {
			const container = containerRef.current;
			const scrollAmount = container.clientWidth * 0.6;
			const targetScroll = direction === 'left' ? container.scrollLeft - scrollAmount : container.scrollLeft + scrollAmount;

			container.scrollTo({
				left: targetScroll,
				behavior: 'smooth'
			});
		}
	};

	useEffect(() => {
		scrollToActiveTab();
		const currentRef = containerRef.current;

		if (currentRef) {
			checkScroll();
			currentRef.addEventListener('scroll', checkScroll);
		}

		return () => {
			if (currentRef) {
				currentRef.removeEventListener('scroll', checkScroll);
			}
		};
	}, [currentTab, checkScroll]);

	useEffect(() => {
		const handleResize = () => {
			checkScroll();
		};

		window.addEventListener('resize', handleResize);
		return () => {
			window.removeEventListener('resize', handleResize);
		};
	}, [checkScroll]);

	const renderCategoryTab = (category: string, tracks: EPostOrigin[], isOverflow = false) => {
		const isSimpleCategory = tracks.length === 0 || category === CATEGORIES.ROOT || category === CATEGORIES.WISH_FOR_CHANGE;
		const baseClassName = isOverflow ? styles.overflowCategory : styles.popoverTrigger;
		const activeClass = isActiveCategory(category, tracks) ? styles.activeTab : '';

		if (isSimpleCategory) {
			return (
				<button
					type='button'
					className={cn(baseClassName, activeClass)}
					onClick={() => handleCategoryClick(category)}
				>
					<span className='flex items-center gap-2'>
						<Image
							src={categoryIconMap[category]}
							alt={category}
							width={20}
							height={20}
							className={cn(styles.darkIcon)}
							priority
						/>
						<span className='text-sm'>{category}</span>
					</span>
				</button>
			);
		}

		return (
			<DropdownMenu modal={false}>
				<DropdownMenuTrigger
					className={cn(baseClassName, activeClass)}
					ArrowPosition={isOverflow ? 'right' : 'down'}
					noArrow={!isOverflow}
				>
					<span className='flex items-center gap-2'>
						<Image
							src={categoryIconMap[category]}
							alt={category}
							width={20}
							height={20}
							className={cn(styles.darkIcon)}
							priority
						/>
						<span className='text-sm text-basic_text'>{category}</span>
					</span>
				</DropdownMenuTrigger>
				<DropdownMenuContent
					align={isOverflow ? 'end' : 'start'}
					side={isOverflow ? 'right' : 'bottom'}
					sideOffset={4}
					className={styles.popoverContent}
					avoidCollisions
				>
					{tracks.map((track) => (
						<DropdownMenuItem
							key={track}
							className={cn(styles.trackName, currentTab === track && styles.activeTab)}
							onSelect={() => setCurrentTab(track)}
						>
							{convertCamelCaseToTitleCase(track)}
						</DropdownMenuItem>
					))}
				</DropdownMenuContent>
			</DropdownMenu>
		);
	};

	return (
		<div className='mb-5 w-full'>
			<div className='relative'>
				<div
					className={cn(styles.container, 'lg:hidden')}
					ref={containerRef}
				>
					{Object.entries(categoryStructure).map(([category, tracks]) => (
						<div
							key={category}
							className={styles.navItem}
						>
							{renderCategoryTab(category, tracks)}
						</div>
					))}
				</div>

				{showLeftArrow && (
					<button
						type='button'
						className={cn(styles.scrollArrow, styles.left, 'lg:hidden')}
						onClick={() => handleScroll('left')}
						aria-label='Scroll left'
					>
						<FaChevronLeft className='text-wallet_btn_text' />
					</button>
				)}

				{showRightArrow && (
					<button
						type='button'
						className={cn(styles.scrollArrow, styles.right, 'lg:hidden')}
						onClick={() => handleScroll('right')}
						aria-label='Scroll right'
					>
						<FaChevronRight className='text-wallet_btn_text' />
					</button>
				)}
			</div>

			<div className={cn(styles.container, 'hidden lg:flex lg:overflow-visible')}>
				{visibleTabs.map(([category, tracks]) => (
					<div
						key={category}
						className={styles.navItem}
					>
						{renderCategoryTab(category, tracks)}
					</div>
				))}

				{overflowTabs.length > 0 && (
					<div className={styles.navItem}>
						<DropdownMenu modal={false}>
							<DropdownMenuTrigger
								noArrow
								className={cn(styles.popoverTrigger, styles.moreMenu)}
							>
								<span className='flex items-center gap-2'>
									<span className='text-sm font-medium'>
										<BsThreeDots className='text-bg_pink' />
									</span>
								</span>
							</DropdownMenuTrigger>
							<DropdownMenuContent
								align='start'
								side='bottom'
								sideOffset={4}
								className={styles.popoverContent}
								avoidCollisions
							>
								{overflowTabs.map(([category, tracks]) => (
									<div
										key={category}
										className='mb-1'
									>
										{renderCategoryTab(category, tracks, true)}
									</div>
								))}
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				)}
			</div>
		</div>
	);
}

export default ActivityFeedNavbar;
