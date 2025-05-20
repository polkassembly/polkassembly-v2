// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import TurndownService from 'turndown';
import { convertMarkdownToHtml } from './convertMarkdownToHtml';

/**
 * Converts Markdown content to plain text using marked and Turndown.
 * @param markdown - The Markdown string to convert.
 * @returns A plain text version of the content.
 */
export function markdownToPlainText(markdown: string): string {
	// Convert Markdown to HTML
	const htmlContent = convertMarkdownToHtml(markdown);

	// Convert HTML to plain text using Turndown with rules stripped
	const turndownService = new TurndownService({ headingStyle: 'setext' });

	// Remove all formatting by stripping any remaining markdown
	turndownService.remove('a'); // remove links
	turndownService.remove('img'); // remove images
	turndownService.remove('code'); // remove inline code
	turndownService.remove('pre'); // remove code blocks

	const strippedMarkdown = turndownService.turndown(htmlContent);

	// Final plain text cleanup
	return strippedMarkdown
		.replace(/[*_~`>#-]+/g, '') // remove markdown leftover symbols
		.replace(/\s{2,}/g, ' ') // collapse extra spaces
		.replace(/\n{2,}/g, '\n') // remove multiple newlines
		.trim();
}
