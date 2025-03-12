// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { IoIosSearch } from 'react-icons/io';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@ui/Dialog/Dialog';
import { liteClient as algoliasearch } from 'algoliasearch/lite';
import { Configure, InstantSearch } from 'react-instantsearch';
import { useState, useEffect } from 'react';
import CustomSearchBox from './CustomSearchBox';
import Filters from './Filters';
import SearchResults from './SearchResults';

const ALGOLIA_APP_ID = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID;
const ALGOLIA_SEARCH_API_KEY = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY;
const searchClient = algoliasearch(ALGOLIA_APP_ID || '', ALGOLIA_SEARCH_API_KEY || '');

export default function Search() {
	const [activeIndex, setActiveIndex] = useState<'posts' | 'users' | 'discussions' | null>(null);
	const [searchContext, setSearchContext] = useState<string | null>(null);
	const [selectedIndex, setSelectedIndex] = useState<'posts' | 'users' | 'discussions' | null>(null);

	useEffect(() => {
		if (selectedIndex !== activeIndex) {
			setActiveIndex(selectedIndex);
		}
	}, [selectedIndex]);

	return (
		<Dialog>
			<DialogTrigger asChild>
				<IoIosSearch className='cursor-pointer text-2xl text-text_primary' />
			</DialogTrigger>
			<DialogContent className='w-full max-w-4xl rounded-lg px-6 pt-4'>
				<DialogHeader>
					<DialogTitle className='flex items-baseline gap-2 text-xl font-bold text-btn_secondary_text'>
						Search
						{searchContext && <span>Results for: &quot;{searchContext.slice(0, 30)}&quot;</span>}
					</DialogTitle>
				</DialogHeader>

				<InstantSearch
					searchClient={searchClient}
					indexName={activeIndex === 'posts' ? 'polkassembly_posts' : 'polkassembly_users'}
					insights
				>
					<Configure
						hitsPerPage={10}
						distinct
						filters={activeIndex === 'posts' ? 'NOT post_type:discussions AND NOT post_type:grants' : undefined}
					/>

					<div className='mb-6'>
						<CustomSearchBox onSearch={setSearchContext} />
						<Filters
							activeIndex={activeIndex}
							onChange={setSelectedIndex}
						/>
					</div>

					<div className='w-full'>
						<SearchResults activeIndex={activeIndex} />
					</div>
				</InstantSearch>
			</DialogContent>
		</Dialog>
	);
}
