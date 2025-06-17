// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { marked } from 'marked';
import TurndownService from 'turndown';

export function markdownToPlainText(markdown: string): string {
	if (!markdown) return '';

	// First convert markdown to HTML
	const html = marked.parse(markdown, { async: false }) as string;

	// Then convert HTML to plain text using Turndown
	const turndownService = new TurndownService({
		headingStyle: 'atx',
		codeBlockStyle: 'fenced',
		bulletListMarker: '-',
		emDelimiter: '_'
	});

	// Convert HTML to plain text
	const plainText = turndownService.turndown(html);

	// Clean up any remaining HTML tags and extra whitespace
	return plainText
		.replace(/<[^>]*>/g, '')
		.replace(/\n{3,}/g, '\n\n')
		.trim();
}
