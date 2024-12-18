// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useQuery } from '@tanstack/react-query';
import React, { useState } from 'react';
import { LoadingSpinner } from '../LoadingSpinner';
import ListingTab from '../ProposalTabs/ListingTab';
import ExternalTab from '../ProposalTabs/ExternalTab';

async function fetchListingData(proposalType: string, page: number) {
	const response = await fetch(`/api/v2/${proposalType}?page=${page}&limit=10`, {
		headers: { 'Content-Type': 'application/json', 'x-network': 'polkadot' }
	});

	if (!response.ok) {
		throw new Error('Network response was not ok');
	}

	return response.json();
}

interface Referendum {
	id: string;
	proposalType: string;
	network: string;
	title: string;
	index: number;
	onChainInfo: {
		createdAt: string;
		proposer: string;
		status: string;
		description: string;
		origin: string;
	};
}

interface ListingPageProps {
	proposalType: string;
}

function ListingPage({ proposalType }: ListingPageProps) {
	const [activeTab, setActiveTab] = useState<'polkassembly' | 'external'>('polkassembly');
	const [currentPage, setCurrentPage] = useState(1); // New state for current page

	const {
		data: polkassemblyData,
		error: polkassemblyError,
		isLoading: polkassemblyLoading
	} = useQuery<Referendum[]>({
		queryKey: ['polkassemblyReferenda', proposalType, currentPage], // Include currentPage in the query key
		queryFn: () => fetchListingData(proposalType, currentPage),
		enabled: activeTab === 'polkassembly'
	});

	const data = activeTab === 'polkassembly' ? polkassemblyData : [];
	const error = activeTab === 'polkassembly' ? polkassemblyError : null;
	const isLoading = activeTab === 'polkassembly' ? polkassemblyLoading : false;

	if (error instanceof Error) return <p>Error: {error.message}</p>;

	const totalCount = data?.length || 0;

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

				<div className='mt-5 flex space-x-6'>
					<button
						type='button'
						className={`pb-2 ${activeTab === 'polkassembly' ? 'border-b-2 border-pink-500 text-pink-500' : 'text-gray-500'}`}
						onClick={() => setActiveTab('polkassembly')}
					>
						Polkassembly
					</button>
					<button
						type='button'
						className={`pb-2 ${activeTab === 'external' ? 'border-b-2 border-pink-500 text-pink-500' : 'text-gray-500'}`}
						onClick={() => setActiveTab('external')}
					>
						External
					</button>
				</div>
			</div>
			<div className='w-full bg-[#F5F6F8] px-10 py-5'>
				{isLoading ? (
					<LoadingSpinner />
				) : (
					<div>
						{activeTab === 'polkassembly' ? (
							<ListingTab
								data={data || []}
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
