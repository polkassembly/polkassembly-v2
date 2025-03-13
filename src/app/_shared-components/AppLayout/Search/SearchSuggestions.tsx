// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ESearchType } from '@/_shared/types';
import { useInstantSearch } from 'react-instantsearch';

enum ESearchDiscussionType {
	DISCUSSIONS = 'discussions',
	GRANTS = 'grants'
}
interface SearchHit {
	objectID: string;
	title?: string;
	username?: string;
	post_type?: ESearchDiscussionType;
}

function SearchSuggestions({ query, onSuggestionClick }: { query: string; onSuggestionClick: (value: string, type: ESearchType) => void }) {
	const { results } = useInstantSearch();

	if (query.length < 3 || !results.hits.length) return null;
	const handleClick = (hit: SearchHit) => {
		const value = hit.title || hit.username || '';
		let type: ESearchType;

		if (hit.username) {
			type = ESearchType.USERS;
		} else if (hit.post_type === ESearchDiscussionType.DISCUSSIONS || hit.post_type === ESearchDiscussionType.GRANTS) {
			type = ESearchType.DISCUSSIONS;
		} else {
			type = ESearchType.POSTS;
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
