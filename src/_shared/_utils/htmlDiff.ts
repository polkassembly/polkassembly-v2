// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { diffWords } from 'diff';
import striptags from 'striptags';
import removeMd from 'remove-markdown';

export function removeSymbols(input: string | undefined): string {
	if (!input) return '';
	return removeMd(striptags(String(input)));
}

export function generateDiffHtml(originalHtml: string, modifiedHtml: string) {
	const diff = diffWords(originalHtml, modifiedHtml);

	const escapeHtml = (s: string) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');

	let diffHtml = '';
	diff.forEach((part) => {
		if (part.added) {
			diffHtml += `<span class="diff-added">${escapeHtml(part.value)}</span>`;
		} else if (part.removed) {
			diffHtml += `<span class="diff-removed">${escapeHtml(part.value)}</span>`;
		} else {
			diffHtml += escapeHtml(part.value);
		}
	});
	return diffHtml;
}
