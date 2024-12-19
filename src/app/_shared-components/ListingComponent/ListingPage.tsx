// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import queryService from '@/app/_client-services/api_query_service';
import { IListingResponse } from '@/_shared/types';
import { FaFilter } from 'react-icons/fa6';
import { BiSort } from 'react-icons/bi';
import { LoadingSpinner } from '../LoadingSpinner';
import ListingTab from './ListingTab';
import ExternalTab from './ExternalTab';

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
			<div className='container mx-auto bg-white px-4 pt-8'>
				<div className='bg-h flex items-center justify-between'>
					<div>
						<h1 className='text-2xl font-bold'>Onchain Referenda ({totalCount})</h1>
						<p className='text-sm text-gray-600'>A space to share insights, provide feedback, and collaborate on ideas that impact the network.</p>
					</div>
					<button
						type='button'
						className='flex items-center gap-1.5 rounded-full bg-pink-500 px-6 py-2 text-white shadow'
					>
						<span className='text-xl'>+</span> <span className='text-sm'>Create Post</span>
					</button>
				</div>
				<div className='mt-5 flex items-center justify-between'>
					<div className='flex space-x-6'>
						<button
							type='button'
							className={`pb-3 ${activeTab === 'polkassembly' ? 'border-b-2 border-pink-500 text-pink-500' : 'text-gray-500'}`}
							onClick={() => setActiveTab('polkassembly')}
						>
							POLKASSEMBLY
						</button>
						<button
							type='button'
							className={`pb-3 ${activeTab === 'external' ? 'border-b-2 border-pink-500 text-pink-500' : 'text-gray-500'}`}
							onClick={() => setActiveTab('external')}
						>
							EXTERNAL
						</button>
					</div>
					<div className='flex gap-4 pb-3 text-sm text-sidebar_text'>
						<p className='flex cursor-pointer items-center gap-1 rounded-lg px-3 py-2 hover:bg-gray-200'>
							Filter <FaFilter />
						</p>
						<p className='flex cursor-pointer items-center gap-1 rounded-lg px-3 py-2 hover:bg-gray-200'>
							Sort By <BiSort />
						</p>
					</div>
				</div>
			</div>
			<div className='w-full bg-[#F5F6F8] px-10 py-5'>
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
