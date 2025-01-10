// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isValidEditorJsBlock(block: any): boolean {
	return block && typeof block === 'object' && typeof block.type === 'string' && typeof block.data === 'object';
}
