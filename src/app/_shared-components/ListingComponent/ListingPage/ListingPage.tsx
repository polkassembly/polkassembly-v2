// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import React, { useState, useEffect } from 'react';
import { EProposalStatus, EProposalType, IPostListing } from '@/_shared/types';
import { Popover, PopoverTrigger, PopoverContent } from '@ui/Popover/Popover';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { BiSort } from 'react-icons/bi';
import { FaFilter } from 'react-icons/fa6';
import { MdSearch } from 'react-icons/md';
import { IoMdTrendingUp } from 'react-icons/io';
import { LoadingSpinner } from '../../LoadingSpinner';
import ListingTab from '../ListingTab/ListingTab';
import ExternalTab from '../ExternalTab';
import styles from './ListingPage.module.scss';

interface ListingPageProps {
	proposalType: string;
	origins?: string[];
	title?: string;
	description?: string;
}

function ListingPage({ proposalType, origins, title, description }: ListingPageProps) {
	const [activeTab, setActiveTab] = useState<'tab1' | 'tab2'>('tab1');
	const [currentPage, setCurrentPage] = useState(1);
	const [filterActive, setFilterActive] = useState(false);
	const [selectedStatuses, setSelectedStatuses] = useState<EProposalStatus[]>([]);
	const [tagSearchTerm, setTagSearchTerm] = useState('');
	const [selectedTags, setSelectedTags] = useState<string[]>([]);

	const tabNames = proposalType === EProposalType.DISCUSSION ? { tab1: 'POLKASSEMBLY', tab2: 'EXTERNAL' } : { tab1: 'REFERENDA', tab2: 'ANALYTICS' };

	const statuses = [
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

	const tags = ['bounty', 'treasury', 'smart contract', 'polkadot', 'Network', 'Governance', 'Proposal', 'Test'];
	const filteredTags = tags.filter((tag) => tag.toLowerCase().includes(tagSearchTerm.toLowerCase()));

	const [listingData, setListingData] = useState<IPostListing[]>([]);
	const [totalCount, setTotalCount] = useState<number>(0);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [error, setError] = useState<Error | null>(null);

	const fetchListingData = async () => {
		setIsLoading(true);
		const { data, error: dataError } = await NextApiClientService.fetchListingDataApi(proposalType, currentPage, selectedStatuses, origins, selectedTags);

		if (dataError) {
			setError(dataError);
			setIsLoading(false);
			return;
		}

		if (data) {
			setListingData(data?.posts || []);
			setTotalCount(data?.totalCount);
		}
		setIsLoading(false);
	};

	const toggleStatus = (status: EProposalStatus) => {
		setSelectedStatuses((prevStatuses) => (prevStatuses.includes(status) ? prevStatuses.filter((s) => s !== status) : [...prevStatuses, status]));
	};

	const toggleTag = (tag: string) => {
		setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
	};

	useEffect(() => {
		if (activeTab === 'tab1') {
			fetchListingData();
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedStatuses, activeTab, currentPage, selectedTags]);

	if (error) return <p>Error: {error.message}</p>;

	return (
		<div>
			<div className={styles.container}>
				<div className={styles.header}>
					<div>
						<h1 className={styles.title}>
							{title} ({totalCount})
						</h1>
						<p className={styles.subtitle}>{description}</p>
					</div>
					<button
						type='button'
						className={styles.button}
					>
						<span className='text-xl'>+</span> <span className='whitespace-nowrap text-sm'>Create Post</span>
					</button>
				</div>
				<div className={styles.tabs}>
					<div className='flex space-x-6'>
						<button
							type='button'
							className={`${styles['tab-button']} ${activeTab === 'tab1' ? styles['tab-button-active'] : ''}`}
							onClick={() => setActiveTab('tab1')}
						>
							{tabNames.tab1}
						</button>
						<button
							type='button'
							className={`${styles['tab-button']} ${activeTab === 'tab2' ? styles['tab-button-active'] : ''}`}
							onClick={() => setActiveTab('tab2')}
						>
							{tabNames.tab2}
						</button>
					</div>
					<div className='flex gap-4 pb-3 text-sm text-gray-700'>
						<Popover
							onOpenChange={(open) => {
								setFilterActive(open);
							}}
						>
							<PopoverTrigger asChild>
								<div
									className={`${styles.filter} ${filterActive ? 'bg-gray-200 text-navbar_border' : ''}`}
									role='button'
									tabIndex={0}
								>
									<span className={filterActive ? styles.selectedicon : ''}>
										<FaFilter />
									</span>
									<span className='hidden lg:block'>Filter</span>
								</div>
							</PopoverTrigger>
							<PopoverContent
								sideOffset={5}
								className={styles.popoverContent}
							>
								<div className='p-4'>
									<h3 className='text-sm font-semibold text-filter_dropdown'>STATUS</h3>
									<div className='mt-2 max-h-24 space-y-1 overflow-y-auto'>
										{statuses.map((status, index) => (
											<span
												// eslint-disable-next-line react/no-array-index-key
												key={index}
												className='flex items-center'
											>
												<input
													type='checkbox'
													className='mr-2'
													checked={selectedStatuses.includes(status)}
													onChange={() => toggleStatus(status)}
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
											value={tagSearchTerm}
											onChange={(e) => setTagSearchTerm(e.target.value)}
											className={styles.searchbar}
										/>
										<MdSearch className='absolute right-3 top-1/2 -translate-y-1/2 transform text-filter_dropdown' />
									</div>

									<div className='mt-2 max-h-24 space-y-1 overflow-y-auto'>
										{filteredTags.map((tag, index) => (
											<span
												// eslint-disable-next-line react/no-array-index-key
												key={index}
												className='flex items-center'
											>
												<input
													type='checkbox'
													className='mr-2'
													checked={selectedTags.includes(tag)}
													onChange={() => toggleTag(tag)}
												/>
												<span className='flex items-center gap-1 text-sm text-filter_dropdown'>
													<IoMdTrendingUp /> {tag}
												</span>
											</span>
										))}
									</div>
								</div>
							</PopoverContent>
						</Popover>
						<p className={styles.filter}>
							<span className='hidden lg:block'>Sort By</span> <BiSort />
						</p>
					</div>
				</div>
			</div>
			<div className={styles.content}>
				{isLoading ? (
					<LoadingSpinner />
				) : (
					<div>
						{activeTab === 'tab1' ? (
							<ListingTab
								data={listingData}
								totalCount={totalCount}
								currentPage={currentPage}
								setCurrentPage={setCurrentPage}
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
