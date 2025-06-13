// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import React, { useState } from 'react';
import { EListingTab, EPostOrigin, EProposalStatus, EProposalType, IGenericListingResponse, IPostListing } from '@/_shared/types';
import { Popover, PopoverTrigger, PopoverContent } from '@ui/Popover/Popover';
import { useSearchParams, useRouter } from 'next/navigation';
import { FaFilter } from '@react-icons/all-files/fa/FaFilter';
import { MdSearch } from '@react-icons/all-files/md/MdSearch';
import { IoMdTrendingUp } from '@react-icons/all-files/io/IoMdTrendingUp';
import { useTranslations } from 'next-intl';
import { useUser } from '@/hooks/useUser';
import Link from 'next/link';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { useQuery } from '@tanstack/react-query';
import ListingTab from '../ListingTab/ListingTab';
import ExternalTab from '../ExternalTab';
import styles from './ListingPage.module.scss';
import TrackAnalytics from '../TrackAnalytics/TrackAnalytics';

// Constants
enum EListingTabState {
	INTERNAL_PROPOSALS = 'INTERNAL_PROPOSALS',
	EXTERNAL_PROPOSALS = 'EXTERNAL_PROPOSALS'
}

interface ListingPageProps {
	proposalType: EProposalType;
	origin?: EPostOrigin;
	initialData: IGenericListingResponse<IPostListing>;
	statuses: EProposalStatus[];
	page: number;
}

const getStatuses = (proposalType: EProposalType) => {
	switch (proposalType) {
		case EProposalType.CHILD_BOUNTY:
			return [
				EProposalStatus.Added,
				EProposalStatus.Awarded,
				EProposalStatus.Claimed,
				EProposalStatus.Cancelled,
				EProposalStatus.CuratorProposed,
				EProposalStatus.CuratorUnassigned,
				EProposalStatus.CuratorAssigned
			];
		case EProposalType.DISCUSSION:
			return [];
		default:
			return [
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
	}
};

function ListingPage({ proposalType, origin, initialData, statuses, page }: ListingPageProps) {
	const router = useRouter();
	const t = useTranslations();
	const searchParams = useSearchParams();
	const { user } = useUser();

	const fetchListingData = async () => {
		const { data, error } = await NextApiClientService.fetchListingData({ proposalType, page, statuses, origins: origin ? [origin] : undefined });
		if (error || !data) {
			throw new Error(error?.message || 'Failed to fetch listing data');
		}
		return data;
	};

	const { data: listingData } = useQuery({
		queryKey: ['listingData', proposalType, page, [...statuses].sort().join(','), origin],
		queryFn: () => fetchListingData(),
		placeholderData: (previousData) => previousData || initialData,
		retry: true,
		refetchOnMount: true,
		refetchOnWindowFocus: true
	});

	const STATUSES = getStatuses(proposalType)?.map((status) => t(`ListingPage_Status.${status}`));

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
		currentPage: page,
		filterActive: false,
		selectedStatuses: statuses,
		tagSearchTerm: '',
		selectedTags: [] as string[]
	});

	const tabNames =
		proposalType === EProposalType.CHILD_BOUNTY
			? {}
			: proposalType === EProposalType.DISCUSSION
				? { INTERNAL_PROPOSALS: EListingTab.POLKASSEMBLY, EXTERNAL_PROPOSALS: t('ListingTab.External') }
				: proposalType === EProposalType.REFERENDUM_V2
					? { INTERNAL_PROPOSALS: t('ListingTab.Referenda'), EXTERNAL_PROPOSALS: t('ListingTab.Analytics') }
					: { INTERNAL_PROPOSALS: t('ListingTab.Referenda') };

	const filteredTags = TAGS.filter((tag) => tag.toLowerCase().includes(state.tagSearchTerm.toLowerCase()));

	const handleStatusToggle = (statusStr: string) => {
		setState((prev) => {
			const status = Object.values(EProposalStatus).find((s) => t(`ListingPage_Status.${s}`) === statusStr) as EProposalStatus;
			const newStatuses = prev.selectedStatuses.includes(status) ? prev.selectedStatuses.filter((s) => s !== status) : [...prev.selectedStatuses, status];

			const params = new URLSearchParams(searchParams?.toString() || '');

			params.delete('status');

			if (newStatuses.length > 0) {
				newStatuses.forEach((newStatus: EProposalStatus) => {
					params.append('status', newStatus);
				});
			} else {
				params.delete('status');
			}

			router.push(`?${params.toString()}`, { scroll: false });

			return {
				...prev,
				selectedStatuses: newStatuses
			};
		});
	};

	const handleTagToggle = (tag: string) => {
		setState((prev) => {
			const newTags = prev.selectedTags.includes(tag) ? prev.selectedTags.filter((tags) => tags !== tag) : [...prev.selectedTags, tag];

			const params = new URLSearchParams(searchParams?.toString() || '');

			params.delete('tags');

			newTags.forEach((newTag) => {
				params.append('tags', newTag);
			});

			router.push(`?${params.toString()}`, { scroll: false });

			return {
				...prev,
				selectedTags: newTags
			};
		});
	};

	const renderHeader = () => (
		<div className={styles.header}>
			<div>
				<h1 className={styles.title}>
					{proposalType === EProposalType.REFERENDUM_V2 && !origin ? t('ListingPage.AllProposals') : t(`ListingPage.${origin || proposalType}`)} ({listingData?.totalCount || 0})
				</h1>
				{proposalType !== EProposalType.REFERENDUM_V2 && !origin && <p className={`${styles.subtitle} dark:text-white`}>{t(`ListingPage.${origin || proposalType}Description`)}</p>}
			</div>
			<Link
				href={
					!user?.id
						? `/login?nextUrl=create${proposalType === EProposalType.DISCUSSION ? '/discussion' : ''}`
						: `/create${proposalType === EProposalType.DISCUSSION ? '/discussion' : ''}`
				}
				className={styles.button}
			>
				<span className='text-xl'>+</span>
				<span className='whitespace-nowrap text-sm'>{t(`CreateProposalDropdownButton.create${proposalType === EProposalType.DISCUSSION ? 'Post' : 'Proposal'}`)}</span>
			</Link>
		</div>
	);

	const renderFilterContent = () => (
		<div className='p-4'>
			<h3 className='text-sm font-semibold uppercase text-wallet_btn_text'>{t('CreateProposalDropdownButton.status')}</h3>
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
						<span className='text-sm text-wallet_btn_text'>{status}</span>
					</span>
				))}
			</div>

			<h3 className='mt-4 text-sm font-semibold text-wallet_btn_text'>{t('CreateProposalDropdownButton.tags')}</h3>
			<div className='relative mt-2'>
				<input
					type='text'
					placeholder='Search'
					value={state.tagSearchTerm}
					onChange={(e) => setState((prev) => ({ ...prev, tagSearchTerm: e.target.value }))}
					className={styles.searchbar}
				/>
				<MdSearch className='absolute right-3 top-1/2 -translate-y-1/2 transform text-wallet_btn_text' />
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
						<span className='flex items-center gap-1 text-sm text-wallet_btn_text'>
							<IoMdTrendingUp /> {tag}
						</span>
					</span>
				))}
			</div>
		</div>
	);

	return (
		<div>
			<div className='bg-section_dark_overlay'>
				<div className={styles.container}>
					{renderHeader()}
					<div className={styles.tabs}>
						<div className='flex gap-x-2'>
							{Object.entries(tabNames).map(([key, value]) => (
								<button
									key={key}
									type='button'
									className={`${styles['tab-button']} uppercase ${state.activeTab === key ? styles['tab-button-active'] : ''}`}
									onClick={() => setState((prev) => ({ ...prev, activeTab: key as EListingTabState }))}
								>
									{value}
								</button>
							))}
						</div>
						<div className='flex gap-4 text-sm text-gray-700'>
							<Popover onOpenChange={(open) => setState((prev) => ({ ...prev, filterActive: open }))}>
								<PopoverTrigger asChild>
									<div
										className={`${styles.filter} ${state.filterActive ? 'bg-gray-200 text-navbar_border' : ''}`}
										role='button'
										tabIndex={0}
									>
										<span className={state.filterActive ? styles.selectedicon : ''}>
											<FaFilter className='text-sm text-text_primary' />
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
						</div>
					</div>
				</div>
			</div>
			<div className={styles.content}>
				<div>
					{state.activeTab === EListingTabState.INTERNAL_PROPOSALS ? (
						<ListingTab
							data={listingData?.items || []}
							totalCount={listingData?.totalCount || 0}
							currentPage={state.currentPage}
						/>
					) : proposalType === EProposalType.REFERENDUM_V2 ? (
						<TrackAnalytics origin={origin} />
					) : (
						<ExternalTab />
					)}
				</div>
			</div>
		</div>
	);
}

export default ListingPage;
