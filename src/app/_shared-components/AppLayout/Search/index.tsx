// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { IoIosSearch } from 'react-icons/io';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@ui/Dialog/Dialog';
import { Input } from '@ui/Input';
import Image from 'next/image';
import { liteClient as algoliasearch } from 'algoliasearch/lite';
import { Highlight, Hits, InstantSearch, RefinementList, SearchBox } from 'react-instantsearch';
import searchGif from '@assets/search/search.gif';
import PaLogo from '../PaLogo';

const ALGOLIA_APP_ID = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID;
const ALGOLIA_SEARCH_API_KEY = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY;
const algoliaClient = algoliasearch(ALGOLIA_APP_ID || '', ALGOLIA_SEARCH_API_KEY || '');
// const allowedNetwork = ['KUSAMA', 'POLKADOT', 'POLKADEX', 'CERE', 'MOONBEAM', 'MOONRIVER', 'MOONBASE'];
// const AUTOCOMPLETE_INDEX_LIMIT = 5;

// interface IAutocompleteResults {
// 	posts: { [index: string]: any }[];
// 	users: { [index: string]: any }[];
// }

// const initAutocompleteResults: IAutocompleteResults = {
// 	posts: [],
// 	users: []
// };

// interface Props {
// 	className?: string;
// 	openModal: boolean;
// 	setOpenModal: (pre: boolean) => void;
// 	isSuperSearch: boolean;
// 	setIsSuperSearch: (pre: boolean) => void;
// 	theme?: string;
// }

function Hit({ hit }: { hit: any }) {
	console.log('hit', hit);
	return (
		<article>
			<h1>
				<Highlight
					attribute='name'
					hit={hit}
				/>
			</h1>
			<p>${hit.price}</p>
		</article>
	);
}

export enum EFilterBy {
	Referenda = 'on-chain-posts',
	People = 'people',
	Discussions = 'off-chain-posts'
}

export enum EMultipleCheckFilters {
	Tracks = 'track',
	Tags = 'tags',
	Topic = 'topic',
	Chain = 'chains'
}

export enum EDateFilter {
	Today = 'today',
	Last_7_days = 'last_7_days',
	Last_30_days = 'last_30_days',
	Last_3_months = 'last_3_months'
}

const gov1Tracks = ['tips', 'council_motions', 'bounties', 'child_bounties', 'treasury_proposals', 'democracy_proposals', 'tech_committee_proposals', 'referendums'];

function Search() {
	// const userIndex = algoliaClient.initIndex('polkassembly_users');
	// const postIndex = algoliaClient.initIndex('polkassembly_posts');
	// const addressIndex = algoliaClient?.initIndex('polkassembly_addresses');

	// console.log(userIndex, postIndex, addressIndex);
	return (
		<Dialog>
			<DialogTrigger asChild>
				<IoIosSearch className='cursor-pointer text-2xl text-text_primary' />
			</DialogTrigger>
			<DialogContent className='w-full max-w-4xl rounded-lg px-6 pt-4'>
				<DialogHeader>
					<DialogTitle className='text-xl font-bold text-btn_secondary_text'>Search</DialogTitle>
				</DialogHeader>
				<div>
					<div className='relative'>
						<Input
							className='border-bg_pink pr-10 placeholder:text-text_primary'
							placeholder='Type here to search for something'
						/>
						<div className='absolute right-0 top-1/2 h-10 -translate-y-1/2 rounded-r-md bg-bg_pink p-2'>
							<IoIosSearch className='text-xl text-white' />
						</div>
					</div>
					<InstantSearch
						searchClient={algoliaClient}
						indexName='polkassembly_users'
						insights
					>
						<SearchBox />
						<RefinementList attribute='brand' />
						<Hits hitComponent={Hit} />
					</InstantSearch>
					<div className='mt-8 flex h-[360px] flex-col items-center justify-center text-sm font-medium text-btn_secondary_text'>
						<Image
							src={searchGif}
							alt='search-icon'
							width={274}
							height={274}
							className='-my-[40px]'
							priority
						/>
						<span className='mt-8 text-center tracking-[0.01em]'>Welcome to the all new & supercharged search!</span>
						<div className='mt-2 flex items-center gap-1 text-xs font-medium tracking-[0.01em]'>
							powered by
							<PaLogo className='h-[30px] w-[99px]' />
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}

export default Search;
