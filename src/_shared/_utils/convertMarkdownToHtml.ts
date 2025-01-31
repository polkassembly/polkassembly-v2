// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { marked } from 'marked';

export function convertMarkdownToHtml(markdown: string): string {
	try {
		// Configure marked options if needed
		marked.setOptions({
			breaks: true,
			gfm: true
		});

		if (!markdown) {
			return '';
		}

		return marked.parse(markdown, { async: false });
	} catch (error) {
		console.error('Error converting markdown to HTML:', error);
		return markdown;
	}
}
