// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import React from 'react';
import ListingCard from '../ListingCard/ListingCard';

interface ListingTabProps {
	data: Array<{
		id: string;
		proposalType: string;
		title: string;
		index: number;
		network: string;
		onChainInfo: {
			createdAt: string;
			proposer: string;
			status: string;
			description: string;
			origin: string;
		};
	}>;
	currentPage: number;
	setCurrentPage: (page: number) => void;
}

function ListingTab({ data, currentPage, setCurrentPage }: ListingTabProps) {
	return (
		<div>
			<div className='overflow-hidden rounded-xl bg-white shadow-lg'>
				{data?.map((item, idx) => {
					const backgroundColor = idx % 2 === 0 ? '#fbfbfb' : '#FFFFFF';
					return (
						<div
							key={item.id || `${item.proposalType}-${item.onChainInfo.createdAt}-${idx}`}
							className={`border-b border-primary_border ${idx === data.length - 1 ? 'border-none' : ''}`}
						>
							<ListingCard
								backgroundColor={backgroundColor}
								{...item}
							/>
						</div>
					);
				})}
			</div>

			<div className='mt-6 flex items-center justify-center space-x-2'>
				{[1, 2, 3, 4, 5].map((page) => (
					<button
						key={page}
						type='button'
						className={`rounded-lg border-2 px-4 py-2 ${page === currentPage ? 'border-navbar_border text-navbar_border' : 'border-[#CED4DE] text-[#334D6E]'}`}
						onClick={() => setCurrentPage(page)}
					>
						{page}
					</button>
				))}
			</div>
		</div>
	);
}

export default ListingTab;
