// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { IoIosSearch } from 'react-icons/io';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@ui/Dialog/Dialog';
import { Input } from '@ui/Input';
import Image from 'next/image';
import { liteClient as algoliasearch } from 'algoliasearch/lite';
import { Configure, Highlight, Hits, InstantSearch, RefinementList, SearchBox, Pagination, Index, useInstantSearch, useSearchBox } from 'react-instantsearch';
import searchGif from '@assets/search/search.gif';
import PaLogo from '../PaLogo';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

const ALGOLIA_APP_ID = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID;
const ALGOLIA_SEARCH_API_KEY = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY;
const searchClient = algoliasearch(ALGOLIA_APP_ID || '', ALGOLIA_SEARCH_API_KEY || '');

interface Post {
	objectID: string;
	title: string;
	content: string;
	post_type: 'on-chain-posts' | 'off-chain-posts';
	created_at: number;
	track?: number;
	tags?: string[];
	network?: string;
}

interface User {
	objectID: string;
	username: string;
	profile?: {
		bio?: string;
		title?: string;
	};
}

function PostHit({ hit }: { hit: Post }) {
	return (
		<article className='cursor-pointer rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800'>
			<h2 className='text-lg font-medium'>
				<Highlight
					attribute='title'
					hit={hit}
				/>
			</h2>
			<p className='mt-2 text-sm text-gray-600 dark:text-gray-300'>
				<Highlight
					attribute='content'
					hit={hit}
				/>
			</p>
			<div className='mt-2 flex flex-wrap gap-2'>
				{hit.post_type && <span className='rounded bg-pink-100 px-2 py-1 text-xs text-pink-800'>{hit.post_type === 'on-chain-posts' ? 'On-chain' : 'Off-chain'}</span>}
				{hit.network && <span className='rounded bg-blue-100 px-2 py-1 text-xs text-blue-800'>{hit.network}</span>}
				{hit.tags?.map((tag) => (
					<span
						key={tag}
						className='rounded bg-gray-100 px-2 py-1 text-xs text-gray-800'
					>
						{tag}
					</span>
				))}
			</div>
		</article>
	);
}
function UserHit({ hit }: { hit: User }) {
	return (
		<article className='cursor-pointer rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800'>
			<h2 className='text-lg font-medium'>
				<Highlight
					attribute='username'
					hit={hit as any}
				/>
			</h2>
			{hit.profile?.bio && (
				<p className='mt-2 text-sm text-gray-600 dark:text-gray-300'>
					<Highlight
						attribute='profile.bio'
						hit={hit as any}
					/>
				</p>
			)}
		</article>
	);
}

function SearchResults({ activeIndex }: { activeIndex: 'posts' | 'users' }) {
	return (
		<div className='flex h-[600px] flex-col'>
			<div className='flex-1 overflow-auto'>
				{activeIndex === 'posts' ? (
					<Index indexName='polkassembly_posts'>
						<div className='space-y-4'>
							<Hits hitComponent={PostHit} />
						</div>
						<div className='sticky bottom-0 mt-4 border-t bg-white p-4 dark:bg-gray-900'>
							<Pagination />
						</div>
					</Index>
				) : (
					<Index indexName='polkassembly_users'>
						<div className='space-y-4'>
							<Hits hitComponent={UserHit} />
						</div>
						<div className='sticky bottom-0 mt-4 border-t bg-white p-4 dark:bg-gray-900'>
							<Pagination />
						</div>
					</Index>
				)}
			</div>
		</div>
	);
}

export default function Search() {
	const [activeIndex, setActiveIndex] = useState<'posts' | 'users'>('posts');

	return (
		<Dialog>
			<DialogTrigger asChild>
				<IoIosSearch className='cursor-pointer text-2xl text-text_primary' />
			</DialogTrigger>
			<DialogContent className='w-full max-w-4xl rounded-lg px-6 pt-4'>
				<DialogHeader>
					<DialogTitle className='text-xl font-bold text-btn_secondary_text'>Search</DialogTitle>
				</DialogHeader>

				<InstantSearch
					searchClient={searchClient}
					indexName={activeIndex === 'posts' ? 'polkassembly_posts' : 'polkassembly_users'}
					insights
				>
					<Configure
						hitsPerPage={10}
						distinct
					/>

					<div className='mb-6'>
						<SearchBox
							placeholder='Type at least 3 characters to search...'
							classNames={{
								root: 'w-full',
								form: 'relative',
								input: 'w-full rounded-md border-pink-500 p-2 pr-10',
								submit: 'absolute right-2 top-1/2 -translate-y-1/2',
								submitIcon: 'text-xl text-pink-500',
								loadingIndicator: 'absolute right-10 top-1/2 -translate-y-1/2'
							}}
						/>
					</div>

					<div className='grid grid-cols-[200px_1fr] gap-6'>
						<div className='space-y-6'>
							<div>
								<h3 className='mb-2 font-medium'>Search In</h3>
								<div className='flex flex-col gap-2'>
									<button
										type='button'
										className={`rounded-md px-3 py-2 text-left text-sm ${activeIndex === 'posts' ? 'bg-pink-100 text-pink-800' : 'text-gray-600 hover:bg-gray-100'}`}
										onClick={() => setActiveIndex('posts')}
									>
										Posts
									</button>
									<button
										type='button'
										className={`rounded-md px-3 py-2 text-left text-sm ${activeIndex === 'users' ? 'bg-pink-100 text-pink-800' : 'text-gray-600 hover:bg-gray-100'}`}
										onClick={() => setActiveIndex('users')}
									>
										Users
									</button>
								</div>
							</div>

							{activeIndex === 'posts' && (
								<>
									<div>
										<h3 className='mb-2 font-medium'>Post Type</h3>
										<RefinementList
											attribute='post_type'
											classNames={{
												list: 'space-y-2',
												label: 'flex items-center gap-2',
												checkbox: 'rounded border-gray-300',
												count: 'ml-auto text-sm text-gray-500'
											}}
										/>
									</div>

									<div>
										<h3 className='mb-2 font-medium'>Networks</h3>
										<RefinementList
											attribute='network'
											classNames={{
												list: 'space-y-2',
												label: 'flex items-center gap-2',
												checkbox: 'rounded border-gray-300',
												count: 'ml-auto text-sm text-gray-500'
											}}
										/>
									</div>

									<div>
										<h3 className='mb-2 font-medium'>Tags</h3>
										<RefinementList
											attribute='tags'
											classNames={{
												list: 'space-y-2',
												label: 'flex items-center gap-2',
												checkbox: 'rounded border-gray-300',
												count: 'ml-auto text-sm text-gray-500'
											}}
										/>
									</div>
								</>
							)}
						</div>

						<SearchResults activeIndex={activeIndex} />
					</div>
				</InstantSearch>
			</DialogContent>
		</Dialog>
	);
}
