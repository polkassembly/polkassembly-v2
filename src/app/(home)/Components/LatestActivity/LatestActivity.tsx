// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { EPostOrigin, IGenericListingResponse, IPostListing } from '@/_shared/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/_shared-components/Tabs';
import { useTranslations } from 'next-intl';
import { useState, useRef, useEffect } from 'react';
import { parseCamelCase } from '@/app/_client-utils/parseCamelCase';
import { FaFilter } from '@react-icons/all-files/fa/FaFilter';
import { MdSort } from '@react-icons/all-files/md/MdSort';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import DiscussionsTab from './DiscussionsTab';
import TrackTabs from './TrackTabs';
import ActivityList from './ActivityList';
import ActivityStats from './ActivityStats';

enum EOverviewTabs {
	All = 'all',
	Discussion = 'discussion'
}

function LatestActivity({ allTracksData }: { allTracksData: IGenericListingResponse<IPostListing> | null }) {
	const t = useTranslations('Overview');
	const network = getCurrentNetwork();
	const tabsListRef = useRef<HTMLDivElement>(null);
	const TAB_TRIGGER_CLASS =
		'text-xm px-4 py-1.5 rounded-lg border border-transparent font-medium text-text_primary data-[state=active]:border-pink-500 data-[state=active]:text-pink-600 data-[state=active]:bg-pink-50 dark:data-[state=active]:bg-pink-900/10 mr-2';

	const [selectedTab, setSelectedTab] = useState<string>(EOverviewTabs.All);
	const [showLeftArrow, setShowLeftArrow] = useState(false);
	const [showRightArrow, setShowRightArrow] = useState(true);
	const tracks = NETWORKS_DETAILS[`${network}`]?.trackDetails || {};
	const trackKeys = Object.keys(tracks);

	const scrollToTab = (tabValue: string) => {
		if (!tabsListRef.current) return;

		const tabsList = tabsListRef.current;
		const tabElement = tabsList.querySelector(`[data-value="${tabValue}"]`);

		if (tabElement) {
			const tabPosition = tabElement.getBoundingClientRect().left;
			const tabsListPosition = tabsList.getBoundingClientRect().left;
			const scrollLeft = tabPosition - tabsListPosition + tabsList.scrollLeft - 10;

			tabsList.scrollTo({
				left: scrollLeft,
				behavior: 'smooth'
			});
		}
	};

	const handleTabSelect = (tabValue: string) => {
		setSelectedTab(tabValue);
		scrollToTab(tabValue);
	};

	const checkScroll = () => {
		if (tabsListRef.current) {
			const { scrollLeft, scrollWidth, clientWidth } = tabsListRef.current;
			setShowLeftArrow(scrollLeft > 0);
			setShowRightArrow(Math.ceil(scrollLeft + clientWidth) < scrollWidth);
		}
	};

	useEffect(() => {
		const tabsList = tabsListRef.current;
		if (tabsList) {
			tabsList.addEventListener('scroll', checkScroll);
			checkScroll();
		}
		return () => {
			if (tabsList) {
				tabsList.removeEventListener('scroll', checkScroll);
			}
		};
	}, []);

	const handleScrollLeft = () => {
		if (tabsListRef.current) {
			tabsListRef.current.scrollBy({ left: -200, behavior: 'smooth' });
		}
	};

	const handleScrollRight = () => {
		if (tabsListRef.current) {
			tabsListRef.current.scrollBy({ left: 200, behavior: 'smooth' });
		}
	};

	return (
		<div className='flex flex-col gap-6 rounded-xl border border-border_grey bg-bg_modal p-6 shadow-sm'>
			{/* Header */}
			<div className='flex items-center justify-between'>
				<h2 className='text-xl font-bold text-text_primary'>
					{t('latestActivity')} <span className='text-wallet_btn_text'>({allTracksData?.totalCount || 0})</span>
				</h2>
				<div className='flex gap-2'>
					<button
						type='button'
						className='flex h-9 w-9 items-center justify-center rounded border border-border_grey text-text_primary hover:bg-gray-50 dark:hover:bg-gray-800'
					>
						<FaFilter className='text-sm' />
					</button>
					<button
						type='button'
						className='flex h-9 w-9 items-center justify-center rounded border border-border_grey text-text_primary hover:bg-gray-50 dark:hover:bg-gray-800'
					>
						<MdSort className='text-lg' />
					</button>
				</div>
			</div>

			<ActivityStats />

			<Tabs
				value={selectedTab}
				onValueChange={handleTabSelect}
				className='w-full'
			>
				<div className='relative mb-4 w-full border-b border-border_grey'>
					<TabsList
						ref={tabsListRef}
						className='hide_scrollbar flex w-full justify-start overflow-x-auto pb-2'
					>
						<TabsTrigger
							className={TAB_TRIGGER_CLASS}
							value={EOverviewTabs.All}
							showBorder={false}
							data-value={EOverviewTabs.All}
						>
							{t('all')} <span className='ml-1 text-xs'>({allTracksData?.totalCount || 0})</span>
						</TabsTrigger>
						<TabsTrigger
							className={TAB_TRIGGER_CLASS}
							value={EOverviewTabs.Discussion}
							data-value={EOverviewTabs.Discussion}
							showBorder={false}
						>
							{t('discussion')}
						</TabsTrigger>
						{trackKeys.map((key) => (
							<TabsTrigger
								className={TAB_TRIGGER_CLASS}
								value={key}
								key={key}
								showBorder={false}
								data-value={key}
							>
								{parseCamelCase(key)}
								<span className='ml-1 text-xs text-wallet_btn_text'>(04)</span>
							</TabsTrigger>
						))}
						<div className='invisible w-12 flex-shrink-0' />
					</TabsList>

					{showLeftArrow && (
						<>
							<div className='pointer-events-none absolute left-0 top-0 z-10 h-full w-16 bg-gradient-to-r from-bg_modal' />
							<div className='absolute left-0 top-0 z-20 flex h-full items-start pt-1'>
								<button
									type='button'
									onClick={handleScrollLeft}
									className='flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-bg_modal hover:bg-bg_modal/80'
								>
									<ChevronLeft className='h-5 w-5 text-wallet_btn_text' />
								</button>
							</div>
						</>
					)}

					{showRightArrow && (
						<>
							<div className='pointer-events-none absolute right-8 top-0 z-10 h-full w-16 bg-gradient-to-l from-bg_modal' />
							<div className='absolute right-0 top-0 z-20 flex h-full items-start pt-1'>
								<button
									type='button'
									onClick={handleScrollRight}
									className='flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-bg_modal hover:bg-gray-100 dark:hover:bg-gray-800'
								>
									<ChevronRight className='h-5 w-5 text-wallet_btn_text' />
								</button>
							</div>
						</>
					)}
				</div>

				<TabsContent value={EOverviewTabs.All}>
					<ActivityList
						items={allTracksData?.items || []}
						isFetching={false}
						noActivityText={t('noactivity')}
						viewAllUrl='/latest-activity'
					/>
				</TabsContent>

				{/* "Discussion" Tab */}
				<TabsContent value={EOverviewTabs.Discussion}>
					<DiscussionsTab />
				</TabsContent>

				{/* Individual Track Tabs */}
				{Object.keys(tracks).map((track) => (
					<TabsContent
						key={track}
						value={track}
					>
						<TrackTabs trackName={track as EPostOrigin} />
					</TabsContent>
				))}
			</Tabs>
		</div>
	);
}

export default LatestActivity;
