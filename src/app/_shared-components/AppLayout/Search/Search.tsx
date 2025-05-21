// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

/* eslint-disable @typescript-eslint/no-explicit-any */

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@ui/Dialog/Dialog';
import { liteClient as algoliasearch } from 'algoliasearch/lite';
import { Configure, InstantSearch } from 'react-instantsearch';
import { useState, memo } from 'react';
import { ESearchType } from '@/_shared/types';
import { searchEnabledNetworks } from '@/_shared/_constants/searchConstants';
import { useSearchConfig } from '@/hooks/useSearchConfig';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { useTranslations } from 'next-intl';
import { getSharedEnvVars } from '@/_shared/_utils/getSharedEnvVars';
import { Search as SearchIcon } from 'lucide-react';
import CustomSearchBox from './CustomSearchBox';
import SearchFilters from './SearchFilters';
import SearchResults from './SearchResults';
import styles from './Search.module.scss';

const { NEXT_PUBLIC_ALGOLIA_APP_ID, NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY } = getSharedEnvVars();

const algoliaClient = algoliasearch(NEXT_PUBLIC_ALGOLIA_APP_ID, NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY);

// To prevent initial load of all data
const searchClient = {
	...algoliaClient,
	search(requests: any) {
		if (requests.every(({ params }: any) => !params.query)) {
			return Promise.resolve({
				results: requests.map(() => ({
					hits: [],
					nbHits: 0,
					nbPages: 0,
					page: 0,
					processingTimeMS: 0,
					hitsPerPage: 0,
					exhaustiveNbHits: false,
					query: '',
					params: ''
				}))
			});
		}

		return algoliaClient.search(requests);
	}
};

function Search() {
	const [activeIndex, setActiveIndex] = useState<ESearchType>(ESearchType.POSTS);
	const [searchContext, setSearchContext] = useState<string | null>(null);
	const network = getCurrentNetwork();

	const { networkFilterQuery, postFilterQuery, indexName } = useSearchConfig({ network, activeIndex: searchContext && searchContext.length > 2 ? activeIndex : null });

	const handleTypeChange = (type: ESearchType) => setActiveIndex(type);
	const t = useTranslations('Search');
	return (
		<Dialog>
			<DialogTrigger
				className='text-text_primary'
				asChild
			>
				<SearchIcon className='h-6 w-6 cursor-pointer hover:text-text_pink' />
			</DialogTrigger>
			<DialogContent className={`${searchEnabledNetworks.includes(network.toUpperCase()) ? 'w-full max-w-screen-md md:max-w-4xl' : 'max-w-lg'} rounded-lg px-6 pt-4`}>
				<DialogHeader>
					<DialogTitle className={styles.search_dialog_title}>
						{t('search')}
						{searchContext && (
							<span>
								{t('resultsFor')}: &quot;{searchContext.slice(0, 30)}&quot;
							</span>
						)}
					</DialogTitle>
				</DialogHeader>

				{searchEnabledNetworks.includes(network.toUpperCase()) ? (
					<InstantSearch
						searchClient={searchClient}
						indexName={indexName}
						insights
					>
						<Configure
							hitsPerPage={10}
							distinct
							filters={`${networkFilterQuery}${postFilterQuery}`.trim()}
						/>

						<div>
							<CustomSearchBox onSearch={setSearchContext} />
							<SearchFilters
								activeIndex={activeIndex}
								onChange={handleTypeChange}
							/>
						</div>

						<div className='w-full'>
							<SearchResults activeIndex={activeIndex} />
						</div>
					</InstantSearch>
				) : (
					<p className='pb-5 text-center text-sm font-medium text-btn_secondary_text'>
						{t('enableSearchAndSuperSearch')}
						<a
							href='mailto:hello@polkassembly.io'
							className='text-bg_pink'
						>
							hello@polkassembly.io
						</a>
					</p>
				)}
			</DialogContent>
		</Dialog>
	);
}

export default memo(Search);
