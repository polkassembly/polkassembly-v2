// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import React from 'react';
import { IPostListing } from '@/_shared/types';
import styles from './ListingTab.module.scss';
import ListingCard from '../ListingCard/ListingCard';

interface ListingTabProps {
	data: Array<IPostListing>;
	currentPage: number;
	setCurrentPage: (page: number) => void;
}

function ListingTab({ data, currentPage, setCurrentPage }: ListingTabProps) {
	const renderPagination = () => (
		<div className={styles.pagination}>
			{[1, 2, 3, 4, 5].map((page) => (
				<button
					key={page}
					type='button'
					className={`${styles['page-button']} ${page === currentPage ? styles['page-button-active'] : ''}`}
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
				createdAt: item.onChainInfo?.createdAt ? new Date(item.onChainInfo.createdAt).toISOString() : 'N/A',
				proposer: item.onChainInfo?.proposer || 'Unknown Proposer',
				origin: item.onChainInfo?.origin || 'Unknown Origin'
			};

			return (
				<div
					key={item.id || `${item.proposalType}-${item.onChainInfo?.createdAt}-${idx}`}
					className={`${styles['listing-item']} ${idx === (data?.length ?? 0) - 1 ? styles['listing-item-last'] : ''}`}
				>
					<ListingCard
						backgroundColor={backgroundColor}
						title={item.title || 'Untitled'}
						onChainInfo={onChainInfo}
						index={item.index ?? 0}
					/>
				</div>
			);
		});

	return (
		<div>
			<div className={styles['listing-container']}>{data?.length > 0 ? renderListingCards() : <p className={styles['no-data']}>No data available</p>}</div>
			{data?.length > 0 && renderPagination()}
		</div>
	);
}

export default ListingTab;
