// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import TurndownService from 'turndown';
import { gfm } from 'turndown-plugin-gfm';

/**
 * Converts HTML to Markdown with support for tables and GitHub Flavored Markdown features
 * @param html The HTML string to convert
 * @returns The converted Markdown string
 */
export function htmlToMarkdown(html: string): string {
	try {
		const turndownService = new TurndownService({
			bulletListMarker: '-',
			codeBlockStyle: 'fenced',
			emDelimiter: '_',
			headingStyle: 'atx',
			hr: '---',
			strongDelimiter: '**'
		});

		// Use the GitHub Flavored Markdown plugin
		turndownService.use(gfm);

		// Custom rule for tables to ensure proper formatting
		turndownService.addRule('tableCell', {
			filter: ['th', 'td'],
			replacement(content: string, node: TurndownService.Node) {
				if (node.nodeType !== 1) return content;
				const element = node as unknown as HTMLTableCellElement;
				const index = element.cellIndex;
				const prefix = index === 0 ? '| ' : '';
				return `${prefix}${content.trim()} |`;
			}
		});

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
