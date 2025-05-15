// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import TurndownService from 'turndown';
import { gfm } from '@joplin/turndown-plugin-gfm';

/**
 * Checks if the input text is likely already in Markdown format
 * @param text The text to check
 * @returns Boolean indicating if text is likely markdown
 */
function isLikelyMarkdown(text: string): boolean {
	// If the content has complex HTML structure (more than just simple inline tags)
	// it's probably not pure markdown with occasional HTML
	const hasComplexHtml = /<(div|span|p|table|tr|td|th|ul|ol|li|header|footer|nav)[^>]*>/i.test(text);
	if (hasComplexHtml) return false;

	// Check for HTML doctype or complete HTML document structure
	const isFullHtmlDocument = /<!DOCTYPE|<html|<body|<head/i.test(text);
	if (isFullHtmlDocument) return false;

	// Look for common markdown patterns
	const commonMarkdownPatterns = [
		/^#+\s+.+$/m, // Headers
		/\[.+\]\(.+\)/, // Links
		/\*\*.+\*\*/, // Bold
		/_.+_/, // Italic
		/```[\s\S]*```/, // Code blocks
		/^\s*[-*+]\s+.+$/m, // List items
		/^\s*\d+\.\s+.+$/m, // Numbered list
		/^\s*>\s+.+$/m, // Blockquotes
		/!\[.+\]\(.+\)/, // Images
		/^\s*---\s*$/m, // Horizontal rules
		/~~.+~~/, // Strikethrough
		/`[^`]+`/, // Inline code
		/^\|.+\|$/m // Tables
	];

	// If it matches any markdown patterns, assume it's markdown
	// (which might include some HTML tags like <u> that are allowed in GFM)
	return commonMarkdownPatterns.some((pattern) => pattern.test(text));
}

/**
 * Converts HTML to Markdown with support for tables and GitHub Flavored Markdown features
 * If the input is already in Markdown format, returns it without conversion
 * @param html The HTML string to convert
 * @returns The converted Markdown string
 */
export function htmlToMarkdown(html: string): string {
	try {
		// If input is already likely markdown, return it as is
		if (isLikelyMarkdown(html)) {
			return html;
		}

		const turndownService = new TurndownService({
			bulletListMarker: '-',
			codeBlockStyle: 'fenced',
			emDelimiter: '_',
			headingStyle: 'atx',
			hr: '---',
			strongDelimiter: '**'
		});

		turndownService.use(gfm);

		// Custom rule for video elements
		turndownService.addRule('video', {
			filter: ['video'],
			replacement(content: string, node: TurndownService.Node) {
				if (node.nodeType !== 1) return content;
				const element = node as unknown as HTMLVideoElement;
				const source = element.querySelector('source');
				const src = source?.getAttribute('src') || element.getAttribute('src') || '';
				const width = element.getAttribute('width') || '';
				const height = element.getAttribute('height') || '';
				const dimensions = width && height ? ` width="${width}" height="${height}"` : '';
				return `<video controls${dimensions}>\n  <source src="${src}" />\n</video>`;
			}
		});

		// Custom rule for underline elements
		turndownService.addRule('underline', {
			filter: ['u', 'ins'],
			replacement(content: string) {
				return `<u>${content}</u>`;
			}
		});

		// Custom rule for spans with text-decoration:underline
		turndownService.addRule('underlineSpan', {
			filter: ['span'],
			replacement(content: string, node: TurndownService.Node) {
				if (node.nodeType !== 1) return content;
				const element = node as unknown as HTMLElement;
				const style = element.getAttribute('style');
				if (style && style.includes('text-decoration:underline')) {
					return `<u>${content}</u>`;
				}
				return content;
			}
		});

		return turndownService.turndown(html);
	} catch (error) {
		console.error('Error converting HTML to Markdown:', error);
		return '';
	}
}
