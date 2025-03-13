// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { IoIosSearch } from 'react-icons/io';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@ui/Dialog/Dialog';
import { liteClient as algoliasearch } from 'algoliasearch/lite';
import { Configure, InstantSearch } from 'react-instantsearch';
import { useMemo, useState } from 'react';
import { ESearchType } from '@/_shared/types';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import CustomSearchBox from './CustomSearchBox';
import Filters from './Filters';
import SearchResults from './SearchResults';
import { allowedNetwork } from '@/_shared/_constants/searchConstants';

const ALGOLIA_APP_ID = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID;
const ALGOLIA_SEARCH_API_KEY = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY;
const searchClient = algoliasearch(ALGOLIA_APP_ID || '', ALGOLIA_SEARCH_API_KEY || '');

export default function Search() {
	const [activeIndex, setActiveIndex] = useState<ESearchType | null>(null);
	const [searchContext, setSearchContext] = useState<string | null>(null);
	const [isSuperSearch, setIsSuperSearch] = useState(false);
	const network = getCurrentNetwork();

	const networkFilter = useMemo(() => {
		if (activeIndex === ESearchType.USERS) {
			return '';
		}

		if (isSuperSearch) {
			return allowedNetwork.map((network) => `network:${network}`).join(' OR ');
		}
		return `network:${network}`;
	}, [isSuperSearch, network, activeIndex]);

	return (
		<Dialog>
			<DialogTrigger asChild>
				<IoIosSearch className='cursor-pointer text-2xl text-text_primary' />
			</DialogTrigger>
			<DialogContent className='w-full max-w-4xl rounded-lg px-6 pt-4'>
				<DialogHeader>
					<DialogTitle className='flex items-baseline gap-2 text-xl font-bold text-btn_secondary_text'>
						{isSuperSearch ? 'Super Search' : 'Search'}
						{searchContext && <span>Results for: &quot;{searchContext.slice(0, 30)}&quot;</span>}
					</DialogTitle>
				</DialogHeader>

				<InstantSearch
					searchClient={searchClient}
					indexName={activeIndex === ESearchType.USERS ? 'polkassembly_users' : 'polkassembly_posts'}
					insights
				>
					<Configure
						hitsPerPage={10}
						distinct
						filters={`${networkFilter}${
							activeIndex === ESearchType.POSTS
								? networkFilter
									? ' AND (NOT post_type:discussions AND NOT post_type:grants)'
									: 'NOT post_type:discussions AND NOT post_type:grants'
								: activeIndex === ESearchType.DISCUSSIONS
									? networkFilter
										? ' AND (post_type:discussions OR post_type:grants)'
										: 'post_type:discussions OR post_type:grants'
									: ''
						}`.trim()}
					/>

					<div>
						<CustomSearchBox
							onSearch={setSearchContext}
							onTypeChange={(type: ESearchType | null) => setActiveIndex(type)}
						/>
						<Filters
							activeIndex={activeIndex}
							onChange={(type: ESearchType | null) => setActiveIndex(type)}
							isSuperSearch={isSuperSearch}
						/>
					</div>

					<div className='w-full'>
						<SearchResults
							activeIndex={activeIndex}
							onSuperSearch={() => setIsSuperSearch(true)}
							isSuperSearch={isSuperSearch}
						/>
					</div>
				</InstantSearch>
			</DialogContent>
		</Dialog>
	);
}
