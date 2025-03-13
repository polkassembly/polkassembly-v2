// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ESearchDiscussionType, ESearchType } from '@/_shared/types';
import { useInstantSearch } from 'react-instantsearch';
import styles from './Search.module.scss';

interface SearchHit {
	objectID: string;
	title?: string;
	username?: string;
	profile?: {
		bio?: string;
	};
	post_type?: ESearchDiscussionType;
}

function SearchSuggestions({ query, onSuggestionClick }: { query: string; onSuggestionClick: (value: string, type: ESearchType) => void }) {
	const { results } = useInstantSearch();

	if (query.length < 3 || !results.hits.length) return null;
	const handleClick = (hit: SearchHit) => {
		const value = hit.title || hit.username || '';
		let type: ESearchType;

		if (hit.username && hit.profile) {
			type = ESearchType.USERS;
		} else if (hit.post_type === ESearchDiscussionType.DISCUSSIONS || hit.post_type === ESearchDiscussionType.GRANTS) {
			type = ESearchType.DISCUSSIONS;
		} else {
			type = ESearchType.POSTS;
		}

		onSuggestionClick(value, type);
	};

	return (
		<div className={styles.search_suggestions_wrapper}>
			<div className={styles.search_suggestions_list}>
				{results.hits.slice(0, 5).map((hit: SearchHit) => (
					<button
						type='button'
						key={hit.objectID}
						className={styles.search_suggestions_item}
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
