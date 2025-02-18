// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { getPageNumbers } from '@/app/_client-utils/getPageNumber';
import { IPostListing } from '@/_shared/types';
import { DEFAULT_LISTING_LIMIT } from '@/_shared/_constants/listingLimit';
import { useTranslations } from 'next-intl';
import styles from './ListingTab.module.scss';
import ListingCard from '../ListingCard/ListingCard';

interface ListingTabProps {
	data: Array<IPostListing>;
	currentPage: number;
	totalCount: number;
	setCurrentPage: (page: number) => void;
}

function ListingTab({ data, currentPage, setCurrentPage, totalCount }: ListingTabProps) {
	const totalPages = Math.ceil(totalCount / DEFAULT_LISTING_LIMIT);
	const t = useTranslations();

	const renderPagination = () => (
		<div className={styles.pagination}>
			<button
				type='button'
				className={`${styles.page_button} ${currentPage === 1 ? styles.disabled : ''}`}
				onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
				disabled={currentPage === 1}
			>
				&lt;
			</button>
			{getPageNumbers(totalPages, currentPage).map((page) => (
				<button
					key={page}
					type='button'
					className={`${styles.page_button} ${page === currentPage ? styles.page_button_active : ''}`}
					onClick={() => setCurrentPage(page)}
				>
					{page}
				</button>
			))}
			<button
				type='button'
				className={`${styles.page_button} ${currentPage === totalPages ? styles.disabled : ''}`}
				onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
				disabled={currentPage === totalPages}
			>
				&gt;
			</button>
		</div>
	);

	const renderListingCards = () =>
		data.slice(0, DEFAULT_LISTING_LIMIT).map((item, idx) => {
			const backgroundColor = idx % 2 === 0 ? 'bg-listing_card1' : 'bg-section_dark_overlay';

			return (
				<div
					key={item.id || `${item.proposalType}-${item.onChainInfo?.createdAt}-${idx}`}
					className={`${styles.listing_item} ${idx === Math.min(DEFAULT_LISTING_LIMIT - 1, (data?.length ?? 0) - 1) ? styles.listing_item_last : ''}`}
				>
					<ListingCard
						backgroundColor={backgroundColor}
						title={item.title || 'Untitled'}
						data={item}
						proposalType={item.proposalType}
						metrics={item.metrics}
						index={item.index ?? 0}
					/>
				</div>
			);
		});

	return (
		<div>
			<div className={styles.listing_container}>{data?.length > 0 ? renderListingCards() : <p className={styles.no_data}>{t('CreateProposalDropdownButton.noData')}</p>}</div>
			{totalCount > DEFAULT_LISTING_LIMIT && renderPagination()}
		</div>
	);
}

export default ListingTab;
