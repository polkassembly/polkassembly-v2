// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { ITag } from '@/_shared/types';
import classes from './PostTags.module.scss';

function getTagValue(tag: ITag | string): string {
	if (typeof tag === 'string') return tag;
	const firstProp = Object.values(tag)[0];
	return typeof firstProp === 'string' ? firstProp : '';
}

function PostTags({ tags }: { tags: ITag[] | string[] }) {
	const totalTags = tags.length;
	const maxVisible = 2;

	let visibleTags = tags;
	let hiddenCount = 0;

	if (totalTags >= 3) {
		visibleTags = tags.slice(0, maxVisible);
		hiddenCount = totalTags - maxVisible;
	}

	return (
		<div className='flex items-center gap-x-2'>
			{visibleTags.map((tag) => (
				<div
					key={getTagValue(tag)}
					className={classes.tag}
				>
					{getTagValue(tag)}
				</div>
			))}
			{hiddenCount > 0 && <div className={classes.tag}>+{hiddenCount}</div>}
		</div>
	);
}

export default PostTags;
