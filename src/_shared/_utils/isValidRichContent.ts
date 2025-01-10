// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { isValidEditorJsBlock } from '@/_shared/_utils/isValidEditorJsBlock';

export function isValidRichContent(content: string | Record<string, unknown>): boolean {
	return (
		(typeof content === 'string' && content.length > 0 && Boolean(content)) ||
		(Boolean(content) &&
			typeof content === 'object' &&
			'blocks' in content &&
			Array.isArray(content.blocks) &&
			'version' in content &&
			'time' in content &&
			content.blocks.every(isValidEditorJsBlock))
	);
}
