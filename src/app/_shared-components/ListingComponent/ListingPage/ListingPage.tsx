// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import queryService from '@/app/_client-services/api_query_service';
import { EProposalStatus, IListingResponse } from '@/_shared/types';
import { Popover, PopoverTrigger, PopoverContent } from '@ui/Popover/Popover';
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
}

function ListingPage({ proposalType }: ListingPageProps) {
	const [activeTab, setActiveTab] = useState<'polkassembly' | 'external'>('polkassembly');
	const [currentPage, setCurrentPage] = useState(1);
	const [filterActive, setFilterActive] = useState(false);
	const [tagSearchTerm, setTagSearchTerm] = useState('');
	const [selectedTags, setSelectedTags] = useState<string[]>([]);

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

	const tags = ['Abc', 'Xyz', 'Network', 'Governance', 'Proposal', 'Test'];

	const filteredTags = tags.filter((tag) => tag.toLowerCase().includes(tagSearchTerm.toLowerCase()));

	const {
		data: polkassemblyData,
		error: polkassemblyError,
		isLoading: polkassemblyLoading
	} = useQuery<IListingResponse[]>({
		queryKey: ['polkassemblyReferenda', proposalType, currentPage],
		queryFn: () => queryService.fetchListingData(proposalType, currentPage),
		enabled: activeTab === 'polkassembly'
	});

	const data = Array.isArray(polkassemblyData) ? polkassemblyData : [];
	const error = activeTab === 'polkassembly' ? polkassemblyError : null;
	const isLoading = activeTab === 'polkassembly' ? polkassemblyLoading : false;

	const toggleTag = (tag: string) => {
		setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
	};

	if (error instanceof Error) return <p>Error: {error.message}</p>;

	const totalCount = data.length;

	return (
		<div>
			<div className={styles.container}>
				<div className={styles.header}>
					<div>
						<h1 className={styles.title}>Onchain Referenda ({totalCount})</h1>
						<p className={styles.subtitle}>A space to share insights, provide feedback, and collaborate on ideas that impact the network.</p>
					</div>
					<button
						type='button'
						className={styles.button}
					>
						<span className='text-xl'>+</span> <span className='text-sm'>Create Post</span>
					</button>
				</div>
				<div className={styles.tabs}>
					<div className='flex space-x-6'>
						<button
							type='button'
							className={`${styles['tab-button']} ${activeTab === 'polkassembly' ? styles['tab-button-active'] : ''}`}
							onClick={() => setActiveTab('polkassembly')}
						>
							POLKASSEMBLY
						</button>
						<button
							type='button'
							className={`${styles['tab-button']} ${activeTab === 'external' ? styles['tab-button-active'] : ''}`}
							onClick={() => setActiveTab('external')}
						>
							EXTERNAL
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
									Filter
								</div>
							</PopoverTrigger>
							<PopoverContent
								sideOffset={5}
								className={styles.popoverContent}
							>
								<div className='p-4'>
									<h3 className='text-text_dropdown text-sm font-semibold'>STATUS</h3>
									<div className='mt-2 max-h-28 space-y-1 overflow-y-auto'>
										{statuses.map((status, index) => (
											<span
												key={index}
												className='flex items-center'
											>
												<input
													type='checkbox'
													className='mr-2'
												/>
												<span className='text-text_dropdown text-sm'>{status}</span>
											</span>
										))}
									</div>

									<h3 className='text-text_dropdown mt-4 text-sm font-semibold'>Tags</h3>
									<div className='relative mt-2'>
										<input
											type='text'
											placeholder='Search'
											value={tagSearchTerm}
											onChange={(e) => setTagSearchTerm(e.target.value)}
											className='bg-search_bg text-text_dropdown w-full rounded border border-primary_border bg-opacity-[20%] px-2 py-1 pr-10'
										/>
										<MdSearch className='text-text_dropdown absolute right-3 top-1/2 -translate-y-1/2 transform' />
									</div>

									<div className='mt-2 max-h-24 space-y-1 overflow-y-auto'>
										{filteredTags.map((tag, index) => (
											<span
												key={index}
												className='flex items-center'
											>
												<input
													type='checkbox'
													className='mr-2'
													checked={selectedTags.includes(tag)}
													onChange={() => toggleTag(tag)}
												/>
												<span className='text-text_dropdown flex items-center gap-1 text-sm'>
													<IoMdTrendingUp /> {tag}
												</span>
											</span>
										))}
									</div>
								</div>
							</PopoverContent>
						</Popover>
						<p className={styles.filter}>
							Sort By <BiSort />
						</p>
					</div>
				</div>
			</div>
			<div className={styles.content}>
				{isLoading ? (
					<LoadingSpinner />
				) : (
					<div>
						{activeTab === 'polkassembly' ? (
							<ListingTab
								data={data}
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
