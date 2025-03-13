// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useInstantSearch } from 'react-instantsearch';

interface SearchHit {
	objectID: string;
	title?: string;
	username?: string;
	post_type?: 'discussions' | 'grants';
}

function SearchSuggestions({ query, onSuggestionClick }: { query: string; onSuggestionClick: (value: string, type: 'posts' | 'users' | 'discussions') => void }) {
	const { results } = useInstantSearch();

	if (query.length < 3 || !results.hits.length) return null;
	const handleClick = (hit: SearchHit) => {
		const value = hit.title || hit.username || '';
		let type: 'posts' | 'users' | 'discussions';

		if (hit.username) {
			type = 'users';
		} else if (hit.post_type === 'discussions' || hit.post_type === 'grants') {
			type = 'discussions';
		} else {
			type = 'posts';
		}

		onSuggestionClick(value, type);
	};

	return (
		<div className='absolute top-full z-50 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800'>
			<div className='max-h-60 w-full overflow-auto p-2'>
				{results.hits.slice(0, 5).map((hit: SearchHit) => (
					<button
						type='button'
						key={hit.objectID}
						className='w-full cursor-pointer rounded-md p-2 text-start hover:bg-gray-100 dark:hover:bg-gray-700'
						onClick={() => handleClick(hit)}
						onMouseDown={(e) => e.preventDefault()}
					>
						<p>{hit.title || hit.username}</p>
					</button>
				))}
			</div>
		</div>
	);
}

export default SearchSuggestions;
