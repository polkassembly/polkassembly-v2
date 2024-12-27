// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { EListingTab, EProposalStatus, EProposalType, IPostListing } from '@/_shared/types';
import { Popover, PopoverTrigger, PopoverContent } from '@ui/Popover/Popover';
import { useRouter, useSearchParams } from 'next/navigation';
import { BiSort } from 'react-icons/bi';
import { FaFilter } from 'react-icons/fa6';
import { MdSearch } from 'react-icons/md';
import { useFetchListingData } from '@/app/_atoms/listingPageAtom';
import { IoMdTrendingUp } from 'react-icons/io';
import { LoadingSpinner } from '../../LoadingSpinner';
import ListingTab from '../ListingTab/ListingTab';
import ExternalTab from '../ExternalTab';
import styles from './ListingPage.module.scss';

// Constants
enum EListingTabState {
	INTERNAL_PROPOSALS = 'INTERNAL_PROPOSALS',
	EXTERNAL_PROPOSALS = 'EXTERNAL_PROPOSALS'
}

const STATUSES = [
	EProposalStatus.Cancelled,
	EProposalStatus.Confirmed,
	EProposalStatus.ConfirmAborted,
	EProposalStatus.ConfirmStarted,
	EProposalStatus.Deciding,
	EProposalStatus.Executed,
	EProposalStatus.ExecutionFailed,
	EProposalStatus.Killed,
	EProposalStatus.Rejected,
	EProposalStatus.Submitted,
	EProposalStatus.TimedOut
];

const TAGS = ['bounty', 'treasury', 'smart contract', 'polkadot', 'Network', 'Governance', 'Proposal', 'Test'];

interface ListingPageProps {
	proposalType: string;
	origins?: string[];
	title?: string;
	description?: string;
}

function ListingPage({ proposalType, origins, title, description }: ListingPageProps) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const fetchListingData = useFetchListingData();

	const initialPage = parseInt(searchParams.get('page') || '1', 10);
	const initialTrackStatus = searchParams.get('trackStatus') || 'all';

	const [state, setState] = useState({
		activeTab: EListingTabState.INTERNAL_PROPOSALS,
		currentPage: initialPage,
		filterActive: false,
		selectedStatuses: initialTrackStatus === 'all' ? [] : (initialTrackStatus.split(',') as EProposalStatus[]),
		tagSearchTerm: '',
		selectedTags: [] as string[],
		listingData: [] as IPostListing[],
		totalCount: 0,
		isLoading: false,
		error: null as Error | null
	});

	const tabNames =
		proposalType === EProposalType.DISCUSSION
			? { INTERNAL_PROPOSALS: EListingTab.POLKASSEMBLY, EXTERNAL_PROPOSALS: EListingTab.EXTERNAL }
			: { INTERNAL_PROPOSALS: EListingTab.REFERENDA, EXTERNAL_PROPOSALS: EListingTab.ANALYTICS };

	const filteredTags = TAGS.filter((tag) => tag.toLowerCase().includes(state.tagSearchTerm.toLowerCase()));

	const updateUrlParams = useCallback(
		(page: number, statuses: EProposalStatus[]) => {
			const params = new URLSearchParams(searchParams.toString());
			params.set('page', page.toString());
			params.set('trackStatus', statuses.length > 0 ? statuses.join(',') : 'all');
			router.push(`?${params.toString()}`, { scroll: false });
		},
		[router, searchParams]
	);

	const fetchData = useCallback(async () => {
		setState((prev) => ({ ...prev, isLoading: true }));
		try {
			const { data, totalCount } = await fetchListingData({
				proposalType,
				currentPage: state.currentPage,
				selectedStatuses: state.selectedStatuses,
				selectedTags: state.selectedTags,
				origins
			});
			setState((prev) => ({
				...prev,
				listingData: data,
				totalCount,
				isLoading: false
			}));
		} catch (error) {
			setState((prev) => ({
				...prev,
				error,
				isLoading: false
			}));
		}
	}, [fetchListingData, proposalType, state.currentPage, state.selectedStatuses, state.selectedTags, origins]);

	const handlePageChange = useCallback(
		(page: number) => {
			setState((prev) => ({ ...prev, currentPage: page }));
			updateUrlParams(page, state.selectedStatuses);
		},
		[updateUrlParams, state.selectedStatuses]
	);

	const handleStatusToggle = useCallback(
		(status: EProposalStatus) => {
			setState((prev) => {
				const newStatuses = prev.selectedStatuses.includes(status) ? prev.selectedStatuses.filter((s) => s !== status) : [...prev.selectedStatuses, status];

				updateUrlParams(prev.currentPage, newStatuses);
				return { ...prev, selectedStatuses: newStatuses };
			});
		},
		[updateUrlParams]
	);

	const handleTagToggle = useCallback((tag: string) => {
		setState((prev) => ({
			...prev,
			selectedTags: prev.selectedTags.includes(tag) ? prev.selectedTags.filter((t) => t !== tag) : [...prev.selectedTags, tag]
		}));
	}, []);

	useEffect(() => {
		if (state.activeTab === EListingTabState.INTERNAL_PROPOSALS) {
			fetchData();
		}
	}, [state.activeTab, state.selectedStatuses, state.currentPage, state.selectedTags, fetchData]);

	useEffect(() => {
		const page = parseInt(searchParams.get('page') || '1', 10);
		const trackStatus = searchParams.get('trackStatus') || 'all';

		setState((prev) => ({
			...prev,
			currentPage: page,
			selectedStatuses: trackStatus === 'all' ? [] : (trackStatus.split(',') as EProposalStatus[])
		}));
	}, [searchParams]);

	if (state.error) return <p>Error: {state.error.message}</p>;

	const renderHeader = () => (
		<div className={styles.header}>
			<div>
				<h1 className={styles.title}>
					{title} ({state.totalCount})
				</h1>
				<p className={styles.subtitle}>{description}</p>
			</div>
			<button
				type='button'
				className={styles.button}
			>
				<span className='text-xl'>+</span>
				<span className='whitespace-nowrap text-sm'>Create {proposalType === EProposalType.DISCUSSION ? 'Post' : 'Proposal'}</span>
			</button>
		</div>
	);

	const renderFilterContent = () => (
		<div className='p-4'>
			<h3 className='text-sm font-semibold text-filter_dropdown'>STATUS</h3>
			<div className='mt-2 max-h-24 space-y-1 overflow-y-auto'>
				{STATUSES.map((status) => (
					<span
						key={status}
						className='flex items-center'
					>
						<input
							type='checkbox'
							className='mr-2'
							checked={state.selectedStatuses.includes(status)}
							onChange={() => handleStatusToggle(status)}
						/>
						<span className='text-sm text-filter_dropdown'>{status}</span>
					</span>
				))}
			</div>

			<h3 className='mt-4 text-sm font-semibold text-filter_dropdown'>Tags</h3>
			<div className='relative mt-2'>
				<input
					type='text'
					placeholder='Search'
					value={state.tagSearchTerm}
					onChange={(e) => setState((prev) => ({ ...prev, tagSearchTerm: e.target.value }))}
					className={styles.searchbar}
				/>
				<MdSearch className='absolute right-3 top-1/2 -translate-y-1/2 transform text-filter_dropdown' />
			</div>

			<div className='mt-2 max-h-24 space-y-1 overflow-y-auto'>
				{filteredTags.map((tag) => (
					<span
						key={tag}
						className='flex items-center'
					>
						<input
							type='checkbox'
							className='mr-2'
							checked={state.selectedTags.includes(tag)}
							onChange={() => handleTagToggle(tag)}
						/>
						<span className='flex items-center gap-1 text-sm text-filter_dropdown'>
							<IoMdTrendingUp /> {tag}
						</span>
					</span>
				))}
			</div>
		</div>
	);

	return (
		<div>
			<div className={styles.container}>
				{renderHeader()}
				<div className={styles.tabs}>
					<div className='flex space-x-6'>
						{Object.entries(tabNames).map(([key, value]) => (
							<button
								key={key}
								type='button'
								className={`${styles['tab-button']} ${state.activeTab === key ? styles['tab-button-active'] : ''}`}
								onClick={() => setState((prev) => ({ ...prev, activeTab: key as EListingTabState }))}
							>
								{value}
							</button>
						))}
					</div>
					<div className='flex gap-4 pb-3 text-sm text-gray-700'>
						<Popover onOpenChange={(open) => setState((prev) => ({ ...prev, filterActive: open }))}>
							<PopoverTrigger asChild>
								<div
									className={`${styles.filter} ${state.filterActive ? 'bg-gray-200 text-navbar_border' : ''}`}
									role='button'
									tabIndex={0}
								>
									<span className={state.filterActive ? styles.selectedicon : ''}>
										<FaFilter />
									</span>
									<span className='hidden lg:block'>Filter</span>
								</div>
							</PopoverTrigger>
							<PopoverContent
								sideOffset={5}
								className={styles.popoverContent}
							>
								{renderFilterContent()}
							</PopoverContent>
						</Popover>
						<p className={styles.filter}>
							<span className='hidden lg:block'>Sort By</span> <BiSort />
						</p>
					</div>
				</div>
			</div>
			<div className={styles.content}>
				{state.isLoading ? (
					<LoadingSpinner />
				) : (
					<div>
						{state.activeTab === EListingTabState.INTERNAL_PROPOSALS ? (
							<ListingTab
								data={state.listingData}
								totalCount={state.totalCount}
								currentPage={state.currentPage}
								setCurrentPage={handlePageChange}
							/>
						) : (
							<ExternalTab />
						)}
					</div>
				)}
			</div>
		</div>
	);
}

export default ListingPage;
