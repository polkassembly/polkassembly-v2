// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import { ITag } from '@/_shared/types';
import classes from './PostTags.module.scss';

function PostTags({ tags }: { tags: ITag[] }) {
	return (
		<div className='flex items-center gap-x-2'>
			{tags.map((tag) => (
				<div
					key={tag.value}
					className={classes.tag}
				>
					{tag.value}
				</div>
			))}
		</div>
	);
}

export default PostTags;
