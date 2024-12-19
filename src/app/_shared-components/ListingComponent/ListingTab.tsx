// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import React from 'react';
import { IListingResponse } from '@/_shared/types';
import ListingCard from './ListingCard';

interface ListingTabProps {
	data: Array<IListingResponse>;
	currentPage: number;
	setCurrentPage: (page: number) => void;
}

function ListingTab({ data, currentPage, setCurrentPage }: ListingTabProps) {
	const renderPagination = () => (
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
	);

	const renderListingCards = () =>
		data.map((item, idx) => {
			const backgroundColor = idx % 2 === 0 ? '#fbfbfb' : '#FFFFFF';

			const onChainInfo = {
				createdAt: item.onChainInfo?.createdAt || 'N/A',
				proposer: item.onChainInfo?.proposer || 'Unknown Proposer',
				origin: item.onChainInfo?.origin || 'Unknown Origin'
			};

			return (
				<div
					key={item.id || `${item.proposalType}-${item.onChainInfo?.createdAt}-${idx}`}
					className={`border-b border-primary_border ${idx === data.length - 1 ? 'border-none' : ''} relative transform cursor-pointer transition-transform duration-300 ease-in-out hover:z-10 hover:shadow-lg`}
				>
					<ListingCard
						backgroundColor={backgroundColor}
						title={item.title}
						onChainInfo={onChainInfo}
						index={item.index}
					/>
				</div>
			);
		});

	return (
		<div>
			<div className='overflow-hidden rounded-xl bg-white shadow-lg'>{data.length > 0 ? renderListingCards() : <p className='text-center text-gray-500'>No data available</p>}</div>
			{data.length > 0 && renderPagination()}
		</div>
	);
}

export default ListingTab;
