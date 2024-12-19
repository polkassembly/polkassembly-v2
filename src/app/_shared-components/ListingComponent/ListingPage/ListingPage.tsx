// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import queryService from '@/app/_client-services/api_query_service';
import { IListingResponse } from '@/_shared/types';
import { Popover, PopoverTrigger, PopoverContent } from '@ui/Popover/Popover';
import { BiSort } from 'react-icons/bi';
import { FaFilter } from 'react-icons/fa6';
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
						<Popover>
							<PopoverTrigger asChild>
								<p className={styles.filter}>
									Filter <FaFilter />
								</p>
							</PopoverTrigger>
							<PopoverContent
								sideOffset={5}
								className={styles.popoverContent}
							>
								<div className='p-4'>
									<h3 className='text-sm font-bold'>Status</h3>
									<ul className='mt-2 space-y-1'>
										<li>
											<label>
												<input
													type='checkbox'
													className='mr-2'
												/>{' '}
												Cancelled
											</label>
										</li>
										<li>
											<label>
												<input
													type='checkbox'
													className='mr-2'
												/>{' '}
												Confirmed
											</label>
										</li>
										<li>
											<label>
												<input
													type='checkbox'
													className='mr-2'
												/>{' '}
												Confirm Aborted
											</label>
										</li>
										<li>
											<label>
												<input
													type='checkbox'
													className='mr-2'
												/>{' '}
												Confirm Started
											</label>
										</li>
									</ul>
									<h3 className='mt-4 text-sm font-bold'>Tags</h3>
									<div className='relative mt-2'>
										<input
											type='text'
											placeholder='Search'
											className='w-full rounded border px-2 py-1'
										/>
									</div>
									<ul className='mt-2 space-y-1'>
										<li>
											<label>
												<input
													type='checkbox'
													className='mr-2'
												/>{' '}
												Abc
											</label>
										</li>
										<li>
											<label>
												<input
													type='checkbox'
													className='mr-2'
												/>{' '}
												Xyz
											</label>
										</li>
									</ul>
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
