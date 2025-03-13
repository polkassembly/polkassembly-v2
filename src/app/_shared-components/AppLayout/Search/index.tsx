// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { IoIosSearch } from 'react-icons/io';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@ui/Dialog/Dialog';
import { liteClient as algoliasearch } from 'algoliasearch/lite';
import { Configure, InstantSearch } from 'react-instantsearch';
import { useState, memo } from 'react';
import { ESearchType } from '@/_shared/types';
import { useSearchConfig } from '@/hooks/useSearchConfig';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { useTranslations } from 'next-intl';
import CustomSearchBox from './CustomSearchBox';
import Filters from './Filters';
import SearchResults from './SearchResults';
import styles from './Search.module.scss';

const ALGOLIA_APP_ID = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID ?? '';
const ALGOLIA_SEARCH_API_KEY = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY ?? '';
const searchClient = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_SEARCH_API_KEY);

function Search() {
	const [activeIndex, setActiveIndex] = useState<ESearchType | null>(null);
	const [searchContext, setSearchContext] = useState<string | null>(null);
	const [isSuperSearch, setIsSuperSearch] = useState(false);
	const network = getCurrentNetwork();

	const { networkFilter, getPostTypeFilter, indexName } = useSearchConfig(isSuperSearch, network, activeIndex);

	const handleTypeChange = (type: ESearchType | null) => setActiveIndex(type);
	const handleSuperSearch = () => setIsSuperSearch(true);

	const t = useTranslations('Search');

	return (
		<Dialog>
			<DialogTrigger asChild>
				<IoIosSearch className='cursor-pointer text-2xl text-text_primary' />
			</DialogTrigger>
			<DialogContent className='w-full max-w-4xl rounded-lg px-6 pt-4'>
				<DialogHeader>
					<DialogTitle className={styles.search_dialog_title}>
						{isSuperSearch ? t('superSearch') : t('search')}
						{searchContext && (
							<span>
								{t('resultsFor')}: &quot;{searchContext.slice(0, 30)}&quot;
							</span>
						)}
					</DialogTitle>
				</DialogHeader>

				<InstantSearch
					searchClient={searchClient}
					indexName={indexName}
					insights
				>
					<Configure
						hitsPerPage={10}
						distinct
						filters={`${networkFilter}${getPostTypeFilter}`.trim()}
					/>

					<div>
						<CustomSearchBox
							onSearch={setSearchContext}
							onTypeChange={handleTypeChange}
						/>
						<Filters
							activeIndex={activeIndex}
							onChange={handleTypeChange}
							isSuperSearch={isSuperSearch}
						/>
					</div>

					<div className='w-full'>
						<SearchResults
							activeIndex={activeIndex}
							onSuperSearch={handleSuperSearch}
							isSuperSearch={isSuperSearch}
						/>
					</div>
				</InstantSearch>
			</DialogContent>
		</Dialog>
	);
}

export default memo(Search);
