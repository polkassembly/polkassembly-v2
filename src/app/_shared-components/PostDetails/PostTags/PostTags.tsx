// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';
import classes from './PostTags.module.scss';

function PostTags({ tags }: { tags: string[] }) {
	if (!tags?.length) return null;

	return (
		<div
			className='flex items-center gap-x-2'
			aria-label='Post Tags'
		>
			{tags.map((tag) => (
				<span
					key={tag}
					className={classes.tag}
				>
					{tag}
				</span>
			))}
		</div>
	);
}

export default PostTags;
