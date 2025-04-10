// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { IPostListing } from '@/_shared/types';
import { DEFAULT_LISTING_LIMIT } from '@/_shared/_constants/listingLimit';
import { useTranslations } from 'next-intl';
import styles from './ListingTab.module.scss';
import ListingCard from '../ListingCard/ListingCard';
import { PaginationWithLinks } from '../../PaginationWithLinks';

interface ListingTabProps {
	data: Array<IPostListing>;
	currentPage: number;
	totalCount: number;
}

function ListingTab({ data, currentPage, totalCount }: ListingTabProps) {
	const t = useTranslations();

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
			<div className='mt-5'>
				<PaginationWithLinks
					page={currentPage}
					pageSize={DEFAULT_LISTING_LIMIT}
					totalCount={totalCount}
					pageSearchParam='page'
				/>
			</div>
		</div>
	);
}

export default ListingTab;
