// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import React, { useState } from 'react';
import { EListingTab, EPostOrigin, EProposalStatus, EProposalType, IGenericListingResponse, IPostListing } from '@/_shared/types';
import { Popover, PopoverTrigger, PopoverContent } from '@ui/Popover/Popover';
import { useSearchParams, useRouter } from 'next/navigation';
import { FaFilter } from '@react-icons/all-files/fa/FaFilter';
import { useTranslations } from 'next-intl';
import { useUser } from '@/hooks/useUser';
import Link from 'next/link';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { useQuery } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import { ValidatorService } from '@/_shared/_services/validator_service';
import ListingTab from '../ListingTab/ListingTab';
import styles from './ListingPage.module.scss';

const AdBanner = dynamic(() => import('../../AdBanner/AdBanner'), { ssr: false });
const TrackAnalytics = dynamic(() => import('../TrackAnalytics/TrackAnalytics'), { ssr: false });
const ExternalTab = dynamic(() => import('../ExternalTab'), { ssr: false });

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

function ListingHeader({
	proposalType,
	origin,
	listingData,
	userId
}: {
	proposalType: EProposalType;
	origin?: EPostOrigin;
	listingData?: IGenericListingResponse<IPostListing>;
	userId?: number;
}) {
	const t = useTranslations();

	return (
		<div className={styles.header}>
			<div>
				<h1 className={styles.title}>
					{proposalType === EProposalType.REFERENDUM_V2 && !origin ? t('ListingPage.AllProposals') : t(`ListingPage.${origin || proposalType}`)} ({listingData?.totalCount || 0})
				</h1>
				{proposalType !== EProposalType.REFERENDUM_V2 && !origin && <p className={`${styles.subtitle} dark:text-white`}>{t(`ListingPage.${origin || proposalType}Description`)}</p>}
			</div>
			<Link
				href={
					!ValidatorService.isValidNumber(userId)
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
}

function FilterContent({
	proposalType,
	selectedStatuses,
	handleStatusToggle
}: {
	proposalType: EProposalType;
	selectedStatuses: EProposalStatus[];
	handleStatusToggle: (status: string) => void;
}) {
	const t = useTranslations();
	const STATUSES = getStatuses(proposalType)?.map((status) => t(`ListingPage_Status.${status}`));

	return (
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
							checked={selectedStatuses.some((s) => t(`ListingPage_Status.${s}`) === status)}
							onChange={() => handleStatusToggle(status)}
						/>
						<span className='text-sm text-wallet_btn_text'>{status}</span>
					</span>
				))}
			</div>
		</div>
	);
}

function ListingPage({ proposalType, origin, initialData, statuses, page }: ListingPageProps) {
	const router = useRouter();
	const t = useTranslations();
	const searchParams = useSearchParams();
	const { user } = useUser();

	const fetchListingData = async () => {
		const { data, error } = await NextApiClientService.fetchListingData({ proposalType, page, statuses, origins: origin ? [origin] : undefined, skipCache: true });
		if (error || !data || !data.items) {
			console.log(error?.message || 'Failed to fetch listing data');
			return initialData;
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
				selectedStatuses: newStatuses,
				// Reset the page to 1 when a new status is selected
				currentPage: 1
			};
		});
	};

	return (
		<div>
			<div className='bg-section_dark_overlay'>
				<div className={styles.container}>
					<ListingHeader
						proposalType={proposalType}
						origin={origin}
						listingData={listingData}
						userId={user?.id}
					/>
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
									<FilterContent
										proposalType={proposalType}
										selectedStatuses={state.selectedStatuses}
										handleStatusToggle={handleStatusToggle}
									/>
								</PopoverContent>
							</Popover>
						</div>
					</div>
				</div>
			</div>
			<AdBanner />
			<div className={styles.content}>
				<div>
					{state.activeTab === EListingTabState.INTERNAL_PROPOSALS ? (
						<div className='relative'>
							<ListingTab
								data={listingData?.items || []}
								totalCount={listingData?.totalCount || 0}
								currentPage={state.currentPage}
							/>
						</div>
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
