// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import React, { useState } from 'react';
import { EListingTab, EProposalStatus, EProposalType, IGenericListingResponse, IPostListing } from '@/_shared/types';
import { Popover, PopoverTrigger, PopoverContent } from '@ui/Popover/Popover';
import { useRouter, useSearchParams } from 'next/navigation';
import { BiSort } from 'react-icons/bi';
import { FaFilter } from 'react-icons/fa6';
import { MdSearch } from 'react-icons/md';
import { IoMdTrendingUp } from 'react-icons/io';
import { useTranslations } from 'next-intl';
import ListingTab from '../ListingTab/ListingTab';
import ExternalTab from '../ExternalTab';
import styles from './ListingPage.module.scss';

// Constants
enum EListingTabState {
	INTERNAL_PROPOSALS = 'INTERNAL_PROPOSALS',
	EXTERNAL_PROPOSALS = 'EXTERNAL_PROPOSALS'
}

interface ListingPageProps {
	proposalType: string;
	title?: string;
	description?: string;
	initialData: IGenericListingResponse<IPostListing>;
}

function ListingPage({ proposalType, title, description, initialData }: ListingPageProps) {
	const router = useRouter();
	const t = useTranslations();
	const searchParams = useSearchParams();
	const initialPage = parseInt(searchParams.get('page') || '1', 10);
	const initialTrackStatus = searchParams.get('trackStatus') || 'all';

	const STATUSES = [
		t('ListingPage_Status.Cancelled'),
		t('ListingPage_Status.Confirmed'),
		t('ListingPage_Status.ConfirmAborted'),
		t('ListingPage_Status.ConfirmStarted'),
		t('ListingPage_Status.Deciding'),
		t('ListingPage_Status.Executed'),
		t('ListingPage_Status.ExecutionFailed'),
		t('ListingPage_Status.Killed'),
		t('ListingPage_Status.Rejected'),
		t('ListingPage_Status.Submitted'),
		t('ListingPage_Status.TimedOut')
	];

	// TODO: get tags from backend
	const TAGS = [
		t('ListingPage_Tags.bounty'),
		t('ListingPage_Tags.treasury'),
		t('ListingPage_Tags.smart contract'),
		t('ListingPage_Tags.polkadot'),
		t('ListingPage_Tags.Network'),
		t('ListingPage_Tags.Governance'),
		t('ListingPage_Tags.Proposal'),
		t('ListingPage_Tags.Test')
	];

	const [state, setState] = useState({
		activeTab: EListingTabState.INTERNAL_PROPOSALS,
		currentPage: initialPage,
		filterActive: false,
		selectedStatuses: initialTrackStatus === 'all' ? [] : (initialTrackStatus.split(',') as EProposalStatus[]),
		tagSearchTerm: '',
		selectedTags: [] as string[]
	});

	const tabNames =
		proposalType === EProposalType.DISCUSSION
			? { INTERNAL_PROPOSALS: EListingTab.POLKASSEMBLY, EXTERNAL_PROPOSALS: t('ListingTab.External') }
			: { INTERNAL_PROPOSALS: t('ListingTab.Referenda'), EXTERNAL_PROPOSALS: t('ListingTab.Analytics') };

	const filteredTags = TAGS.filter((tag) => tag.toLowerCase().includes(state.tagSearchTerm.toLowerCase()));

	const handlePageChange = (page: number) => {
		setState((prev) => ({ ...prev, currentPage: page }));
		const params = new URLSearchParams(searchParams.toString());
		params.set('page', page.toString());
		params.set('trackStatus', state.selectedStatuses.length > 0 ? state.selectedStatuses.join(',') : 'all');
		router.push(`?${params.toString()}`, { scroll: false });
	};

	const handleStatusToggle = (statusStr: string) => {
		setState((prev) => {
			const status = Object.values(EProposalStatus).find((s) => t(`ListingPage_Status.${s}`) === statusStr) as EProposalStatus;
			const newStatuses = prev.selectedStatuses.includes(status) ? prev.selectedStatuses.filter((s) => s !== status) : [...prev.selectedStatuses, status];

			const params = new URLSearchParams(searchParams.toString());
			params.set('trackStatus', newStatuses.length > 0 ? newStatuses.join(',') : 'all');
			router.push(`?${params.toString()}`, { scroll: false });

			return {
				...prev,
				selectedStatuses: newStatuses
			};
		});
	};

	const handleTagToggle = (tag: string) => {
		setState((prev) => ({
			...prev,
			selectedTags: prev.selectedTags.includes(tag) ? prev.selectedTags.filter((tags) => tags !== tag) : [...prev.selectedTags, tag]
		}));
	};

	const renderHeader = () => (
		<div className={styles.header}>
			<div>
				<h1 className={styles.title}>
					{title} ({initialData?.totalCount || 0})
				</h1>
				<p className={`${styles.subtitle} dark:text-white`}>{description}</p>
			</div>
			<button
				type='button'
				className={styles.button}
			>
				<span className='text-xl'>+</span>
				<span className='whitespace-nowrap text-sm'>{t(`CreateProposalDropdownButton.create${proposalType === EProposalType.DISCUSSION ? 'Post' : 'Proposal'}`)}</span>
			</button>
		</div>
	);

	const renderFilterContent = () => (
		<div className='p-4'>
			<h3 className='text-sm font-semibold uppercase text-filter_dropdown'>{t('CreateProposalDropdownButton.status')}</h3>
			<div className='mt-2 max-h-24 space-y-1 overflow-y-auto'>
				{STATUSES.map((status) => (
					<span
						key={status}
						className='flex items-center'
					>
						<input
							type='checkbox'
							className='mr-2'
							checked={state.selectedStatuses.some((s) => t(`ListingPage_Status.${s}`) === status)}
							onChange={() => handleStatusToggle(status)}
						/>
						<span className='text-sm text-filter_dropdown'>{status}</span>
					</span>
				))}
			</div>

			<h3 className='mt-4 text-sm font-semibold text-filter_dropdown'>{t('CreateProposalDropdownButton.tags')}</h3>
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
										<FaFilter className='text-text_primary' />
									</span>
									<span className='hidden text-text_primary lg:block'>{t('CreateProposalDropdownButton.filter')}</span>
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
							<span className='hidden text-text_primary lg:block'>{t('CreateProposalDropdownButton.sortBy')}</span> <BiSort className='text-text_primary' />
						</p>
					</div>
				</div>
			</div>
			<div className={styles.content}>
				<div>
					{state.activeTab === EListingTabState.INTERNAL_PROPOSALS ? (
						<ListingTab
							data={initialData?.items || []}
							totalCount={initialData?.totalCount || 0}
							currentPage={state.currentPage}
							setCurrentPage={handlePageChange}
						/>
					) : (
						<ExternalTab />
					)}
				</div>
			</div>
		</div>
	);
}

export default ListingPage;
