// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { EDITOR_JS_VERSION } from '@/_shared/_constants/editorJsVersion';
import { convertHtmlToEditorJs } from '@/app/_client-utils/convertHtmlToEditorJs';
import { OutputBlockData, OutputData } from '@editorjs/editorjs';
import { JSDOM } from 'jsdom';

export function convertHtmlToEditorJsServer(html: string): OutputData {
	if (typeof window !== 'undefined') {
		return convertHtmlToEditorJs(html);
	}

	// Ensure HTML has proper structure
	const wrappedHtml = html.trim().startsWith('<html>') ? html : `<html><body>${html}</body></html>`;

	// Create DOM with configured options
	const dom = new JSDOM(wrappedHtml, {
		runScripts: 'outside-only',
		pretendToBeVisual: true
	});
	const doc = dom.window.document;

	const blocks: OutputBlockData[] = [];

	// Process each element in the body
	doc.body.childNodes.forEach((node) => {
		if (node.nodeType === 1) {
			const element = node as HTMLElement;

			switch (element.tagName.toLowerCase()) {
				case 'p':
					blocks.push({
						type: 'paragraph',
						data: {
							text: element.innerHTML
						}
					});
					break;
				case 'h1':
				case 'h2':
				case 'h3':
				case 'h4':
				case 'h5':
				case 'h6':
					blocks.push({
						type: 'header',
						data: {
							text: element.innerHTML,
							level: parseInt(element.tagName[1], 10)
						}
					});
					break;
				case 'ul':
				case 'ol':
					blocks.push({
						type: 'list',
						data: {
							style: element.tagName.toLowerCase() === 'ul' ? 'unordered' : 'ordered',
							items: Array.from(element.children).map((li) => li.innerHTML)
						}
					});
					break;
				case 'img':
					blocks.push({
						type: 'image',
						data: {
							url: (element as HTMLImageElement).src,
							caption: element.getAttribute('alt') || ''
						}
					});
					break;
				default:
					break;
				// Add more cases as needed
			}
		}
	});

	return {
		blocks,
		time: Date.now(),
		version: EDITOR_JS_VERSION
	};
}
