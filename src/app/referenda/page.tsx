// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useQuery } from '@tanstack/react-query';
import React, { useState } from 'react';
import PolkassemblyTab from '../_shared-components/ProposalTabs/PolkassemblyTab';
import ExternalTab from '../_shared-components/ProposalTabs/ExternalTab';
import { LoadingSpinner } from '../_shared-components/LoadingSpinner';

async function fetchPolkassemblyReferenda() {
	const response = await fetch('/api/v2/ReferendumV2?page=1&limit=10', {
		headers: { 'Content-Type': 'application/json', 'x-network': 'rococo' }
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
	onChainInfo: {
		createdAt: string;
		proposer: string;
		status: string;
		description: string;
	};
}

function ReferendaPage() {
	const [activeTab, setActiveTab] = useState<'polkassembly' | 'external'>('polkassembly');

	const {
		data: polkassemblyData,
		error: polkassemblyError,
		isLoading: polkassemblyLoading
	} = useQuery<Referendum[]>({
		queryKey: ['polkassemblyReferenda'],
		queryFn: fetchPolkassemblyReferenda,
		enabled: activeTab === 'polkassembly'
	});

	const data = activeTab === 'polkassembly' ? polkassemblyData : [];
	const error = activeTab === 'polkassembly' ? polkassemblyError : null;
	const isLoading = activeTab === 'polkassembly' ? polkassemblyLoading : false;

	if (error instanceof Error) return <p>Error: {error.message}</p>;

	const totalCount = data?.length || 0;

	return (
		<div className='container mx-auto px-4 py-8'>
			<div className='mb-6 flex items-center justify-between'>
				<div>
					<h1 className='text-2xl font-bold'>Discussions ({totalCount})</h1>
					<p className='text-sm text-gray-600'>A space to share insights, provide feedback, and collaborate on ideas that impact the network.</p>
				</div>
				<button
					type='button'
					className='rounded bg-pink-500 px-4 py-2 text-white shadow'
				>
					+ Create Post
				</button>
			</div>

			<div className='mb-4 flex space-x-6 border-b'>
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

			{isLoading && <LoadingSpinner />}
			{activeTab === 'polkassembly' ? <PolkassemblyTab data={data || []} /> : <ExternalTab />}
		</div>
	);
}

export default ReferendaPage;
