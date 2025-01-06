// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { OutputData } from '@editorjs/editorjs';

export function decodeEditorJsDataFromFirestore(data: OutputData) {
	const { blocks } = data;
	if (!blocks || !blocks.length) return data;
	const newBlocks = blocks.map((block) => {
		if (!block || block.type !== 'table') return block;
		const newContent = Object.keys(block.data.content).map((k) => {
			return [k, block.data.content[`${k}`]];
		});
		return {
			...block,
			data: {
				...block.data,
				content: newContent
			}
		};
	});
	return { ...data, blocks: newBlocks };
}
