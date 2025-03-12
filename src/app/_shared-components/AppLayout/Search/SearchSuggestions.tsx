// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Highlight, useInstantSearch } from 'react-instantsearch';

function SearchSuggestions({ query }: { query: string }) {
	const { results } = useInstantSearch();

	if (query.length < 3 || !results.hits.length) return null;

	return (
		<div className='absolute top-full z-50 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800'>
			<div className='max-h-60 overflow-auto p-2'>
				{results.hits.slice(0, 5).map((hit: any) => (
					<div
						key={hit.objectID}
						className='cursor-pointer rounded-md p-2 hover:bg-gray-100 dark:hover:bg-gray-700'
					>
						<Highlight
							attribute={hit.title ? 'title' : 'username'}
							hit={hit}
						/>
					</div>
				))}
			</div>
		</div>
	);
}

export default SearchSuggestions;
